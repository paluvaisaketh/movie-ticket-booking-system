import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { interval } from 'rxjs';
import { LayoutComponent } from '../../../Core/layout/layout.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Movie, MovieService } from '../../../services/movie.service';
import { Banner } from '../../../services/banner.service';
import { MainPageService } from '../../../services/main-page.service';
import { lastValueFrom } from 'rxjs';

@Component({
  imports:[LayoutComponent, HttpClientModule, ReactiveFormsModule, CommonModule, RouterLink],
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css'],
  standalone: true,
  providers: [MainPageService, MovieService]
})
export class MainPageComponent implements OnInit {
  banners: Banner[] = [];
  allMovies: Movie[] = [];
  recommendedMovies: Movie[] = [];
  recentMovies: Movie[] = [];
  threeDMovies: Movie[] = [];
  
  currentSlide = 0;
  private carouselInterval: any;

  constructor(private http: HttpClient, private router: Router, private mainPageService: MainPageService) {}

  ngOnInit(): void {
    this.fetchData();
  }

  async fetchData(): Promise<void> {
    try {
      const data = await lastValueFrom(this.mainPageService.getMainPageData());
      
      this.banners = data.banners.filter(banner => banner.is_active);
      this.allMovies = data.movies;
      
      this.recommendedMovies = this.getMoviesByIds(data.movie_categories.recommended);
      this.recentMovies = this.getMoviesByIds(data.movie_categories.recent);
      this.threeDMovies = this.getMoviesByIds(data.movie_categories['3d']);
      
      this.startCarousel();
    } catch (error) {
      console.error('Error fetching main page data:', error);
      // Handle error, e.g., show a message to the user
    }
  }

  getMoviesByIds(ids: string[]): Movie[] {
    return this.allMovies.filter(movie => ids.includes(movie._id));
  }

  startCarousel(): void {
    if (this.banners.length > 1) {
      this.carouselInterval = interval(5000).subscribe(() => {
        this.nextSlide();
      });
    }
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.banners.length;
  }

  prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.banners.length) % this.banners.length;
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
  }

  navigateToMovie(movieId: string): void {
    this.router.navigate(['/movies'], { queryParams: { movieId: movieId } });
  }

  navigateToMovies(): void {
    this.router.navigate(['/movies']);
  }

  ngOnDestroy(): void {
    if (this.carouselInterval) {
      this.carouselInterval.unsubscribe();
    }
  }
}


