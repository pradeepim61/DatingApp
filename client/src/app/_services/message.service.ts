import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { PaginationResponse } from '../Models/Pagination';
import { Message } from '../Models/Message';
import { setPaginatedResponse, setPaginationHeader } from './paginationHelper';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
} from '@microsoft/signalr';
import { User } from '../Models/User';
import { Group } from '../Models/group';
import { BusyService } from './busy.service';


@Injectable({
  providedIn: 'root',
})
export class MessageService {
  baseUrl = environment.apiUrl;
  hubUrl = environment.hubsUrl;
  private http = inject(HttpClient);
  paginatedResult = signal<PaginationResponse<Message[]> | null>(null);
  hubConnection?: HubConnection;
  messageThread = signal<Message[]>([]);
  busyService = inject(BusyService); 

  createHubConnection(user: User, otherUserName: string) {
    this.busyService.busy();
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'message?user=' + otherUserName, {
        accessTokenFactory: () => user.token,
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().catch((error) => console.log(error)).finally(() => this.busyService.idle());

    this.hubConnection.on('ReceiveMessageThread', (messages) => {
      this.messageThread.set(messages);
    });

    this.hubConnection.on('NewMessage', (message) => {
      this.messageThread.update((messages) => [...messages, message]);
    });

    this.hubConnection.on('UpdatedGroup', (group: Group) => {
        if(group.connections.some(c => c.username === otherUserName)) {
          this.messageThread.update(messages =>{
              messages.forEach(m => {
                if(!m.dateRead) {
                  m.dateRead = new Date(Date.now());
                }
              })
              return messages;
          })
        }
    });
  }

  stopHubConnection() {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      this.hubConnection.stop().catch((error) => console.log(error));
    }
  }

  getMessages(pageNumber: number, pageSize: number, container: string) {
    let params = setPaginationHeader(pageNumber, pageSize);
    params = params.append('Container', container);

    return this.http
      .get<Message[]>(this.baseUrl + 'messages', {
        observe: 'response',
        params,
      })
      .subscribe({
        next: (response) => {
          setPaginatedResponse(response, this.paginatedResult);
        },
        error: (error) => {
          console.error('Error fetching messages:', error);
        },
      });
  }

  getMessageThread(username: string) {
    return this.http.get<Message[]>(
      this.baseUrl + 'messages/thread/' + username
    );
  }

  async sendMessage(username: string, content: string) {
    return this.hubConnection?.invoke('SendMessage', {
      recipientUsername: username,
      content,
    });
  }

  deleteMessage(id: number) {
    return this.http.delete(this.baseUrl + 'messages/' + id);
  }
}
