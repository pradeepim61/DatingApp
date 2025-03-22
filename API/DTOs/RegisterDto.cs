using System;
using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class RegisterDto
{
    [MaxLength(100)]
    [Required]
    public  string Username { get; set; }
    [Required]
    public  string Password { get; set; }
}
