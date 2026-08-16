using IdentityApi.Data;
using IdentityApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Security.Cryptography;

namespace IdentityApi.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static void AddIdentityInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? "Host=localhost;Database=shiftcore;Username=shiftcore;Password=shiftcore_pass";

            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(connectionString, npgsql =>
                    // Pin the migration history table to the identity schema.
                    // Without this, EF looks in 'public' and tries to create the
                    // table again even though it already exists in 'identity'.
                    npgsql.MigrationsHistoryTable("__EFMigrationsHistory", "identity")));

            // Persist Data Protection keys to a stable directory so cookie-based
            // DataProtection (used by the app framework) survives container restarts.
            var keysPath = configuration["DataProtection:KeysPath"] ?? "/app/dataprotection-keys";
            services.AddDataProtection()
                .PersistKeysToFileSystem(new DirectoryInfo(keysPath))
                .SetApplicationName("shiftcore-identity");
        }

        public static void AddIdentityServices(this IServiceCollection services, IConfiguration configuration)
        {
            // ── Application services ─────────────────────────────────────────
            services.AddScoped<IAuthService, AuthService>();
            services.AddSingleton<IJwtService, JwtService>();

            // ── JWT RS256 Bearer authentication ──────────────────────────────
            // Cookie name is sourced from environment, never hardcoded.
            var cookieName = configuration["SC_TOKEN_COOKIE_NAME"] ?? "sc_token";

            // Build the token validation parameters lazily so that startup does not
            // crash if the key file is not yet mounted (e.g., during the seed container
            // run before identity-keygen has fully written keys).
            // The key is resolved on the first actual token validation request.
            var issuer   = configuration["Jwt:Issuer"]   ?? "shiftcore-identity";
            var audience = configuration["Jwt:Audience"] ?? "shiftcore-api";

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.MapInboundClaims = false;
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        ValidateIssuer           = true,
                        ValidIssuer              = issuer,
                        ValidateAudience         = true,
                        ValidAudience            = audience,
                        ValidateLifetime         = true,
                        ClockSkew                = TimeSpan.FromSeconds(30),

                        // Lazy key resolver — reads the key from file on first validation call.
                        // This allows the seed container to start without the key file being present.
                        IssuerSigningKeyResolver = (_, _, _, _) =>
                        {
                            var path = configuration["Jwt:PrivateKeyPath"];
                            if (string.IsNullOrEmpty(path) || !File.Exists(path))
                                return [];

                            try
                            {
                                var pem = File.ReadAllText(path);
                                using var privateRsa = RSA.Create();
                                privateRsa.ImportFromPem(pem);

                                // Export only public parameters for validation — never expose private key.
                                var publicParams = privateRsa.ExportParameters(includePrivateParameters: false);
                                var publicRsa = RSA.Create();
                                publicRsa.ImportParameters(publicParams);
                                return [new RsaSecurityKey(publicRsa)];
                            }
                            catch
                            {
                                // If the key file is unreadable, return empty — token validation will fail
                                // with an appropriate 401 rather than a 500.
                                return [];
                            }
                        },
                    };

                    // ── Extract JWT from the sc_token HttpOnly cookie ─────────
                    // Clients must NOT manually set Authorization: Bearer.
                    // Nginx forwards the cookie from the browser to all backend services.
                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = context =>
                        {
                            var token = context.Request.Cookies[cookieName];
                            if (!string.IsNullOrEmpty(token))
                                context.Token = token;
                            return Task.CompletedTask;
                        },

                        // Return JSON 401 instead of a redirect for API consumers.
                        OnChallenge = context =>
                        {
                            context.HandleResponse();
                            context.Response.StatusCode  = StatusCodes.Status401Unauthorized;
                            context.Response.ContentType = "application/json";
                            return context.Response.WriteAsJsonAsync(new
                            {
                                success   = false,
                                message   = "Authentication required.",
                                errorCode = "AUTH_REQUIRED",
                                traceId   = context.HttpContext.TraceIdentifier,
                            });
                        },

                        // Return JSON 403 instead of empty body.
                        OnForbidden = context =>
                        {
                            context.Response.StatusCode  = StatusCodes.Status403Forbidden;
                            context.Response.ContentType = "application/json";
                            return context.Response.WriteAsJsonAsync(new
                            {
                                success   = false,
                                message   = "You do not have permission to perform this action.",
                                errorCode = "AUTH_FORBIDDEN",
                                traceId   = context.HttpContext.TraceIdentifier,
                            });
                        },
                    };
                });

            services.AddAuthorization();
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen();
        }
    }
}
