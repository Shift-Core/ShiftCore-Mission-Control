using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IdentityApi.Models
{
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        public required string Email { get; set; }

        [Required]
        [MaxLength(255)]
        public required string Name { get; set; }

        [Required]
        public required string PasswordHash { get; set; }

        [MaxLength(50)]
        public string? TeamId { get; set; }

        [Required]
        [MaxLength(50)]
        public required string Role { get; set; }
    }
}
