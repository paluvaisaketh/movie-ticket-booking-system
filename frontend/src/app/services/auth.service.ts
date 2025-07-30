// // frontend/src/app/core/services/auth.service.ts
// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Router } from '@angular/router';
// import { Observable, BehaviorSubject } from 'rxjs';
// import { map, catchError, tap } from 'rxjs/operators';
// import { environment } from '../../../environments/environment'; // Adjust path based on your tsconfig.json baseUrl

// // Define User interface to match backend User model's returned fields
// export interface User {
//   _id: string; // MongoDB ObjectId
//   name?: string;
//   email?: string;
//   phone: string;
//   role: 'admin' | 'user';
//   is_verified: boolean;
//   dob?: string; // Add dob as it's in your model and profile update
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   private apiUrl = environment.apiUrl + '/auth';
//   private userSubject: BehaviorSubject<User | null>;
//   public user: Observable<User | null>;

//   constructor(private http: HttpClient, private router: Router) {
//     const currentUserJson = localStorage.getItem('currentUser');
//     this.userSubject = new BehaviorSubject<User | null>(currentUserJson ? JSON.parse(currentUserJson) : null);
//     this.user = this.userSubject.asObservable();
//   }

//   public get currentUserValue(): User | null {
//     return this.userSubject.value;
//   }

//   // POST /api/auth/send-otp
//   sendOtp(phone: string): Observable<{ msg: string }> {
//     return this.http.post<{ msg: string }>(`${this.apiUrl}/send-otp`, { phone });
//   }

//   // POST /api/auth/verify-otp
//   verifyOtp(phone: string, otp: string): Observable<{ token: string, user: User }> {
//     return this.http.post<{ token: string, user: User }>(`${this.apiUrl}/verify-otp`, { phone, otp }).pipe(
//       map(response => {
//         if (response && response.token && response.user) {
//           localStorage.setItem('token', response.token);
//           localStorage.setItem('currentUser', JSON.stringify(response.user));
//           this.userSubject.next(response.user);
//         }
//         return response;
//       }),
//       catchError(err => {
//         console.error('OTP verification error:', err);
//         throw err;
//       })
//     );
//   }

//   // GET /api/auth/me
//   getMe(): Observable<User> {
//     return this.http.get<User>(`${this.apiUrl}/me`).pipe(
//       tap(user => {
//         const currentUser = this.currentUserValue;
//         if (currentUser && currentUser._id === user._id) {
//           localStorage.setItem('currentUser', JSON.stringify(user));
//           this.userSubject.next(user);
//         }
//       }),
//       catchError(err => {
//         console.error('Error fetching user profile:', err);
//         if (err.status === 401 || err.status === 403) {
//           this.logout();
//         }
//         throw err;
//       })
//     );
//   }

//   // PUT /api/auth/profile
//   updateProfile(profileData: Partial<User>): Observable<User> {
//     return this.http.put<User>(`${this.apiUrl}/profile`, profileData).pipe(
//       tap(user => {
//         localStorage.setItem('currentUser', JSON.stringify(user));
//         this.userSubject.next(user);
//       }),
//       catchError(err => {
//         console.error('Error updating profile:', err);
//         throw err;
//       })
//     );
//   }

//   logout(): void {
//     localStorage.removeItem('token');
//     localStorage.removeItem('currentUser');
//     this.userSubject.next(null);
//     this.router.navigate(['/']);
//   }

//   isAdmin(): boolean {
//     const user = this.currentUserValue;
//     return user?.role === 'admin';
//   }

//   getToken(): string | null {
//     return localStorage.getItem('token');
//   }
// }



// frontend/src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router'; // Import ActivatedRoute
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Define User interface to match backend User model's returned fields
export interface User {
  _id: string; // MongoDB ObjectId
  name?: string;
  email?: string;
  phone: string;
  role: 'admin' | 'user';
  is_verified: boolean;
  dob?: string; // Add dob as it's in your model and profile update
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/auth';
  private userSubject: BehaviorSubject<User | null>;
  public user: Observable<User | null>;

  constructor(
    private http: HttpClient, 
    private router: Router,
    private route: ActivatedRoute // Inject ActivatedRoute
  ) {
    const currentUserJson = localStorage.getItem('currentUser');
    this.userSubject = new BehaviorSubject<User | null>(currentUserJson ? JSON.parse(currentUserJson) : null);
    this.user = this.userSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.userSubject.value;
  }

  // POST /api/auth/send-otp
  sendOtp(phone: string): Observable<{ msg: string }> {
    return this.http.post<{ msg: string }>(`${this.apiUrl}/send-otp`, { phone });
  }

  // POST /api/auth/verify-otp
  verifyOtp(phone: string, otp: string): Observable<{ token: string, user: User }> {
    return this.http.post<{ token: string, user: User }>(`${this.apiUrl}/verify-otp`, { phone, otp }).pipe(
      map(response => {
        if (response && response.token && response.user) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.userSubject.next(response.user);

          // Get the return URL from route parameters or default to home page
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.router.navigateByUrl(returnUrl);
        }
        return response;
      }),
      catchError(err => {
        console.error('OTP verification error:', err);
        throw err;
      })
    );
  }

  // GET /api/auth/me
  getMe(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap(user => {
        const currentUser = this.currentUserValue;
        if (currentUser && currentUser._id === user._id) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.userSubject.next(user);
        }
      }),
      catchError(err => {
        console.error('Error fetching user profile:', err);
        if (err.status === 401 || err.status === 403) {
          this.logout();
        }
        throw err;
      })
    );
  }

  // PUT /api/auth/profile
  updateProfile(profileData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, profileData).pipe(
      tap(user => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.userSubject.next(user);
      }),
      catchError(err => {
        console.error('Error updating profile:', err);
        throw err;
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.userSubject.next(null);
    this.router.navigate(['/']);
  }

  isAdmin(): boolean {
    const user = this.currentUserValue;
    return user?.role === 'admin';
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
  
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}