using IdentityApi.Models;
using Microsoft.EntityFrameworkCore;

namespace IdentityApi.Data
{
    /// <summary>
    /// Idempotent seed/reset command for the Identity service.
    ///
    /// Purpose: create the minimum accepted Identity release fixture — one active Lead account.
    ///
    /// Usage (after migrations are applied):
    ///   dotnet run --project services/identity -- --seed
    ///
    /// Rules enforced:
    ///   - Password is read from the SEED_LEAD_PASSWORD environment variable at runtime.
    ///   - No plaintext password is committed to Git or logged.
    ///   - Re-running is idempotent: upserts by email, no duplicate users created.
    ///   - The stored credential is a real BCrypt hash (cost 11).
    ///
    /// See wiki: SMC-94 Scope §4 — Safe deterministic seed/reset.
    /// </summary>
    public static class DatabaseSeeder
    {
        // Deterministic release team_id.
        // Must match the seeded Project.team_id used by the Core service (DM-C06).
        private static readonly Guid ReleaseTeamId = Guid.Parse("3b5f3ec5-cc27-4d68-8f4d-d80545d6b9c1");

        // Deterministic Lead user ID — stable across resets.
        private static readonly Guid LeadUserId = Guid.Parse("aaaaaaaa-0000-4000-8000-000000000001");

        // Lead email (public fixture — safe to commit)
        private const string LeadEmail = "lead@shiftcore.local";
        private const string LeadFullName = "Demo Lead";
        private const string LeadRole = "Lead";

        /// <summary>
        /// Seeds one active Lead user. Idempotent — safe to re-run.
        /// Password is read from the SEED_LEAD_PASSWORD environment variable.
        /// </summary>
        public static async Task SeedAsync(ApplicationDbContext db)
        {
            // Read password from environment — never from Git
            var plainPassword = Environment.GetEnvironmentVariable("SEED_LEAD_PASSWORD");
            if (string.IsNullOrWhiteSpace(plainPassword))
            {
                throw new InvalidOperationException(
                    "SEED_LEAD_PASSWORD environment variable is not set. " +
                    "Set it before running the seed command. " +
                    "Do not commit any password to Git.");
            }

            // Hash the password with BCrypt cost 11
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(plainPassword, workFactor: 11);

            // Upsert: find existing lead by stable ID or email
            var existing = await db.Users.FirstOrDefaultAsync(u => u.Id == LeadUserId || u.Email == LeadEmail);

            if (existing == null)
            {
                // Create new Lead
                db.Users.Add(new User
                {
                    Id = LeadUserId,
                    TeamId = ReleaseTeamId,
                    FullName = LeadFullName,
                    Email = LeadEmail,
                    PasswordHash = passwordHash,
                    Role = LeadRole,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });

                await db.SaveChangesAsync();
                Console.WriteLine("[Seed] Lead user created: {0}", LeadEmail);
            }
            else
            {
                // Reset existing Lead to the known fixture state (idempotent reset)
                existing.FullName = LeadFullName;
                existing.Email = LeadEmail;
                existing.PasswordHash = passwordHash;
                existing.Role = LeadRole;
                existing.TeamId = ReleaseTeamId;
                existing.IsActive = true;
                existing.UpdatedAt = DateTime.UtcNow;

                await db.SaveChangesAsync();
                Console.WriteLine("[Seed] Lead user reset: {0}", LeadEmail);
            }

            Console.WriteLine("[Seed] Done. team_id={0}", ReleaseTeamId);
        }
    }
}
