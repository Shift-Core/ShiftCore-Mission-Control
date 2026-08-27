using IdentityApi.DTOs;
using System.Security.Claims;

namespace IdentityApi.Services
{
    public interface IAuthService
    {
        /// <summary>
        /// Validates user credentials against the database.
        /// Returns the signed RS256 JWT and the user DTO on success.
        /// The JWT and password are never logged by this interface.
        /// </summary>
        Task<(bool IsSuccess, string? Token, UserDto? UserDto)> ValidateCredentialsAsync(
            LoginRequest request,
            CancellationToken ct = default);

        /// <summary>
        /// Extracts a UserDto from a JWT ClaimsPrincipal (for the /me endpoint).
        /// Returns null if required claims are missing.
        /// </summary>
        UserDto? GetUserProfile(ClaimsPrincipal principal);
    }
}
