namespace IdentityApi.Endpoints
{
    public static class HealthEndpoints
    {
        public static void MapHealthEndpoints(this IEndpointRouteBuilder app)
        {
            app.MapGet("/health/identity", () => Results.Ok(new
            {
                status = "ok",
                service = "identity",
                version = "0.1.0",
                timestamp = DateTime.UtcNow.ToString("O")
            }))
            .WithName("GetHealth")
            .WithOpenApi();
        }
    }
}
