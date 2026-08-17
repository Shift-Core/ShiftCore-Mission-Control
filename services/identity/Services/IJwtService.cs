namespace IdentityApi.Services
{
    /// <summary>
    /// Generates RS256-signed JWT tokens for authenticated Identity users.
    /// The private key is loaded from the path configured in <c>Jwt:PrivateKeyPath</c>.
    /// </summary>
    public interface IJwtService
    {
        /// <summary>
        /// Creates a signed RS256 JWT for the given user identity.
        /// </summary>
        /// <returns>The compact serialized JWT string.</returns>
        string GenerateToken(Guid userId, string email, string fullName, string role, Guid teamId);

        /// <summary>Returns the configured token expiry in minutes (default 60).</summary>
        int ExpiryMinutes { get; }
    }
}
