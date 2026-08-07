using IdentityApi.DTOs;
using IdentityApi.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Security.Claims;

namespace IdentityApi.Endpoints
{
    public static class AuthEndpoints
    {
        public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
        {
            var api = app.MapGroup("/api/identity/v1/auth");

            api.MapPost("/login", async (LoginRequest req, HttpContext context, IAuthService authService) =>
            {
                var (isSuccess, principal, userDto) = await authService.ValidateCredentialsAsync(req);

                if (!isSuccess || principal == null || userDto == null)
                {
                    return Results.Json(new ApiErrorResponse
                    {
                        Success = false,
                        Message = "Sign-in failed. Check your details or contact the workspace administrator.",
                        ErrorCode = "AUTH_INVALID",
                        TraceId = context.TraceIdentifier
                    }, statusCode: 401);
                }

                await context.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal, new AuthenticationProperties
                {
                    IsPersistent = true,
                    ExpiresUtc = DateTimeOffset.UtcNow.AddHours(1)
                });

                return Results.Ok(new ApiResponse<LoginResponseData>
                {
                    Message = "Login successful",
                    Data = new LoginResponseData(DateTime.UtcNow.AddHours(1).ToString("O"), userDto)
                });
            });

            api.MapPost("/logout", async (HttpContext context) =>
            {
                await context.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
                return Results.Ok(new ApiResponse<object>
                {
                    Message = "Operation completed",
                    Data = new { }
                });
            }).RequireAuthorization();

            api.MapGet("/me", (ClaimsPrincipal user, IAuthService authService) =>
            {
                var userProfile = authService.GetUserProfile(user);
                return Results.Ok(new ApiResponse<object>
                {
                    Message = "Operation completed",
                    Data = new { user = userProfile }
                });
            }).RequireAuthorization();
        }
    }
}
