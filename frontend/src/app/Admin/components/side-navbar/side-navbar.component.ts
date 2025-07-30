// src/app/Admin/components/side-navbar/side-navbar.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { take } from 'rxjs/operators';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  selector: 'app-side-navbar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './side-navbar.component.html',
  styleUrl: './side-navbar.component.css'
})
export class SideNavbarComponent implements OnInit {
  isUserAdmin: boolean = false;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.authService.user.pipe(take(1)).subscribe(user => {
      this.isUserAdmin = user?.role === 'admin';
    });
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
          this.router.navigate(['/']);

    }
  });
}
}