// frontend/src/app/Admin/help-center/help-center.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SideNavbarComponent } from '../components/side-navbar/side-navbar.component';
import { AdminHeaderComponent } from '../components/admin-header/admin-header.component';

@Component({
  standalone: true,
  selector: 'app-help-center',
  templateUrl: './help-center.component.html',
  styleUrls: ['./help-center.component.css'],
  imports: [CommonModule, RouterLink, SideNavbarComponent, AdminHeaderComponent]
})
export class HelpCenterComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {
  }
}