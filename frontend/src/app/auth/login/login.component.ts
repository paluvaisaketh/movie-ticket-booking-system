import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service'; // Adjust path if necessary
import { CommonModule } from '@angular/common';

@Component({
  imports: [ReactiveFormsModule, CommonModule],
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isOTPSent = false; // Flag to switch between phone input and OTP input
  phoneForOTP: string = ''; // Stores the phone number after sending OTP
  errorMessage: string = '';
  isLoading = false; // To show loading spinner/state
  @Output() close = new EventEmitter<void>(); // Emits when login modal should close

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]] // OTP is 6 digits
    });
  }

  ngOnInit(): void {
    if (this.authService.currentUserValue) {
      this.close.emit(); // Close the login modal if already logged in
    }
  }

  goBack(): void {
    this.isOTPSent = false;
    this.loginForm.get('phone')?.enable();
    this.loginForm.get('otp')?.reset();
    this.errorMessage = '';
  }

  onSubmit(): void {
    if (!this.isOTPSent) {
      this.sendOTP();
    } else {
      this.verifyOTP();
    }
  }

  private sendOTP(): void {
    this.errorMessage = '';
    if (this.loginForm.controls['phone'].invalid) {
      this.errorMessage = 'Please enter a valid 10-digit mobile number.';
      this.loginForm.controls['phone'].markAsTouched();
      return;
    }

    this.isLoading = true;
    this.phoneForOTP = this.loginForm.value.phone;

    this.authService.sendOtp(this.phoneForOTP).subscribe({
      next: (res: { msg: string }) => {
        console.log(res.msg);
        this.isOTPSent = true;
        this.loginForm.get('phone')?.disable();
        this.isLoading = false;
        this.errorMessage = '';
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error sending OTP:', err);
        this.errorMessage = err.error?.msg || 'Failed to send OTP. Please try again.';
      },
    });
  }

  private verifyOTP(): void {
    this.errorMessage = '';
    if (this.loginForm.controls['otp'].invalid) {
      this.errorMessage = 'Please enter a valid 6-digit OTP.';
      this.loginForm.controls['otp'].markAsTouched();
      return;
    }

    this.isLoading = true;
    const otp = this.loginForm.value.otp;

    this.authService.verifyOtp(this.phoneForOTP, otp).subscribe({
      next: (response: { token: string, user: User }) => {
        console.log('Login successful', response.user);
        this.isLoading = false;
        this.errorMessage = '';

        this.close.emit();

        const returnUrl = this.router.routerState.snapshot.root.queryParams['returnUrl'] || '/';
        if (response.user.role === 'admin') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigateByUrl(returnUrl);
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Failed to verify OTP:', err);
        this.errorMessage = err.error?.msg || 'Invalid or expired OTP. Please try again.';
      }
    });
  }

  closeLoginModal(): void {
    this.close.emit();
    document.body.classList.remove('no-scroll');
  }

  resetFormState(): void {
    this.loginForm.reset();
    this.loginForm.get('phone')?.enable();
    this.isOTPSent = false;
    this.phoneForOTP = '';
    this.errorMessage = '';
    this.isLoading = false;
  }
}