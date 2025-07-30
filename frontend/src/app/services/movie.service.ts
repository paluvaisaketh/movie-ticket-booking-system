// frontend/src/app/core/services/movie.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; // Adjust path if needed

// Define interfaces to match your MongoDB schema outputs
// The backend's getMovieDetailsWithRelations helper constructs this full Movie object
export interface Movie {
  _id: string; // Matches MongoDB _id
  title: string;
  poster: string;
  rating: string;
  language: string;
  duration: string;
  synopsis: string;
  genre?: string[]; // Array of genre names (populated by backend)
  formats?: string[]; // Array of format names (populated by backend)
  categories?: string[]; // Array of category names (populated by backend)

}

// Payload for creating/updating a movie (what frontend sends to backend)
// 'id' is sent for custom _id on creation, not for updates where _id is in URL
export interface MoviePayload {
  id?: string; // Optional: used for new movie creation if you have custom IDs like M001
  title: string;
  poster: string;
  rating: string;
  language: string;
  duration: string;
  synopsis: string;
  genres: string[]; // Send as 'genres' (plural) as per backend controller
  formats: string[]; // Send as 'formats' (plural)
  categories?: string[]; // Optional for creation/update
}

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private apiUrl = environment.apiUrl + '/movies'; // Points to your backend /api/movies

  constructor(private http: HttpClient) { }

  getAllMovies(): Observable<Movie[]> {
    return this.http.get<Movie[]>(this.apiUrl); // GET /api/movies
  }

  getMovieById(id: string): Observable<Movie> {
    return this.http.get<Movie>(`${this.apiUrl}/${id}`); // GET /api/movies/:id
  }

  createMovie(movieData: MoviePayload): Observable<Movie> {
    // Backend expects 'id' for custom _id, and separate arrays for genres/formats/categories
    return this.http.post<Movie>(this.apiUrl, movieData); // POST /api/movies
  }

  updateMovie(id: string, movieData: Partial<MoviePayload>): Observable<Movie> {
    // Backend expects 'id' in URL, and updated fields in body
    return this.http.put<Movie>(`${this.apiUrl}/${id}`, movieData); // PUT /api/movies/:id
  }

  deleteMovie(id: string): Observable<{ msg: string }> {
    return this.http.delete<{ msg: string }>(`${this.apiUrl}/${id}`); // DELETE /api/movies/:id
  }
}