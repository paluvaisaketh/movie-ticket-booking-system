// // app/services/reports.service.ts

// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { forkJoin, Observable } from 'rxjs';
// import { environment } from '../../../environments/environment';

// // Internal interfaces for the service's data fetching,
// // mirroring the backend response structure.
// interface ServiceUser {
//   _id: string;
//   name: string;
//   email: string;
//   phone: string;
//   role: string;
//   created_at: string;
// }

// interface ServiceScreen {
//   _id: string;
//   name: string;
// }

// interface ServiceTheatre {
//   _id: string;
//   name: string;
//   location: string;
//   contact: string;
//   is_active: boolean;
//   created_at: string;
//   screens?: ServiceScreen[];
// }

// interface ServiceMovie {
//   _id: string;
//   title: string;
//   poster: string;
//   rating: string;
//   language: string;
//   genre: string[];
//   duration: string;
//   synopsis: string;
//   formats: string[];
// }

// interface ServiceOffer {
//   _id: string;
//   code: string;
//   title: string;
//   discount_type: string;
//   discount_value: number;
//   min_amount: number;
//   max_discount: number | null;
//   valid_from: string;
//   valid_to: string;
//   created_at: string;
// }

// interface ServiceBooking {
//   _id: string;
//   user_id: string;
//   show_id: number;
//   seats_booked: {
//     seat_number: string;
//     price_at_booking: number;
//     seat_type: string;
//   }[];
//   base_amount: number;
//   convenience_fee: number;
//   discount_applied: number;
//   final_amount: number;
//   status: string;
//   created_at: string;
// }

// interface ServiceBookingOffer {
//   _id: string;
//   booking_id: string;
//   offer_id: string;
//   discount_amount: number;
//   created_at: string;
// }

// interface ServicePayment {
//   _id: string;
//   booking_id: string;
//   original_amount: number;
//   final_amount: number;
//   payment_method: string;
//   receipt_number: string;
//   status: string;
//   created_at: string;
// }

// interface ServiceShow {
//   _id: number;
//   movie_id: string;
//   screen_id: string;
//   show_datetime: string;
//   normal_price: number;
//   premium_price: number;
//   is_active: boolean;
// }

// // Consolidated Interface for the data fetched by this service
// export interface ReportsData {
//   users: ServiceUser[];
//   movies: ServiceMovie[];
//   shows: ServiceShow[];
//   bookings: ServiceBooking[];
//   offers: ServiceOffer[];
//   theatres: ServiceTheatre[];
//   payments: ServicePayment[];
//   bookingOffers: ServiceBookingOffer[];
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class ReportsService {
//   private apiUrl = environment.apiUrl;

//   constructor(private http: HttpClient) {}

//   getReportsData(): Observable<ReportsData> {
//     const users$ = this.http.get<ServiceUser[]>(`${this.apiUrl}/users`);
//     const movies$ = this.http.get<ServiceMovie[]>(`${this.apiUrl}/movies`);
//     const shows$ = this.http.get<ServiceShow[]>(`${this.apiUrl}/shows`);
//     const bookings$ = this.http.get<ServiceBooking[]>(`${this.apiUrl}/bookings`);
//     const offers$ = this.http.get<ServiceOffer[]>(`${this.apiUrl}/offers`);
//     const theatres$ = this.http.get<ServiceTheatre[]>(`${this.apiUrl}/theatres`);
//     const payments$ = this.http.get<ServicePayment[]>(`${this.apiUrl}/payments`);
//     const bookingOffers$ = this.http.get<ServiceBookingOffer[]>(`${this.apiUrl}/booking-offers`); // Assumed endpoint

//     return forkJoin({
//       users: users$,
//       movies: movies$,
//       shows: shows$,
//       bookings: bookings$,
//       offers: offers$,
//       theatres: theatres$,
//       payments: payments$,
//       bookingOffers: bookingOffers$
//     });
//   }
// }


// reports.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

// Interfaces
interface ServiceUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
}

interface ServiceScreen {
  _id: string;
  name: string;
}

interface ServiceTheatre {
  _id: string;
  name: string;
  location: string;
  contact: string;
  is_active: boolean;
  created_at: string;
  screens?: ServiceScreen[];
}

interface ServiceMovie {
  _id: string;
  title: string;
  poster: string;
  rating: string;
  language: string;
  genre: string[];
  duration: string;
  synopsis: string;
  formats: string[];
}

interface ServiceOffer {
  _id: string;
  code: string;
  title: string;
  discount_type: string;
  discount_value: number;
  min_amount: number;
  max_discount: number | null;
  valid_from: string;
  valid_to: string;
  created_at: string;
}

interface ServiceBooking {
  _id: string;
  user_id: string;
  show_id: number;
  seats_booked: {
    seat_number: string;
    price_at_booking: number;
    seat_type: string;
  }[];
  base_amount: number;
  convenience_fee: number;
  discount_applied: number;
  final_amount: number;
  status: string;
  created_at: string;
}

interface ServiceBookingOffer {
  _id: string;
  booking_id: string;
  offer_id: string;
  discount_amount: number;
  created_at: string;
}

interface ServicePayment {
  _id: string;
  booking_id: string;
  original_amount: number;
  final_amount: number;
  payment_method: string;
  receipt_number: string;
  status: string;
  created_at: string;
}

interface ServiceShow {
  _id: number;
  movie_id: string;
  screen_id: string;
  show_datetime: string;
  normal_price: number;
  premium_price: number;
  is_active: boolean;
}

export interface ReportsData {
  users: ServiceUser[];
  movies: ServiceMovie[];
  shows: ServiceShow[];
  bookings: ServiceBooking[];
  offers: ServiceOffer[];
  theatres: ServiceTheatre[];
  payments: ServicePayment[];
  bookingOffers: ServiceBookingOffer[];
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-auth-token': token || ''
    });
  }

  private get<T>(url: string): Observable<T> {
    return this.http.get<T>(url, { headers: this.getAuthHeaders() });
  }

  getReportsData(): Observable<ReportsData> {
    const options = { headers: this.getAuthHeaders() };

    return forkJoin({
      users: this.http.get<ServiceUser[]>(`${this.apiUrl}/users`, options),
      movies: this.http.get<ServiceMovie[]>(`${this.apiUrl}/movies`, options),
      shows: this.http.get<ServiceShow[]>(`${this.apiUrl}/shows`, options),
      bookings: this.http.get<ServiceBooking[]>(`${this.apiUrl}/bookings`, options),
      offers: this.http.get<ServiceOffer[]>(`${this.apiUrl}/offers`, options),
      theatres: this.http.get<ServiceTheatre[]>(`${this.apiUrl}/theatres`, options),
      payments: this.http.get<ServicePayment[]>(`${this.apiUrl}/payments`, options),
      bookingOffers: this.http.get<ServiceBookingOffer[]>(`${this.apiUrl}/offers`, options)
    });
  }

  // Additional report-specific methods can be added here
  getCustomReport(params: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/reports/custom`, {
      headers: this.getAuthHeaders(),
      params
    });
  }
}