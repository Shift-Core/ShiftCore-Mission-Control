using IdentityApi.Data;
using IdentityApi.DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;

namespace IdentityApi.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _db;
        private readonly IConfiguration _config;
        private readonly ILogger<AuthService> _logger;

        public AuthService(ApplicationDbContext db, IConfiguration config, ILogger<AuthService> logger)
        {
            _db = db;
            _config = config;
            _logger = logger;
        }

        public async Task<(bool IsSuccess, string? JwtToken, UserDto? UserDto)> ValidateCredentialsAsync(LoginRequest request)
        {
            _logger.LogInformation("Login attempt for email: {Email}", request.Email);

            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive);

            if (user == null)
            {
                _logger.LogWarning("Login failed: user not found or inactive for email: {Email}", request.Email);
                return (false, null, null);
            }

            bool verified;
            try
            {
                // BCrypt.Net handles both $2a$ and $2b$ prefixes
                verified = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "BCrypt verification threw an exception for user: {Email}", request.Email);
                return (false, null, null);
            }

            if (!verified)
            {
                _logger.LogWarning("Login failed: invalid password for email: {Email}", request.Email);
                return (false, null, null);
            }

            var privateKeyPath = _config["Jwt:PrivateKeyPath"];
            if (string.IsNullOrEmpty(privateKeyPath) || !File.Exists(privateKeyPath))
            {
                _logger.LogError("JWT Private Key not found at path: {Path}", privateKeyPath);
                throw new InvalidOperationException($"JWT Private Key not found at path: {privateKeyPath}");
            }

            var rsa = RSA.Create();
            rsa.ImportFromPem(File.ReadAllText(privateKeyPath));

            var credentials = new SigningCredentials(new RsaSecurityKey(rsa), SecurityAlgorithms.RsaSha256);

            var issuer = _config["Jwt:Issuer"] ?? "shiftcore-identity";
            var audience = _config["Jwt:Audience"] ?? "shiftcore-api";

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim("name", user.Name),
                new Claim("role", user.Role),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            if (user.TeamId != Guid.Empty)
            {
                claims.Add(new Claim("teamId", user.TeamId.ToString()));
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(1),
                Issuer = issuer,
                Audience = audience,
                SigningCredentials = credentials
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var jwtString = tokenHandler.WriteToken(token);

            var userDto = new UserDto(
                user.Id.ToString(),
                user.Name,
                user.Email,
                user.Role,
                user.TeamId == Guid.Empty ? null : user.TeamId.ToString()
            );

            _logger.LogInformation("Login successful for user: {Email} ({Role})", user.Email, user.Role);
            return (true, jwtString, userDto);
        }

        public UserDto? GetUserProfile(ClaimsPrincipal principal)
        {
            var id = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value
                  ?? principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            var email = principal.FindFirst(ClaimTypes.Email)?.Value
                     ?? principal.FindFirst(JwtRegisteredClaimNames.Email)?.Value;
            var name = principal.FindFirst("name")?.Value
                    ?? principal.FindFirst(ClaimTypes.Name)?.Value;
            var role = principal.FindFirst("role")?.Value
                    ?? principal.FindFirst(ClaimTypes.Role)?.Value;
            var teamId = principal.FindFirst("teamId")?.Value;

            if (id == null || name == null || email == null || role == null)
            {
                return null;
            }

            return new UserDto(id, name, email, role, teamId);
        }
    }
}
