// src/app/Admin/components/admin-header/admin-header.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService, User } from '../../../services/auth.service';
import { take } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-admin-header',
  imports: [CommonModule,RouterLink ],
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.css']
})  
export class AdminHeaderComponent implements OnInit {
  adminUser: User | null = null;
  isDropdownOpen = false;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.authService.user.pipe(take(1)).subscribe(user => {
      this.adminUser = user;
    });
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']); // Redirect to home or login page
  }
}