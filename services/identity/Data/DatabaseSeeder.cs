using IdentityApi.Models;
using Microsoft.EntityFrameworkCore;

namespace IdentityApi.Data
{
    /// <summary>
    /// Idempotent seed command for the Identity service.
    ///
    /// Usage (after migrations are applied):
    ///   dotnet IdentityApi.dll --seed
    ///
    /// Idempotency mechanism:
    ///   Checks <c>identity.seed_history</c> for the seed identifier before doing anything.
    ///   If the identifier already exists, the seed is skipped without touching users or data.
    ///   This is a reliable marker regardless of current user count.
    ///
    /// Transaction safety:
    ///   All writes (users + seed_history record) happen in a single transaction.
    ///   If anything fails, the transaction is rolled back and the seed is NOT marked complete.
    ///   The next run will retry.
    ///
    /// Password rules:
    ///   Password is read from SEED_DEFAULT_PASSWORD env var at runtime.
    ///   No plaintext password is committed to Git, logged, or returned.
    ///   BCrypt cost factor: 11 (matches project security requirement).
    ///
    /// See ARCHITECTURE.md §3 — Migration and Seed Strategy.
    /// </summary>
    public static class DatabaseSeeder
    {
        // ── Seed identifier ────────────────────────────────────────────────────
        // This is the idempotency key stored in identity.seed_history.
        // Changing this value will cause the seed to re-run (use only for intentional re-seeds).
        private const string SeedName = "R24-04-Identity-InitialUsers";

        // ── Shared team (DM-C06) ───────────────────────────────────────────────
        // Must match the seeded Project.team_id used by the Core service.
        private static readonly Guid ReleaseTeamId = Guid.Parse("3b5f3ec5-cc27-4d68-8f4d-d80545d6b9c1");

        // ── Seed users ─────────────────────────────────────────────────────────
        // Stable UUIDs ensure upserts are deterministic on re-run.
        // Roles match the authorization contract shared with Core and AI services.
        private static readonly (Guid Id, string Email, string FullName, string Role)[] SeedUsers =
        [
            (Guid.Parse("aaaaaaaa-0000-4000-8000-000000000001"), "lead@shiftcore.local",     "Demo Lead",      "Lead"),
            (Guid.Parse("aaaaaaaa-0000-4000-8000-000000000002"), "super@shiftcore.local",    "Super Admin",    "Super"),
            (Guid.Parse("aaaaaaaa-0000-4000-8000-000000000003"), "core@shiftcore.local",     "Core Owner",     "Core"),
            (Guid.Parse("aaaaaaaa-0000-4000-8000-000000000004"), "identity@shiftcore.local", "Identity Owner", "Identity"),
        ];

        /// <summary>
        /// Seeds the release fixture users. Idempotent — safe to re-run any number of times.
        /// </summary>
        public static async Task SeedAsync(ApplicationDbContext db)
        {
            Console.WriteLine("[Seed] Checking seed history for '{0}'...", SeedName);

            // ── Idempotency check ──────────────────────────────────────────────
            var alreadyApplied = await db.SeedHistory.AnyAsync(s => s.SeedName == SeedName);
            if (alreadyApplied)
            {
                Console.WriteLine("[Seed] Seed '{0}' already applied — nothing to do. Exiting.", SeedName);
                return;
            }

            // ── Read password from environment ─────────────────────────────────
            // SEED_DEFAULT_PASSWORD is preferred; SEED_LEAD_PASSWORD is accepted for
            // backward compatibility with earlier single-user seed scripts.
            var plainPassword =
                Environment.GetEnvironmentVariable("SEED_DEFAULT_PASSWORD") ??
                Environment.GetEnvironmentVariable("SEED_LEAD_PASSWORD");

            if (string.IsNullOrWhiteSpace(plainPassword))
            {
                throw new InvalidOperationException(
                    "SEED_DEFAULT_PASSWORD environment variable is not set. " +
                    "Set it before running the seed command. " +
                    "Do not commit any password to Git.");
            }

            Console.WriteLine("[Seed] Applying seed '{0}'...", SeedName);

            // Hash once — all dev seed users share the same password for convenience.
            // In production, each user would be provisioned separately.
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(plainPassword, workFactor: 11);

            // ── Transaction ────────────────────────────────────────────────────
            // All writes succeed together or not at all.
            // If SaveChanges fails, the transaction is rolled back and the seed_history
            // record is NOT inserted, so the next run will retry.
            await using var transaction = await db.Database.BeginTransactionAsync();
            try
            {
                var created = 0;

                foreach (var (id, email, fullName, role) in SeedUsers)
                {
                    var exists = await db.Users.AnyAsync(u => u.Id == id);
                    if (!exists)
                    {
                        db.Users.Add(new User
                        {
                            Id           = id,
                            TeamId       = ReleaseTeamId,
                            FullName     = fullName,
                            Email        = email,
                            PasswordHash = passwordHash,
                            Role         = role,
                            IsActive     = true,
                            CreatedAt    = DateTime.UtcNow,
                            UpdatedAt    = DateTime.UtcNow,
                        });
                        created++;
                        Console.WriteLine("[Seed]   + Creating user: {0} ({1})", email, role);
                    }
                    else
                    {
                        Console.WriteLine("[Seed]   ~ User already exists, skipping: {0}", email);
                    }
                }

                // Mark seed as applied — this is what prevents re-runs.
                db.SeedHistory.Add(new SeedHistory
                {
                    SeedName    = SeedName,
                    ExecutedAt  = DateTime.UtcNow,
                });

                await db.SaveChangesAsync();
                await transaction.CommitAsync();

                Console.WriteLine("[Seed] Done. Created {0} user(s). Seed '{1}' recorded in seed_history.", created, SeedName);
                Console.WriteLine("[Seed] team_id={0}", ReleaseTeamId);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.Error.WriteLine("[Seed] FAILED — transaction rolled back. Error: {0}", ex.Message);
                // Re-throw so the container exits non-zero, triggering a Compose failure signal.
                throw;
            }
        }
    }
}
