using IdentityApi.Data;
using IdentityApi.Endpoints;
using IdentityApi.Extensions;
using Microsoft.AspNetCore.HttpOverrides;

var builder = WebApplication.CreateBuilder(args);

// ── Services ─────────────────────────────────────────────────────────────────
builder.Services.AddIdentityInfrastructure(builder.Configuration);
builder.Services.AddIdentityServices(builder.Configuration);

// Centralized ProblemDetails exception handling.
// In Development: exceptions include detail. In Production: safe, generic responses.
builder.Services.AddProblemDetails();

var app = builder.Build();

// ── Forwarded Headers ─────────────────────────────────────────────────────────
// Required for correct scheme (http/https) detection behind Nginx.
// Only trusts forwarded headers from the known internal network (Docker shiftcore-net).
// This makes context.Request.IsHttps accurate for cookie Secure flag decisions.
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto,
});

// ── Centralized Exception Handler ─────────────────────────────────────────────
// Catches unhandled exceptions and returns consistent ProblemDetails responses.
// Stack traces, connection strings, and credentials are never exposed in production.
app.UseExceptionHandler(exceptionApp =>
{
    exceptionApp.Run(async context =>
    {
        context.Response.ContentType = "application/problem+json";

        var exceptionHandlerFeature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
        var exception = exceptionHandlerFeature?.Error;

        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
        logger.LogError(exception, "Unhandled exception for {TraceId}", context.TraceIdentifier);

        var isDev = app.Environment.IsDevelopment();

        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        await context.Response.WriteAsJsonAsync(new
        {
            type    = "https://tools.ietf.org/html/rfc9110#section-15.6.1",
            title   = "An unexpected error occurred.",
            status  = 500,
            // In development, include the exception type for debugging.
            // In production, never expose internal error details.
            detail  = isDev ? exception?.Message : "An internal server error has occurred.",
            traceId = context.TraceIdentifier,
        });
    });
});

// ── Seed Command ───────────────────────────────────────────────────────────────
// Usage: dotnet IdentityApi.dll --seed
// Requires SEED_DEFAULT_PASSWORD env var. Migrations must be applied first.
// This path exits immediately after seeding — the API never starts.
if (args.Contains("--seed"))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await DatabaseSeeder.SeedAsync(db);
    return;
}

// ── Middleware pipeline ───────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapHealthEndpoints();
app.MapAuthEndpoints();

app.Run();
