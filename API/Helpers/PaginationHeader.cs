using System;

namespace API.Helpers;

public class PaginationHeader(int currentPage, int itemsPerPage, int totalItems, int totalPages)
{
    public int CurrentPage { get; set; } = currentPage;
    public int TotalPages { get; set; } = totalPages;
    public int PageSize { get; set; } = itemsPerPage;
    public int TotalItems { get; set; } = totalItems;
}
