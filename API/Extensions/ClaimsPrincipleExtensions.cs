using System;
using System.Security.Claims;

namespace API.Extensions;

public static class ClaimsPrincipleExtensions
{
    public static string GetUsername(this ClaimsPrincipal user)
    {
        var userName = user.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new Exception("Cannot get username from the token");
        return userName;
    }
}
