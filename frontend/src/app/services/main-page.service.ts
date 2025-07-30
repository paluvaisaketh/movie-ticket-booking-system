// frontend/src/app/services/main-page.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

import { Movie } from '../services/movie.service';
import { Banner } from '../services/banner.service';

interface MovieCategories {
  recent: string[];
  recommended: string[];
  '3d': string[];
}

export interface MainPageData {
  banners: Banner[];
  movies: Movie[];
  movie_categories: MovieCategories;
}

@Injectable({
  providedIn: 'root'
})
export class MainPageService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMainPageData(): Observable<MainPageData> {
    const banners$ = this.http.get<Banner[]>(`${this.apiUrl}/banners`);
    const movies$ = this.http.get<Movie[]>(`${this.apiUrl}/movies`);
    const movieCategories$ = this.http.get<MovieCategories>(`${this.apiUrl}/categories`);

    return forkJoin({
      banners: banners$,
      movies: movies$,
      movie_categories: movieCategories$
    });
  }
}