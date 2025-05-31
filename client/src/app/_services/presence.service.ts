import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
} from '@microsoft/signalr';
import { ToastrService } from 'ngx-toastr';
import { User } from '../Models/User';
import { take } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class PresenceService {
  hubUrl = environment.hubsUrl;
  private hubConnection?: HubConnection;
  private toaster = inject(ToastrService);
  onlineUsers = signal<string[]>([]);
  private router = inject(Router);

  createHubConnection(user: User) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'presence', {
        accessTokenFactory: () => user.token,
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().catch((error) => console.log(error));

    this.hubConnection.on('UsersIsOnline', (username) => {
      this.onlineUsers.update((users) => [...users, username]);
     // this.toaster.info(username + ' is online');
    });

    this.hubConnection.on('UsersIsOffline', (username) => {
      this.onlineUsers.update((users) => users.filter((u) => u !== username));
     // this.toaster.warning(username + ' is offline');
    });

    this.hubConnection.on('GetOnlineUsers', (usernames: string[]) => {
      this.onlineUsers.set(usernames);
    });

    this.hubConnection.on('NewMessageReceived', ({username , knownAs}) => {
      this.toaster.success(username + ' has sent you a new message! Click to view')
      .onTap
      .pipe(take(1))
      .subscribe(() => this.router.navigateByUrl('/members/' + username + '?tab=Messages'));
    });
  }

  stopHubConnection() {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      this.hubConnection?.stop().catch((error) => console.log(error));
    }
  }



}
