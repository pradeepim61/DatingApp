import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { PaginationResponse } from '../Models/Pagination';
import { Member } from '../Models/Member';
import { setPaginatedResponse, setPaginationHeader } from './paginationHelper';

@Injectable({
  providedIn: 'root',
})
export class LikesService {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  likeIds = signal<number[]>([]);
  paginatedresponse = signal<PaginationResponse<Member[]> | null>(null);

  toggleLike(targetId: number) {
    return this.http.post(`${this.baseUrl}likes/${targetId}`, {});
  }

  getLikes(predicate: string, pageNumber: number, pageSize: number) {
    let params = setPaginationHeader(pageNumber, pageSize);
    params = params.append('predicate', predicate);

    return this.http
      .get(`${this.baseUrl}likes`, { observe: 'response', params })
      .subscribe({
        next: (response) => {
          console.log(response),
            setPaginatedResponse(response, this.paginatedresponse);
            console.log(this.paginatedresponse());
        },
      });
  }

  getLikeIds() {
    return this.http.get<number[]>(`${this.baseUrl}likes/list`).subscribe({
      next: (ids) => {
        this.likeIds.set(ids);
      },
      error: (error) => {
        console.error('Error fetching like IDs:', error);
      },
    });
  }
}
