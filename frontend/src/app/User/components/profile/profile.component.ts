import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClientModule } from '@angular/common/http'; // Keep if not provided at root
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../../../Core/layout/layout.component'; // Assuming correct path
import Swal from 'sweetalert2';

// Import new AuthService and User interface
import { AuthService, User } from '../../../services/auth.service'; // Adjust path if needed

// Removed old User and ApiResponse interfaces

@Component({
  imports: [HttpClientModule, ReactiveFormsModule, RouterLink, CommonModule, LayoutComponent],
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  successMessage: string | null = null; // To display success messages

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    // private http: HttpClient // No longer needed directly if using AuthService for profile updates
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.pattern('^[A-Za-z\\s]+$')]],
      email: ['', [Validators.required, Validators.email]],
      phone: [{ value: '', disabled: true }, Validators.required], // Phone is disabled as it's the primary ID
      dob: [''] // Date of birth
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadUserProfile();
  }

  async loadUserProfile(): Promise<void> {
    this.isLoading = true;
    this.error = null;
    this.successMessage = null;

    const currentUser = this.authService.currentUserValue; // Use currentUserValue
    if (!currentUser) {
      this.router.navigate(['/login']);
      this.isLoading = false;
      return;
    }

    try {
      // Fetch the full user profile from the backend
      const userProfile = await this.authService.getMe().toPromise(); // Call getMe()
      if (userProfile) {
        this.profileForm.patchValue({
          fullName: userProfile.name,
          email: userProfile.email,
          phone: userProfile.phone, // Phone is disabled, but patch its value
        dob: userProfile.dob ? new Date(userProfile.dob).toISOString().split('T')[0] : ''
        });
      }
      this.isLoading = false;
    } catch (err: any) {
      console.error('Failed to load user profile:', err);
      this.error = 'Failed to load profile. Please try again.';
      this.isLoading = false;
      // Handle specific error types (e.g., redirect to login on 401)
      if (err.status === 401 || err.status === 403) {
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    }
  }

  async updateProfile(): Promise<void> {
    this.error = null;
    this.successMessage = null;

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.error = 'Please fix the validation errors.';
      return;
    }

    this.isLoading = true;
    const currentUser = this.authService.currentUserValue; // Use currentUserValue
    if (!currentUser) {
      this.router.navigate(['/login']);
      this.isLoading = false;
      return;
    }

    try {
      // Construct payload with only editable fields
      const updatePayload: Partial<User> = {
        name: this.profileForm.value.fullName,
        email: this.profileForm.value.email,
        dob: this.profileForm.value.dob // Ensure dob is correctly handled (e.g., Date object or string)
      };

      // Call the updateProfile method from AuthService
      const updatedUser = await this.authService.updateProfile(updatePayload).toPromise();

      // AuthService already updates local storage and BehaviorSubject
      this.isLoading = false;
      this.successMessage = 'Profile updated successfully!';
      console.log('Profile updated successfully:', updatedUser);

    } catch (err: any) {
      console.error('Failed to update profile:', err);
      this.error = err.error?.msg || 'Failed to update profile. Please try again.';
      this.isLoading = false;
    }
  }

  // logout(): void {
  //   this.authService.logout();
  // }
  logout(): void {
  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you really want to log out?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, log out',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      this.authService.logout();
    }
  });
}
}