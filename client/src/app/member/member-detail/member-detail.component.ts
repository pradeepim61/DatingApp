import { Component, inject, OnInit, ViewChild, viewChild } from '@angular/core';
import { MembersService } from '../../_services/members.service';
import { ActivatedRoute } from '@angular/router';
import { Member } from '../../Models/Member';
import { TabDirective, TabsetComponent, TabsModule } from 'ngx-bootstrap/tabs';
import { GalleryModule, GalleryItem, ImageItem } from 'ng-gallery';
import { LightboxModule } from 'ng-gallery/lightbox';
import { TimeagoModule } from 'ngx-timeago';
import { DatePipe } from '@angular/common';
import { MemberMessagesComponent } from '../../members/member-messages/member-messages.component';
import { Message } from '../../Models/Message';
import { MessageService } from '../../_services/message.service';

@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [
    TabsModule,
    GalleryModule,
    LightboxModule,
    TimeagoModule,
    DatePipe,
    MemberMessagesComponent,
  ],
  templateUrl: './member-detail.component.html',
  styleUrl: './member-detail.component.css',
})
export class MemberDetailComponent implements OnInit {
  @ViewChild('memberTabs', {static:true}) memberTabs?: TabsetComponent;
  private memberService = inject(MembersService);
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);
  member: Member = {} as Member;
  images: GalleryItem[] = [];
  activeTab?: TabDirective;
  messages: Message[] = [];

  ngOnInit(): void {
    this.route.data.subscribe({
      next: (data) => {
        this.member = data['member'];
        this.member && this.member.photos.map(p =>
          this.images.push(new ImageItem({ src: p.url, thumb: p.url }))
        );
      },
      error: (error) => console.log(error),
    });

    this.route.queryParams.subscribe((params) => {
      params['tab'] && this.selectTab(params['tab']);
    })
  }

  selectTab(heading: string) {
    if (this.memberTabs) {
      const memberTab = this.memberTabs.tabs.find((x) => x.heading === heading);
      if (memberTab) {
        memberTab.active = true;
      }
    }

  }

  onMessageSent(event: any) {
    this.messages.push(event);
  }

  onTabActivated(data: TabDirective) {
    this.activeTab = data;
    if (this.activeTab.heading === 'Messages' && this.messages.length === 0 && this.member) {
      this.messageService.getMessageThread(this.member.username).subscribe({
        next: (messages) => {
          this.messages = messages;
        },
        error: (error) => console.log(error),
      });
    }
  }

  // loadMember() {
  //   const username = this.route.snapshot.paramMap.get('username');
  //   if (!username) return;

  //   this.memberService.getMember(username).subscribe({
  //     next: (response) => {
  //       (this.member = response),
  //         response.photos.map((p) => {
  //           this.images.push(new ImageItem({ src: p.url, thumb: p.url }));
  //         });
  //     },
  //     error: (error) => console.log(error),
  //   });
  // }
}
