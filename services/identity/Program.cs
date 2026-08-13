using IdentityApi.Data;
using IdentityApi.Endpoints;
using IdentityApi.Extensions;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddIdentityInfrastructure(builder.Configuration);
builder.Services.AddIdentityServices();

var app = builder.Build();

// --seed: run the idempotent release seed and exit.
// Usage:  dotnet run --project services/identity -- --seed
// Requires: SEED_LEAD_PASSWORD environment variable set before running.
// Migrations must already be applied (dotnet ef database update) before seeding.
if (args.Contains("--seed"))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await DatabaseSeeder.SeedAsync(db);
    return;
}

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
