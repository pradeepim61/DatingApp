import { JsonPipe, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, inject, Input, input, OnInit, output, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { AccountService } from '../_services/account.service';
import { ToastrService } from 'ngx-toastr';
import { TextInputComponent } from "../_forms/text-input/text-input.component";
import { DatePickerComponent } from '../_forms/date-picker/date-picker.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor, NgIf, JsonPipe, TextInputComponent, DatePickerComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  @Input() usersFromHomeComponent: any;
  cancelRegister = output<boolean>();
  accountService = inject(AccountService);
  fb = inject(FormBuilder);
  private toaster = inject(ToastrService);
  router = inject(Router);
  model: any = {};
  registerForm: FormGroup = new FormGroup({});
  maxDate: Date = new Date();
  validationErrors: string[] | undefined;

  ngOnInit(): void {
    this.intializeForm();
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);
  }

  intializeForm() {
    this.registerForm = this.fb.group({
      gender: ['male'],
      username: ['', Validators.required],
      knownAs: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]],
      confirmPassword: ['', [Validators.required, this.matchValues('password')]]
    });
    this.registerForm.get('password')?.valueChanges.subscribe({
      next: () => {
        this.registerForm.get('confirmPassword')?.updateValueAndValidity();
        if (this.registerForm.get('confirmPassword')?.errors?.['isMatching'] &&
          this.registerForm.get('confirmPassword')?.value === this.registerForm.get('password')?.value) {
          this.registerForm.get('confirmPassword')?.setErrors(null);
        }
      }
    });
  }

  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      return control.value === control.parent?.get(matchTo)?.value ? null : { isMatching: true };
    };
  }

  register() {
    const dob = this.getDateOnly(this.registerForm.get('dateOfBirth')?.value);
    this.model = { ...this.registerForm.value, dateOfBirth: dob };
    this.accountService.register(this.model).subscribe({
      next: response => {
        console.log(response);
        this.router.navigateByUrl('/members');
      },
      error: error => {
        console.log(error);
        this.validationErrors = error;
      }
    })
  }

  cancel() {
    this.cancelRegister.emit(false);
  }

  private getDateOnly(dob: string | undefined) {
    if (!dob) return;
    return new Date(dob).toISOString().slice(0, 10);
  }
}
