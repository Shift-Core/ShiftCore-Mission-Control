using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IdentityApi.Models
{
    /// <summary>
    /// Tracks which named seed operations have been applied to this database.
    /// Maps to <c>identity.seed_history</c> — owned by EF Core migrations.
    ///
    /// A unique constraint on <c>seed_name</c> is the idempotency guard:
    /// if a seed identifier already exists, the seed is skipped without
    /// touching users or any other data.
    /// </summary>
    [Table("seed_history", Schema = "identity")]
    public class SeedHistory
    {
        /// <summary>Auto-increment PK (PostgreSQL IDENTITY).</summary>
        [Key]
        [Column("id")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        /// <summary>
        /// Unique identifier for this seed run, e.g. "R24-04-Identity-InitialUsers".
        /// The unique index <c>uq_seed_name</c> on this column is the idempotency guard.
        /// </summary>
        [Required]
        [MaxLength(200)]
        [Column("seed_name")]
        public required string SeedName { get; set; }

        /// <summary>UTC timestamp of when this seed was applied.</summary>
        [Column("executed_at")]
        public DateTime ExecutedAt { get; set; }
    }
}
