// frontend/src/app/Interceptors/auth.interceptor.ts
import { HttpHandlerFn, HttpEvent, HttpRequest, HttpInterceptorFn } from '@angular/common/http';
import { Observable } from 'rxjs';
import { inject } from '@angular/core'; // Crucial for functional interceptors
import { AuthService } from '../services/auth.service'; // Adjust path if necessary

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService); // Get AuthService instance

  const token = authService.getToken(); // Get token from localStorage via AuthService
  console.log("hii");
  console.log('AuthInterceptor: Checking token for request to', req.url);
  console.log('AuthInterceptor: Token found:', token ? 'YES (value: ' + token.substring(0, 10) + '...)' : 'NO'); // Log first 10 chars of token for brevity

  if (token) {
    // Clone the request and add the 'x-auth-token' header
    req = req.clone({
      setHeaders: {
        // 'Authorization': `Bearer ${token}`,
        'x-auth-token': token // This header name must match your backend's authMiddleware
      }
    });
  }

  return next(req); // Pass the modified (or original) request to the next handler
};