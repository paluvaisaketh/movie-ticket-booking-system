import { Component, EventEmitter, Output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../services/auth.service'; // Adjust path if necessary
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile-dropdown',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile-dropdown.component.html',
})
export class ProfileDropdownComponent {
  @Output() openLogin = new EventEmitter<void>();
  isOpen = false;
  currentUser: User | null = null; // Holds the current user data

  constructor(private router: Router, public authService: AuthService) {
    this.authService.user.subscribe(user => {
      this.currentUser = user; // Update local user property when AuthService user changes
    });
  }

  toggleDropdown(): void {
    if (!this.isLoggedIn) {
      this.openLogin.emit(); // Emit to parent to open login modal
      return;
    }
    this.isOpen = !this.isOpen;
  }

  get isLoggedIn(): boolean {
    return this.authService.currentUserValue !== null; // Check AuthService for current user state
  }

  // logout(): void {
  //   this.authService.logout();
  //   this.isOpen = false;
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
          this.isOpen = false;

    }
  });
}

  viewProfile(): void {
    this.router.navigate(['/profile']); // Navigate to user profile page
    this.isOpen = false;
  }
}