// frontend/src/app/core/services/theatre.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Screen {
  _id: string; // MongoDB ObjectId
  theatre_id: string; // MongoDB ObjectId
  name: string;
}

export interface Theatre {
  _id: string; // MongoDB ObjectId
  name: string;
  location: string;
  contact: string;
  is_active: boolean;
  created_at: string; // ISO date string
  screens?: Screen[]; // Backend might populate this
}

@Injectable({
  providedIn: 'root'
})
export class TheatreService {
  private apiUrl = environment.apiUrl + '/theatres'; // Assuming /api/theatres for theatre management

  constructor(private http: HttpClient) { }

  // Get all theatres (might only be one in your case, but good practice)
  getAllTheatres(): Observable<Theatre[]> {
    return this.http.get<Theatre[]>(this.apiUrl);
  }

  // Get a single theatre by its ID
  getTheatreById(id: string): Observable<Theatre> {
    return this.http.get<Theatre>(`${this.apiUrl}/${id}`);
  }

  // Update a theatre (Admin only)
  updateTheatre(id: string, theatreData: Partial<Theatre>): Observable<Theatre> {
    return this.http.put<Theatre>(`${this.apiUrl}/${id}`, theatreData);
  }

  // Get screens for a specific theatre (or all screens if needed)
  getScreensByTheatre(theatreId: string): Observable<Screen[]> {
    return this.http.get<Screen[]>(`${this.apiUrl}/${theatreId}/screens`); // Assuming /api/theatres/:theatreId/screens
  }

  getTheatreByScreenId(screenId: string): Observable<Theatre> {
    // This assumes your backend has an endpoint to search theatres by screenId
    // If not, you'd fetch all theatres and filter on the frontend,
    // but a backend endpoint is more efficient.
    // For now, we'll fetch all and filter, assuming screen_id is unique enough to find its theatre.
    // A more robust backend would have a direct endpoint like /api/theatres?screenId=...
    return new Observable<Theatre>(observer => {
      this.getAllTheatres().subscribe(
        theatres => {
          const foundTheatre = theatres.find(theatre => 
            theatre.screens?.some(screen => screen._id === screenId)
          );
          if (foundTheatre) {
            observer.next(foundTheatre);
          } else {
            observer.error(new Error('Theatre not found for screen ID'));
          }
          observer.complete();
        },
        error => observer.error(error)
      );
    });
  }

  // Create a new screen (Admin only)
  createScreen(theatreId: string, screenData: { name: string }): Observable<Screen> {
    return this.http.post<Screen>(`${this.apiUrl}/${theatreId}/screens`, screenData);
  }

  // Update a screen (Admin only)
  updateScreen(theatreId: string, screenId: string, screenData: Partial<{ name: string }>): Observable<Screen> {
    return this.http.put<Screen>(`${this.apiUrl}/${theatreId}/screens/${screenId}`, screenData);
  }

  // Delete a screen (Admin only)
  deleteScreen(theatreId: string, screenId: string): Observable<{ msg: string }> {
    return this.http.delete<{ msg: string }>(`${this.apiUrl}/${theatreId}/screens/${screenId}`);
  }
}