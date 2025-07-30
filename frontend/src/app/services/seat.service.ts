// frontend/src/app/core/services/seat.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SeatInShowSeat {
  seat_number: string;
  seat_type: string;
  status: 'available' | 'booked' | 'blocked';
  booking_id: string | null; // ObjectId string
}

export interface ShowSeat {
  _id: string; // Matches ShowSeat._id (e.g., "show_seats_1")
  show_id: number; // Matches Show._id (number)
  screen_id: string; // Matches Screen._id (ObjectId string)
  seats: SeatInShowSeat[];
}

@Injectable({
  providedIn: 'root'
})
export class SeatService {
  private apiUrl = environment.apiUrl + '/seats'; // Assuming /api/seats

  constructor(private http: HttpClient) { }   

  // Get the real-time seat status for a specific show
  getShowSeatsStatus(showId: number): Observable<ShowSeat> {
    return this.http.get<ShowSeat>(`${this.apiUrl}/show/${showId}`); // GET /api/seats/show/:showId
  }

  // Admin: Block specific seats for a show
  blockSeats(showId: number, seatNumbers: string[], reason: string): Observable<{ msg: string }> {
    return this.http.post<{ msg: string }>(`${this.apiUrl}/block`, { show_id: showId, seat_numbers: seatNumbers, reason });
  }

  // Admin: Unblock specific seats for a show
  unblockSeats(showId: number, seatNumbers: string[], reason: string): Observable<{ msg: string }> {
    return this.http.post<{ msg: string }>(`${this.apiUrl}/unblock`, { show_id: showId, seat_numbers: seatNumbers, reason });
  }

  // Admin: Get seat templates (if needed for admin UI)
  getSeatTemplates(): Observable<any[]> { // Define a proper interface for SeatTemplate if needed
    return this.http.get<any[]>(`${this.apiUrl}/templates`);
  }
}