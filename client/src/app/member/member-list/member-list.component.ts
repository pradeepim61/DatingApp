import { Component, inject, OnInit } from '@angular/core';
import { MembersService } from '../../_services/members.service';
import { Member } from '../../Models/Member';
import { MemberCardComponent } from "../../members/member-card/member-card.component";
import { PageChangedEvent, PaginationModule } from 'ngx-bootstrap/pagination';
import { AccountService } from '../../_services/account.service';
import { UserParams } from '../../Models/UserParams';
import { formatCurrency } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from 'ngx-bootstrap/buttons';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [MemberCardComponent, PaginationModule, FormsModule, ButtonsModule],
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.css'
})
export class MemberListComponent implements OnInit {
  memberService = inject(MembersService);
  genderList = [{ value: 'male', display: 'males' }, { value: 'female', display: 'females' }]

  ngOnInit(): void {
    if (!this.memberService.paginatedresponse()) {
      this.loadMembers();
    }
  }

  resetFilters() {
    this.memberService.resetUserParams();
    this.loadMembers();
  }

  loadMembers() {
    this.memberService.getMembers();
  }

  pagechanged($event: PageChangedEvent) {
    if (this.memberService.userparams().pageNumber === $event.page) return;
    this.memberService.userparams().pageNumber = $event.page;
    this.loadMembers()
  }

}
