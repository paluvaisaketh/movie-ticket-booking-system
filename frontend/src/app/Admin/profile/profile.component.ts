// src/app/Admin/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../services/auth.service';
import { take, tap } from 'rxjs/operators';
import { SideNavbarComponent } from '../components/side-navbar/side-navbar.component';
import { RouterOutlet } from '@angular/router';
import { AdminHeaderComponent } from '../components/admin-header/admin-header.component';

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule, SideNavbarComponent,AdminHeaderComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  currentUser: User | null = null;
  isLoading = true;
  isSaving = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [{ value: '', disabled: true }, Validators.required], // Phone is disabled as it's a unique identifier
      role: [{ value: '', disabled: true }] // Role is also disabled
    });
  }

  ngOnInit(): void {
    this.authService.user.pipe(take(1)).subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.profileForm.patchValue({
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        });
      }
      this.isLoading = false;
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.errorMessage = 'Please fix the form errors.';
      return;
    }

    this.isSaving = true;
    this.successMessage = null;
    this.errorMessage = null;

    const updatedData = this.profileForm.value;

    this.authService.updateProfile(updatedData).pipe(
      take(1),
      tap(updatedUser => {
        this.isSaving = false;
        this.successMessage = 'Profile updated successfully!';
      })
    ).subscribe({
      error: err => {
        this.isSaving = false;
        this.errorMessage = 'Failed to update profile. Please try again.';
        console.error('Update profile error', err);
      }
    });
  }
}