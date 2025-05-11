import { Component, inject, input, OnInit, output, ViewChild } from '@angular/core';
import { Message } from '../../Models/Message';
import { MessageService } from '../../_services/message.service';
import { TimeagoModule } from 'ngx-timeago';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-member-messages',
  standalone: true,
  imports: [TimeagoModule, FormsModule],
  templateUrl: './member-messages.component.html',
  styleUrl: './member-messages.component.css',
})
export class MemberMessagesComponent {
  private messageService = inject(MessageService);
  username = input.required<string>();
  messages = input.required<Message[]>();
  messageContent = '';
  updatedMessage = output<Message>();
  @ViewChild('messageForm') messageForm?: NgForm;

  sendMessage() {
    this.messageService.sendMessage(this.username(), this.messageContent).subscribe({
      next: (message) => {
        this.updatedMessage.emit(message);
        this.messageForm?.reset();
      }
    })
  }

}
