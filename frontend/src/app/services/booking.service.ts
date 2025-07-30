// // frontend/src/app/services/booking.service.ts
// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { environment } from '../../../environments/environment'; // Adjust path if needed
// import { Movie } from './movie.service'; // Import Movie interface
// import { Screen, Theatre } from './theatre.service'; // Import Screen & Theatre interface

// export interface SeatBooked {
//   seat_number: string;
//   seat_type: string;
//   price_at_booking: number;
// }

// export interface SnackItem {
//   name: string;
//   quantity: number;
//   price_per_item: number;
//   total_price: number;
// }

// // Updated Show interface to reflect backend population
// export interface PopulatedShow {
//   _id: number;
//   movie_id: string;
//   screen_id: string;
//   show_datetime: string;
//   normal_price: number;
//   premium_price: number;
//   seating_layout_id: string;
//   is_active: boolean;
//   movie_details?: Movie; // Populated movie object
//   screen_details?: Screen; // Populated screen object
// }

// // Updated Booking interface to reflect backend population
// export interface Booking {
//   _id: string; // MongoDB ObjectId
//   user_id: string; // MongoDB ObjectId (or User object if populated by backend)
//   show_id: PopulatedShow; // Now a populated show object
//   base_amount: number;
//   seats_booked: SeatBooked[];
//   snacks_items: SnackItem[];
//   parking_charges: number;
//   convenience_fee: number;
//   discount_applied: number;
//   final_amount: number;
//   status: 'pending' | 'confirmed' | 'cancelled' | 'refunded' | 'partially_cancelled';
//   created_at: string; // ISO Date String
// }

// // Payload for creating a booking (what frontend sends to backend)
// export interface BookingPayload {
//   show_id: number; // Only send the show ID (number)
//   seat_numbers: string[]; // Send just seat numbers, backend calculates details
//   snacks_items?: { name: string, quantity: number }[]; // Send just name and quantity
//   parking_charges?: number;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class BookingService {
//   private apiUrl = environment.apiUrl + '/bookings';

//   constructor(private http: HttpClient) { }

//   getUserBookings(): Observable<Booking[]> {
//     return this.http.get<Booking[]>(`${this.apiUrl}/my`); // GET /api/bookings/my
//   }

//   getBookingById(id: string): Observable<Booking> {
//     return this.http.get<Booking>(`${this.apiUrl}/${id}`); // GET /api/bookings/:id
//   }

//   createBooking(bookingData: BookingPayload): Observable<Booking> {
//     return this.http.post<Booking>(this.apiUrl, bookingData); // POST /api/bookings
//   }

//   // Full cancellation: PUT /api/bookings/:id/status { status: 'cancelled' }
//   cancelBooking(bookingId: string): Observable<{ msg: string }> {
//     return this.http.put<{ msg: string }>(`${this.apiUrl}/${bookingId}/status`, { status: 'cancelled' });
//   }

//   // Partial cancellation: PUT /api/bookings/:id/cancel-seats { seatsToCancel: string[] }
//   partialCancelBooking(bookingId: string, seatsToCancel: string[]): Observable<{ msg: string, booking: Booking }> {
//     return this.http.put<{ msg: string, booking: Booking }>(`${this.apiUrl}/${bookingId}/cancel-seats`, { seatsToCancel });
//   }

//   // Admin: Get all bookings
//   getAllBookingsAdmin(): Observable<Booking[]> {
//     return this.http.get<Booking[]>(this.apiUrl); // GET /api/bookings (admin route)
//   }
// }

// frontend/src/app/services/booking.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { Movie } from './movie.service';
import { Screen } from './theatre.service';

// Interfaces
export interface SeatBooked {
  seat_number: string;
  seat_type: string;
  price_at_booking: number;
}

export interface SnackItem {
  name: string;
  quantity: number;
  price_per_item: number;
  total_price: number;
}

export interface PopulatedShow {
  _id: number;
  movie_id: string;
  screen_id: string;
  show_datetime: string;
  normal_price: number;
  premium_price: number;
  seating_layout_id: string;
  is_active: boolean;
  movie_details?: Movie;
  screen_details?: Screen;
}

export interface Booking {
  _id: string;
  user_id: string;
  show_id: PopulatedShow;
  base_amount: number;
  seats_booked: SeatBooked[];
  snacks_items: SnackItem[];
  parking_charges: number;
  convenience_fee: number;
  discount_applied: number;
  final_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded' | 'partially_cancelled';
  created_at: string;
}

export interface BookingPayload {
  show_id: number;
  seat_numbers: string[];
  snacks_items?: { name: string, quantity: number }[];
  parking_charges?: number;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = environment.apiUrl + '/bookings';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Fallback headers in case interceptor fails
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-auth-token': token || ''
    });
  }

  // Main methods with both interceptor and fallback headers
  getUserBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/my`, {
      headers: this.getAuthHeaders()
    });
  }

  getBookingById(id: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  createBooking(bookingData: BookingPayload): Observable<Booking> {
    console.log('Creating booking with payload:', bookingData);
    console.log('Current token:', this.authService.getToken());
    
    return this.http.post<Booking>(this.apiUrl, bookingData, {
      headers: this.getAuthHeaders()
    });
  }

  cancelBooking(bookingId: string): Observable<{ msg: string }> {
    return this.http.put<{ msg: string }>(
      `${this.apiUrl}/${bookingId}/status`, 
      { status: 'cancelled' },
      { headers: this.getAuthHeaders() }
    );
  }

  partialCancelBooking(
    bookingId: string, 
    seatsToCancel: string[]
  ): Observable<{ msg: string, booking: Booking }> {
    return this.http.put<{ msg: string, booking: Booking }>(
      `${this.apiUrl}/${bookingId}/cancel-seats`,
      { seatsToCancel },
      { headers: this.getAuthHeaders() }
    );
  }

  // Admin-only method
  getAllBookingsAdmin(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.apiUrl, {
      headers: this.getAuthHeaders()
    });
  }
}