// frontend/src/app/core/services/show.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Show {
  _id: number; // Matches MongoDB _id (your custom number ID)
  movie_id: string; // Matches Movie._id (string)
  screen_id: string; // Matches Screen._id (ObjectId string)
  show_datetime: string; // ISO date string (combines date and time)
  normal_price: number;
  premium_price: number;
  seating_layout_id: string; // Reference to ShowSeat._id
  is_active: boolean;
  
}

// Payload for creating/updating a show
export interface ShowPayload {
  _id?: number;
  movie_id: string;
  screen_id: string;
  show_datetime: string; // Send as ISO string
  normal_price: number;
  premium_price: number;
  is_active?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ShowService {
  private apiUrl = environment.apiUrl + '/shows'; // Assuming /api/shows

  constructor(private http: HttpClient) { }

  getAllShows(): Observable<Show[]> {
    return this.http.get<Show[]>(this.apiUrl);
  }

  getShowById(id: number): Observable<Show> {
    return this.http.get<Show>(`${this.apiUrl}/${id}`);
  }

  // Get shows for a specific movie or screen (example)
  getShowsByMovieAndScreen(movieId: string, screenId: string, date?: string): Observable<Show[]> {
    let url = `${this.apiUrl}?movie_id=${movieId}&screen_id=${screenId}`;
    if (date) {
      url += `&date=${date}`; // Backend will need to parse this date string
    }
    return this.http.get<Show[]>(url);
  }

  createShow(showData: ShowPayload): Observable<Show> {
    return this.http.post<Show>(this.apiUrl, showData);
  }

  updateShow(id: number, showData: Partial<ShowPayload>): Observable<Show> {
    return this.http.put<Show>(`${this.apiUrl}/${id}`, showData);
  }

  deleteShow(id: number): Observable<{ msg: string }> {
    return this.http.delete<{ msg: string }>(`${this.apiUrl}/${id}`);
  }
}