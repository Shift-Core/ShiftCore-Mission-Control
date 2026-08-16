using IdentityApi.Data;
using IdentityApi.DTOs;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace IdentityApi.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _db;
        private readonly IJwtService _jwt;
        private readonly ILogger<AuthService> _logger;

        public AuthService(ApplicationDbContext db, IJwtService jwt, ILogger<AuthService> logger)
        {
            _db     = db;
            _jwt    = jwt;
            _logger = logger;
        }

        /// <inheritdoc />
        public async Task<(bool IsSuccess, string? Token, UserDto? UserDto)> ValidateCredentialsAsync(
            LoginRequest request,
            CancellationToken ct = default)
        {
            // Normalize email before lookup (DM-C01: case-insensitive).
            // The DB has LOWER(email) expression index — matching on lowercase is efficient.
            var normalizedEmail = request.Email.Trim().ToLowerInvariant();

            // Fetch user — does NOT select password_hash into a log or trace.
            var user = await _db.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail, ct);

            // Always run BCrypt verify to prevent timing-based user enumeration.
            // If user is null, verify against a dummy hash (constant time).
            const string DummyHash = "$2a$11$aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
            var hashToVerify = user?.PasswordHash ?? DummyHash;
            var passwordValid = BCrypt.Net.BCrypt.Verify(request.Password, hashToVerify);

            if (user == null || !passwordValid)
            {
                _logger.LogWarning("Authentication failed for email (normalized)");
                // NOTE: Do NOT log the email value — account enumeration risk.
                return (false, null, null);
            }

            if (!user.IsActive)
            {
                _logger.LogWarning("Authentication rejected — account inactive. UserId={UserId}", user.Id);
                return (false, null, null);
            }

            // Generate RS256 JWT — token string is not logged here.
            var token  = _jwt.GenerateToken(user.Id, user.Email, user.FullName, user.Role, user.TeamId);
            var userDto = new UserDto(user.Id.ToString(), user.FullName, user.Email, user.Role, user.TeamId.ToString());

            return (true, token, userDto);
        }

        /// <inheritdoc />
        public UserDto? GetUserProfile(ClaimsPrincipal principal)
        {
            // JWT claim names must match what JwtService.GenerateToken() emits.
            var id     = principal.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
            var email  = principal.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Email)?.Value;
            var name   = principal.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Name)?.Value;
            var role   = principal.FindFirst("role")?.Value;
            var teamId = principal.FindFirst("teamId")?.Value;

            if (id == null || email == null || name == null || role == null)
                return null;

            return new UserDto(id, name, email, role, teamId);
        }
    }
}
