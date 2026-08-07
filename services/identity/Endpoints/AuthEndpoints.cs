using IdentityApi.DTOs;
using IdentityApi.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
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
                var (isSuccess, jwtToken, userDto) = await authService.ValidateCredentialsAsync(req);

                if (!isSuccess || jwtToken == null || userDto == null)
                {
                    return Results.Json(new ApiErrorResponse
                    {
                        Success = false,
                        Message = "Sign-in failed. Check your details or contact the workspace administrator.",
                        ErrorCode = "AUTH_INVALID",
                        TraceId = context.TraceIdentifier
                    }, statusCode: 401);
                }

                var cookieName = context.RequestServices.GetRequiredService<IConfiguration>()["SC_TOKEN_COOKIE_NAME"] ?? "sc_token";

                context.Response.Cookies.Append(cookieName, jwtToken, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = context.Request.IsHttps || context.Request.Headers["X-Forwarded-Proto"] == "https",
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTimeOffset.UtcNow.AddHours(1)
                });

                return Results.Ok(new ApiResponse<LoginResponseData>
                {
                    Message = "Login successful",
                    Data = new LoginResponseData(DateTime.UtcNow.AddHours(1).ToString("O"), userDto)
                });
            });

            api.MapPost("/logout", (HttpContext context) =>
            {
                var cookieName = context.RequestServices.GetRequiredService<IConfiguration>()["SC_TOKEN_COOKIE_NAME"] ?? "sc_token";
                context.Response.Cookies.Delete(cookieName);
                
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
