// frontend/src/app/services/payment.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

import { Movie } from '../services/movie.service';
import { Show } from '../services/show.service';
import { Theatre } from '../services/theatre.service';

interface PopulatedShow extends Show {
  movie_details?: Movie;
  screen_details?: {
    _id: string;
    theatre_id: string;
    name: string;
  };
}

export interface PaymentPageData {
  show: PopulatedShow;
  theatre: Theatre;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPaymentPageData(showId: number, screenId: string): Observable<PaymentPageData> {
    const show$ = this.http.get<PopulatedShow>(`${this.apiUrl}/shows/${showId}`);
    const theatre$ = this.http.get<Theatre>(`${this.apiUrl}/theatres/${screenId}`);

    return forkJoin({
      show: show$,
      theatre: theatre$
    });
  }
}