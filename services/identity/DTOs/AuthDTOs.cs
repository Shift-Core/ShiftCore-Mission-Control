using System.ComponentModel.DataAnnotations;

namespace IdentityApi.DTOs
{
    /// <summary>
    /// Login request body. Validation attributes are enforced in the endpoint
    /// before reaching AuthService so passwords are never logged in error paths.
    /// </summary>
    public record LoginRequest(
        [property: Required(ErrorMessage = "Email is required.")]
        [property: EmailAddress(ErrorMessage = "Email must be a valid email address.")]
        [property: MaxLength(255, ErrorMessage = "Email must not exceed 255 characters.")]
        string Email,

        [property: Required(ErrorMessage = "Password is required.")]
        [property: MinLength(1, ErrorMessage = "Password must not be empty.")]
        [property: MaxLength(1000, ErrorMessage = "Password is too long.")]
        string Password
    );

    public record LoginResponseData(string ExpiresAt, UserDto User);

    /// <summary>
    /// Publicly safe user representation — never contains password_hash or internal fields.
    /// Maps directly to JWT claims: sub, name, email, role, teamId.
    /// </summary>
    public record UserDto(string Id, string Name, string Email, string Role, string? TeamId);
}
