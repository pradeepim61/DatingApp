import { Component, inject } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-roles-modal',
  standalone: true,
  imports: [],
  templateUrl: './roles-modal.component.html',
  styleUrl: './roles-modal.component.css',
})
export class RolesModalComponent {
  bsModalRef = inject(BsModalRef);
  username: string = '';
  availableRoles: string[] = [];
  selectedRoles: string[] = [];
  title: string = '';
  rolesupdated = false;

  Updatechecked(checkedValue: string) {
    if (this.selectedRoles.includes(checkedValue)) {
      this.selectedRoles = this.selectedRoles.filter(
        (role) => role !== checkedValue
      );
    } else {
      this.selectedRoles.push(checkedValue);
    }
  }

  onSelectRoles(){
    this.rolesupdated = true;
    this.bsModalRef.hide();
  }

}
