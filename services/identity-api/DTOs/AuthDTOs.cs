namespace IdentityApi.DTOs
{
    public record LoginRequest(string Email, string Password);

    public record LoginResponseData(string ExpiresAt, UserDto User);

    public record UserDto(string Id, string Name, string Email, string Role, string? TeamId);
}
