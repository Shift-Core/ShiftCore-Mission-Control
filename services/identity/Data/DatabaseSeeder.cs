using IdentityApi.Models;

namespace IdentityApi.Data
{
    public static class DatabaseSeeder
    {
        public static void SeedDatabase(this WebApplication app)
        {
            using var scope = app.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            
            db.Database.EnsureCreated();

            if (!db.Users.Any())
            {
                db.Users.Add(new User
                {
                    Email = "lead@shiftcore.local",
                    Name = "Mohmed Mostafa",
                    PasswordHash = "dummy_hash_pass",
                    Role = "Lead",
                    TeamId = "3b5f3ec5-cc27-4d68-8f4d-d80545d6b9c1"
                });
                db.SaveChanges();
            }
        }
    }
}
