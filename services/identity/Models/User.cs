using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IdentityApi.Models
{
    [Table("users", Schema = "identity")]
    public class User
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(255)]
        [Column("email")]
        public required string Email { get; set; }

        [Required]
        [MaxLength(255)]
        [Column("name")]
        public required string Name { get; set; }

        [Required]
        [Column("password_hash")]
        public required string PasswordHash { get; set; }

        [Column("team_id")]
        public Guid TeamId { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("role")]
        public required string Role { get; set; }
        
        [Column("is_active")]
        public bool IsActive { get; set; }
        
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
        
        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }
}
