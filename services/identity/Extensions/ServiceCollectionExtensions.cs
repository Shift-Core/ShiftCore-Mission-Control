using IdentityApi.Data;
using IdentityApi.DTOs;
using IdentityApi.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
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
                options.UseNpgsql(connectionString));
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
