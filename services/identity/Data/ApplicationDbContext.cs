using IdentityApi.Models;
using Microsoft.EntityFrameworkCore;

namespace IdentityApi.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(e => e.Email).IsUnique();
                
                entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("timezone('utc', now())");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("timezone('utc', now())");
            });

            // Seed initial users
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = Guid.Parse("11111111-1111-4111-8111-111111111111"),
                    Email = "super@shiftcore.local",
                    PasswordHash = "$2b$11$PFulOXkr4Td3YXLxoB.mLORGV6P44cWHch865DS2bBjwrkZezfawy", // Password123!
                    Name = "Super Admin",
                    Role = "Super",
                    TeamId = Guid.Parse("00000000-0000-4000-8000-000000000001"),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new User
                {
                    Id = Guid.Parse("22222222-2222-4222-8222-222222222222"),
                    Email = "core@shiftcore.local",
                    PasswordHash = "$2b$11$PFulOXkr4Td3YXLxoB.mLORGV6P44cWHch865DS2bBjwrkZezfawy", // Password123!
                    Name = "Core Owner",
                    Role = "Core",
                    TeamId = Guid.Parse("00000000-0000-4000-8000-000000000001"),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new User
                {
                    Id = Guid.Parse("33333333-3333-4333-8333-333333333333"),
                    Email = "identity@shiftcore.local",
                    PasswordHash = "$2b$11$PFulOXkr4Td3YXLxoB.mLORGV6P44cWHch865DS2bBjwrkZezfawy", // Password123!
                    Name = "Identity Owner",
                    Role = "Identity",
                    TeamId = Guid.Parse("00000000-0000-4000-8000-000000000001"),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            );
        }
    }
}
