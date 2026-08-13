using IdentityApi.Data;
using IdentityApi.DTOs;
using IdentityApi.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;

namespace IdentityApi.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static void AddIdentityInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? "Host=localhost;Database=shiftcore_identity;Username=shiftcore;Password=shiftcore_pass";

            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(connectionString, npgsql =>
                    // Pin the migration history table to the identity schema.
                    // Without this, EF looks in 'public' and tries to create the
                    // table again even though it already exists in 'identity'.
                    npgsql.MigrationsHistoryTable("__EFMigrationsHistory", "identity")));

            // Persist Data Protection keys to a stable directory so the sc_token
            // cookie remains valid across container restarts and through the gateway.
            var keysPath = configuration["DataProtection:KeysPath"]
                ?? "/app/dataprotection-keys";
            services.AddDataProtection()
                .PersistKeysToFileSystem(new DirectoryInfo(keysPath))
                .SetApplicationName("shiftcore-identity");
        }

        public static void AddIdentityServices(this IServiceCollection services)
        {
            services.AddScoped<IAuthService, AuthService>();

            services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
                .AddCookie(options =>
                {
                    options.Cookie.Name = "sc_token";
                    options.Cookie.HttpOnly = true;
                    options.Cookie.SameSite = SameSiteMode.Strict;
                    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;

                    options.Events.OnRedirectToLogin = context =>
                    {
                        context.Response.StatusCode = 401;
                        context.Response.ContentType = "application/json";
                        var error = new ApiErrorResponse
                        {
                            Message = "Validation failed",
                            ErrorCode = "AUTH_REQUIRED",
                            TraceId = context.HttpContext.TraceIdentifier
                        };
                        return context.Response.WriteAsJsonAsync(error);
                    };
                });

            services.AddAuthorization();
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen();
        }
    }
}
