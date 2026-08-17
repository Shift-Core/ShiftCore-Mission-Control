using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;

namespace IdentityApi.Services
{
    /// <summary>
    /// RS256 JWT token generation service.
    ///
    /// Security rules enforced here:
    ///   - Private key is loaded from filesystem path — never from env var, config value, or Git.
    ///   - Private key is never logged.
    ///   - Generated tokens are never logged.
    ///   - RSA key instance is cached to avoid repeated file I/O; the cache is replaced
    ///     atomically if the key file is changed (not common in practice, but safe).
    /// </summary>
    public class JwtService : IJwtService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<JwtService> _logger;

        // Thread-safe lazy key cache — reloaded only if the file path changes.
        private RsaSecurityKey? _signingKey;
        private string? _loadedKeyPath;
        private readonly object _keyLock = new();

        public int ExpiryMinutes
        {
            get
            {
                var raw = _config["Jwt:ExpiryMinutes"];
                return int.TryParse(raw, out var m) && m > 0 ? m : 60;
            }
        }

        public JwtService(IConfiguration config, ILogger<JwtService> logger)
        {
            _config = config;
            _logger = logger;
        }

        public string GenerateToken(Guid userId, string email, string fullName, string role, Guid teamId)
        {
            var signingKey = GetSigningKey();

            var issuer   = _config["Jwt:Issuer"]   ?? "shiftcore-identity";
            var audience = _config["Jwt:Audience"] ?? "shiftcore-api";
            var now      = DateTime.UtcNow;
            var expiry   = now.AddMinutes(ExpiryMinutes);

            // Claims contract shared across Identity, Core, and AI:
            //   sub     — user UUID (stable identifier)
            //   email   — user email
            //   name    — display name
            //   role    — authorization role (Lead, Super, Core, Identity)
            //   teamId  — release team scope (DM-C06)
            //   jti     — unique token ID (prevents replay without revocation store)
            //   iat     — issued-at (Unix seconds)
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub,   userId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, email),
                new Claim(JwtRegisteredClaimNames.Name,  fullName),
                new Claim("role",   role),
                new Claim("teamId", teamId.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti,   Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Iat,
                    new DateTimeOffset(now).ToUnixTimeSeconds().ToString(),
                    ClaimValueTypes.Integer64),
            };

            var token = new JwtSecurityToken(
                issuer:             issuer,
                audience:           audience,
                claims:             claims,
                notBefore:          now,
                expires:            expiry,
                signingCredentials: new SigningCredentials(signingKey, SecurityAlgorithms.RsaSha256));

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            _logger.LogInformation(
                "JWT issued for user {UserId}, role={Role}, exp={Expiry}",
                userId, role, expiry.ToString("O"));
            // NOTE: tokenString is intentionally NOT logged.

            return tokenString;
        }

        // ── Private ──────────────────────────────────────────────────────────

        private RsaSecurityKey GetSigningKey()
        {
            var path = _config["Jwt:PrivateKeyPath"]
                ?? throw new InvalidOperationException(
                    "Jwt:PrivateKeyPath is not configured. " +
                    "Set it via the Jwt__PrivateKeyPath environment variable or appsettings.");

            if (!File.Exists(path))
                throw new InvalidOperationException(
                    $"JWT private key file not found at '{path}'. " +
                    "Ensure the identity-keygen container has run and the jwt_keys volume is mounted.");

            lock (_keyLock)
            {
                // Return cached key if the configured path has not changed.
                if (_signingKey is not null && _loadedKeyPath == path)
                    return _signingKey;

                _logger.LogInformation("Loading JWT private key from {Path}", path);
                var pem = File.ReadAllText(path);

                var rsa = RSA.Create();
                rsa.ImportFromPem(pem);

                // RsaSecurityKey takes ownership of the RSA instance.
                _signingKey   = new RsaSecurityKey(rsa);
                _loadedKeyPath = path;

                _logger.LogInformation("JWT private key loaded successfully (key size: {KeySize} bits)", rsa.KeySize);
                // NOTE: the key itself is never logged.
                return _signingKey;
            }
        }
    }
}
