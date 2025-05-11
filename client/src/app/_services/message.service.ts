import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { PaginationResponse } from '../Models/Pagination';
import { Message } from '../Models/Message';
import { setPaginatedResponse, setPaginationHeader } from './paginationHelper';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
baseUrl = environment.apiUrl;
private http = inject(HttpClient)
paginatedResult = signal<PaginationResponse<Message[]> | null>(null);

getMessages(pageNumber: number, pageSize: number, container: string) {
  let params = setPaginationHeader(pageNumber, pageSize);
  params = params.append('Container', container);

  return this.http.get<Message[]>(this.baseUrl + 'messages', {observe: 'response', params }).subscribe({
    next: response => {
      setPaginatedResponse(response, this.paginatedResult);
    },
    error: (error) => {
      console.error('Error fetching messages:', error);
    }
  });

}

getMessageThread(username: string) {
  return this.http.get<Message[]>(this.baseUrl + 'messages/thread/' + username);
}

sendMessage(username: string, content: string) {
  return this.http.post<Message>(this.baseUrl + 'messages', { recipientUsername: username, content });
}

deleteMessage(id: number) {
  return this.http.delete(this.baseUrl + 'messages/' + id);
}

}
