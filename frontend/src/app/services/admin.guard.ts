// src/app/services/admin.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { map, take } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user.pipe(
    take(1),
    map(user => {
      // Check if user exists and has the 'admin' role
      if (user && user.role === 'admin') {
        return true; // Allow access
      }
      // Redirect to home page if not an admin
      return router.createUrlTree(['/']);
    })
  );
};