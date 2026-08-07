using IdentityApi.Data;
using IdentityApi.DTOs;
using IdentityApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
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
                ?? "Host=localhost;Database=shiftcore_identity;Username=shiftcore;Password=shiftcore_pass";

            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(connectionString, npgsql =>
                    npgsql.MigrationsHistoryTable("__EFMigrationsHistory", "identity")));
        }

        public static void AddIdentityServices(this IServiceCollection services)
        {
            services.AddScoped<IAuthService, AuthService>();

            var configuration = services.BuildServiceProvider().GetRequiredService<IConfiguration>();
            var privateKeyPath = configuration["Jwt:PrivateKeyPath"];
            
            RsaSecurityKey? rsaKey = null;
            if (!string.IsNullOrEmpty(privateKeyPath) && File.Exists(privateKeyPath))
            {
                var rsa = RSA.Create();
                rsa.ImportFromPem(File.ReadAllText(privateKeyPath));
                rsaKey = new RsaSecurityKey(rsa);
            }

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.RequireHttpsMetadata = false; // Set to true in production
                    options.SaveToken = true;

                    if (rsaKey != null)
                    {
                        options.TokenValidationParameters = new TokenValidationParameters
                        {
                            ValidateIssuerSigningKey = true,
                            IssuerSigningKey = rsaKey,
                            ValidateIssuer = true,
                            ValidIssuer = configuration["Jwt:Issuer"] ?? "shiftcore-identity",
                            ValidateAudience = true,
                            ValidAudience = configuration["Jwt:Audience"] ?? "shiftcore-api",
                            ValidateLifetime = true,
                            ClockSkew = TimeSpan.Zero
                        };
                    }

                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = context =>
                        {
                            var cookieName = configuration["SC_TOKEN_COOKIE_NAME"] ?? "sc_token";
                            if (context.Request.Cookies.ContainsKey(cookieName))
                            {
                                context.Token = context.Request.Cookies[cookieName];
                            }
                            return Task.CompletedTask;
                        },
                        OnChallenge = context =>
                        {
                            context.HandleResponse();
                            context.Response.StatusCode = 401;
                            context.Response.ContentType = "application/json";
                            var error = new ApiErrorResponse
                            {
                                Message = "Validation failed",
                                ErrorCode = "AUTH_REQUIRED",
                                TraceId = context.HttpContext.TraceIdentifier
                            };
                            return context.Response.WriteAsJsonAsync(error);
                        }
                    };
                });

            services.AddAuthorization();
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen();
        }
    }
}
