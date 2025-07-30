// import { Injectable } from '@angular/core';
// import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
// import { Observable } from 'rxjs'; // Keep if other guards or complex logic might need it, otherwise can remove
// import { AuthService } from '../services/auth.service'; // Ensure correct relative path to auth.service

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthGuard implements CanActivate {
//   constructor(private authService: AuthService, private router: Router) {}

//   // canActivate can return Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree
//   // For a simple synchronous check, 'boolean' is sufficient.
//   canActivate(
//     route: ActivatedRouteSnapshot,
//     state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

//     // Check if there is a current user value (i.e., user is logged in)
//     const currentUser = this.authService.currentUserValue;

//     if (currentUser) {
//       // User is logged in, allow access to the route
//       return true;
//     } else {
//       // User is not logged in, redirect to the login page
//       // Pass the current URL as a query parameter so the user can be redirected back after login
//       this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
//       return false;
//     }
//   }
// }



import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service'; // Adjust path if necessary

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const currentUser = this.authService.currentUserValue;

    if (currentUser) {
      return true;
    } else {
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }
  }
}