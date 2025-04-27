export interface Pagination {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number; 
}

export class PaginationResponse<T> {
    items?: T;
    pagination?: Pagination;
}
