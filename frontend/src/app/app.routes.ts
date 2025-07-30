  import { Routes } from '@angular/router';
  import { MainPageComponent } from './User/components/main-page/main-page.component';
  import { MoviesPageComponent } from './User/components/movies-page/movies-page.component';   
  import { OffersPageComponent } from './User/components/offers-page/offers-page.component';  
  import { AboutusPageComponent } from './User/components/aboutus-page/aboutus-page.component'; 
  import { DashboardComponent } from './Admin/dashboard/dashboard.component';
  import { MoviesComponent } from './Admin/movies/movies.component';
  import { ReportsComponent } from './Admin/reports/reports.component';
  import { ContentManagementComponent } from './Admin/content-management/content-management.component';
  import { ShowsManagementComponent } from './Admin/shows-management/shows-management.component';
    import { SeatManagementComponent } from './Admin/seat-management/seat-management.component';
  import { LoginComponent } from './auth/login/login.component';
  import { ProfileComponent } from './User/components/profile/profile.component';
  import { BookingsComponent } from './User/components/bookings/bookings.component';
  import { AuthGuard } from './services/auth.guard';
  import { SeatSelectionComponent } from './User/components/seat-selection/seat-selection.component';
  import { PaymentComponent } from './User/components/payment/payment.component';
  import { BookingConfirmationComponent } from './User/components/bookingconfirmation/bookingconfirmation.component';
  import { adminGuard } from '../app/services/admin.guard'; // Import the new admin guard


  export const routes: Routes = [   
      { path: 'login', component: LoginComponent },
      {path:'',component:MainPageComponent},
      {path:'movies',component:MoviesPageComponent},
      {path:'offers',component:OffersPageComponent},
      {path:'aboutus',component:AboutusPageComponent},
      { path:'profile', component: ProfileComponent},
      { path:'bookings', component: BookingsComponent},
      {path:'seat-selection',component:SeatSelectionComponent},
      {path:'payment',component:PaymentComponent},
      {path:'booking-confirmation/:id',component:BookingConfirmationComponent},
      

    //   { 
    //   path: 'admin', 
    //   children: [
    //     { path: 'dashboard', component: DashboardComponent }, // admin/dashboard
    //     { path: 'movies', component: MoviesComponent },        // admin/movies
    //     { path: 'reports', component: ReportsComponent },      // admin/reports
    //     { path: 'content', component: ContentManagementComponent }, // admin/content
    //     { path: 'shows', component: ShowsManagementComponent}, // admin/shows
    //     {
    //       path: 'seats',
    //       loadComponent: () =>
    //         import('./Admin/seat-management/seat-management.component')
    //           .then(m => m.SeatManagementComponent),
    //     },   
    //     {
    //         path:'profile',component:ProfileComponent
    //     }
    //   ]
    // }


      {
    path: 'admin',
    canActivate: [adminGuard], // <-- Apply the admin guard here
    children: [
      { path: 'dashboard', loadComponent: () => import('./Admin/dashboard/dashboard.component').then(c => c.DashboardComponent) },
      { path: 'movies', loadComponent: () => import('./Admin/movies/movies.component').then(c => c.MoviesComponent) },
      { path: 'shows', loadComponent: () => import('./Admin/shows-management/shows-management.component').then(c => c.ShowsManagementComponent) },
      { path: 'seats', loadComponent: () => import('./Admin/seat-management/seat-management.component').then(c => c.SeatManagementComponent) },
      { path: 'reports', loadComponent: () => import('./Admin/reports/reports.component').then(c => c.ReportsComponent) },
      { path: 'content', loadComponent: () => import('./Admin/content-management/content-management.component').then(c => c.ContentManagementComponent) },
      { path: 'profile', loadComponent: () => import('./Admin/profile/profile.component').then(c => c.ProfileComponent) },
      {path: 'help-center', loadComponent: () => import('./Admin/help-center/help-center.component').then(c => c.HelpCenterComponent)},
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  ];

  // import { Routes } from '@angular/router';  
  // import { MainPageComponent } from './User/components/main-page/main-page.component';
  // import { MoviesPageComponent } from './User/components/movies-page/movies-page.component';
  // import { OffersPageComponent } from './User/components/offers-page/offers-page.component';
  // import { AboutusPageComponent } from './User/components/aboutus-page/aboutus-page.component';
  // import { DashboardComponent } from './Admin/dashboard/dashboard.component';
  // import { MoviesComponent } from './Admin/movies/movies.component';
  // import { ReportsComponent } from './Admin/reports/reports.component';
  // import { ContentManagementComponent } from './Admin/content-management/content-management.component';
  // import { ShowsManagementComponent } from './Admin/shows-management/shows-management.component';
  // import { SeatManagementComponent } from './Admin/seat-management/seat-management.component';

  // export const routes: Routes = [
  //   // Public routes (no authentication needed)
  //   { path: '', component: MainPageComponent },
  //   { path: 'movies', component: MoviesPageComponent },
  //   { path: 'offers', component: OffersPageComponent },
  //   { path: 'aboutus', component: AboutusPageComponent },
    

    
  //   // Admin routes (protected with AdminGuard)
  //   { 
  //     path: 'admin',
  //     canActivate: [AuthGuard, AdminGuard], // First check if logged in, then check if admin
  //     children: [
  //       { path: 'dashboard', component: DashboardComponent },
  //       { path: 'movies', component: MoviesComponent },
  //       { path: 'reports', component: ReportsComponent },
  //       { path: 'content', component: ContentManagementComponent },
  //       { path: 'shows', component: ShowsManagementComponent },
  //       { path: 'seats', component: SeatManagementComponent },
        
  //       // Admin redirect
  //       { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
  //     ]
  //   },
    
  //   // Fallback route
  //   { path: '**', redirectTo: '' }
  // ];