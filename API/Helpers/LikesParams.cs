using System;

namespace API.Helpers;

public class LikesParams : PaginationParams
{
    public required string Predicate { get; set; } = "liked";
    public int UserId { get; set; }
}
