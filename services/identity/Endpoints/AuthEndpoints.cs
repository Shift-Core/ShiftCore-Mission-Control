using IdentityApi.DTOs;
using IdentityApi.Services;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace IdentityApi.Endpoints
{
    public static class AuthEndpoints
    {
        public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
        {
            var api = app.MapGroup("/api/identity/v1/auth");

            // ── POST /auth/login ──────────────────────────────────────────────
            api.MapPost("/login", async (
                LoginRequest req,
                HttpContext context,
                IAuthService authService,
                IConfiguration config,
                CancellationToken ct) =>
            {
                // 1. Validate request DTO (annotations on LoginRequest)
                var validationErrors = ValidateModel(req);
                if (validationErrors.Count > 0)
                {
                    return Results.Json(new ApiErrorResponse
                    {
                        Success   = false,
                        Message   = "Validation failed.",
                        ErrorCode = "VALIDATION_ERROR",
                        Errors    = validationErrors.Select(e => (object)new { field = e.MemberNames.FirstOrDefault(), message = e.ErrorMessage }).ToArray(),
                        TraceId   = context.TraceIdentifier,
                    }, statusCode: StatusCodes.Status400BadRequest);
                }

                // 2. Validate credentials — AuthService handles BCrypt and JWT generation.
                var (isSuccess, token, userDto) = await authService.ValidateCredentialsAsync(req, ct);

                if (!isSuccess || token is null || userDto is null)
                {
                    return Results.Json(new ApiErrorResponse
                    {
                        Success   = false,
                        Message   = "Sign-in failed. Check your details or contact the workspace administrator.",
                        ErrorCode = "AUTH_INVALID",
                        TraceId   = context.TraceIdentifier,
                    }, statusCode: StatusCodes.Status401Unauthorized);
                }

                // 3. Write JWT into HttpOnly cookie — never return it in the response body.
                var cookieName   = config["SC_TOKEN_COOKIE_NAME"] ?? "sc_token";
                var expiryConfig = config["Jwt:ExpiryMinutes"];
                var expiryMin    = int.TryParse(expiryConfig, out var m) && m > 0 ? m : 60;
                var expiresAt    = DateTimeOffset.UtcNow.AddMinutes(expiryMin);

                context.Response.Cookies.Append(cookieName, token, new CookieOptions
                {
                    HttpOnly = true,
                    // SameSite=Strict: cookie is only sent for same-site requests.
                    // Works correctly for the browser → Nginx → backend architecture
                    // where all requests originate from the same public origin.
                    SameSite = SameSiteMode.Strict,
                    // Secure follows the request scheme: false for HTTP local dev,
                    // true when TLS is terminated at Nginx and X-Forwarded-Proto is set.
                    Secure   = context.Request.IsHttps,
                    Path     = "/",
                    Expires  = expiresAt,
                });

                return Results.Ok(new ApiResponse<LoginResponseData>
                {
                    Success = true,
                    Message = "Login successful.",
                    Data    = new LoginResponseData(expiresAt.ToString("O"), userDto),
                });
            });

            // ── POST /auth/logout ─────────────────────────────────────────────
            api.MapPost("/logout", (HttpContext context, IConfiguration config) =>
            {
                var cookieName = config["SC_TOKEN_COOKIE_NAME"] ?? "sc_token";

                // Expire the cookie immediately — the value is irrelevant once expired.
                context.Response.Cookies.Append(cookieName, string.Empty, new CookieOptions
                {
                    HttpOnly = true,
                    SameSite = SameSiteMode.Strict,
                    Secure   = context.Request.IsHttps,
                    Path     = "/",
                    Expires  = DateTimeOffset.UnixEpoch, // epoch = immediately expired
                });

                return Results.Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Signed out successfully.",
                    Data    = new { },
                });
            }).RequireAuthorization();

            // ── GET /auth/me ──────────────────────────────────────────────────
            api.MapGet("/me", (ClaimsPrincipal user, IAuthService authService) =>
            {
                var userProfile = authService.GetUserProfile(user);

                if (userProfile is null)
                {
                    return Results.Json(new ApiErrorResponse
                    {
                        Success   = false,
                        Message   = "Could not extract user profile from token.",
                        ErrorCode = "AUTH_INVALID_CLAIMS",
                        TraceId   = string.Empty,
                    }, statusCode: StatusCodes.Status401Unauthorized);
                }

                return Results.Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Operation completed.",
                    Data    = new { user = userProfile },
                });
            }).RequireAuthorization();
        }

        // ── Helper ───────────────────────────────────────────────────────────

        private static List<ValidationResult> ValidateModel<T>(T model)
        {
            var ctx     = new ValidationContext(model!);
            var results = new List<ValidationResult>();
            Validator.TryValidateObject(model!, ctx, results, validateAllProperties: true);
            return results;
        }
    }
}
