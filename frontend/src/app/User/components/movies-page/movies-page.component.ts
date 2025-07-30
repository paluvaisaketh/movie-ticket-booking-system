import { Component, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MovieDetailsDialogComponent } from '../movie-details-dialog/movie-details-dialog.component';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../../../Core/layout/layout.component';
import { RouterLink } from '@angular/router';
import { forkJoin, lastValueFrom } from 'rxjs';

import { Movie, MovieService } from '../../../services/movie.service'; // Use the existing MovieService
import { ShowService, Show } from '../../../services/show.service';
import { TheatreService, Theatre, Screen } from '../../../services/theatre.service';


interface ShowWithDetails extends Show {
  screenName: string;
  format: string;
  available_seats?: number;
}

interface CinemaListing {
  theatre: Theatre;
  showtimes: ShowWithDetails[];
}

interface FilterOption {
  label: string;
  value: string;
}

interface DateOption {
  date: string;
  day: number;
  weekday: string;
}

@Component({
  imports: [HttpClientModule, LayoutComponent, CommonModule, FormsModule, RouterLink],
  selector: 'app-movies',
  templateUrl: './movies-page.component.html',
  styleUrls: ['./movies-page.component.css'],
  standalone: true,
  providers: [MovieService, ShowService, TheatreService, DatePipe]
})
export class MoviesPageComponent implements OnInit {
  allMovies: Movie[] = [];
  filteredMovies: Movie[] = [];
  selectedMovie: Movie | null = null;
  showBookingPage = false;
  dateOptions: DateOption[] = [];
  selectedDateIndex = 0;
  filteredShowtimes: CinemaListing[] = [];
  uniqueLanguages: string[] = [];
  bookingLanguageFilter = '';
  bookingFormatFilter = '';

  // Filter options
  languages: FilterOption[] = [
    { label: 'All', value: 'all' },
    { label: 'Tamil', value: 'tamil' },
    { label: 'Hindi', value: 'hindi' },
    { label: 'Telugu', value: 'telugu' },
    { label: 'English', value: 'english' }
  ];

  genres: FilterOption[] = [
    { label: 'All', value: 'all' },
    { label: 'Action', value: 'action' },
    { label: 'Comedy', value: 'comedy' },
    { label: 'Drama', value: 'drama' },
    { label: 'Thriller', value: 'thriller' },
    { label: 'Romance', value: 'romance' },
    { label: 'Sci-Fi', value: 'scifi' },
    { label: 'Horror', value: 'horror' }
  ];

  formats: FilterOption[] = [
    { label: 'All', value: 'all' },
    { label: '2D', value: '2d' },
    { label: '3D', value: '3d' },
    { label: 'IMAX', value: 'imax' }
  ];

  ratings: FilterOption[] = [
    { label: 'All', value: 'all' },
    { label: 'U', value: 'U' },
    { label: 'UA', value: 'UA' },
    { label: 'A', value: 'A' }
  ];

  currentFilters = {
    language: 'all',
    genre: 'all',
    format: 'all',
    rating: 'all'
  };

  private allShows: Show[] = [];
  private allTheatres: Theatre[] = [];
  
  constructor(
    private movieService: MovieService,
    private showService: ShowService,
    private theatreService: TheatreService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.fetchData();
    this.generateDateOptions();
  }

  async fetchData(): Promise<void> {
    try {
      const [movies, shows, theatres] = await lastValueFrom(
        forkJoin([
          this.movieService.getAllMovies(),
          this.showService.getAllShows(),
          this.theatreService.getAllTheatres()
        ])
      );
      this.allMovies = movies;
      this.allShows = shows;
      this.allTheatres = theatres;
      
      this.filterMovies();
      this.uniqueLanguages = [...new Set(this.allMovies.map(m => m.language))];

      this.route.queryParams.subscribe(params => {
        if (params['movieId']) {
          const movie = this.allMovies.find(m => m._id === params['movieId']);
          if (movie) {
            this.showBookingPage = true;
            this.selectedMovie = movie;
            this.filterShowtimes();
          }
        }
      });
    } catch (error) {
      console.error('Failed to fetch movie data:', error);
      // Handle error, e.g., show a message to the user
    }
  }

  filterMovies(): void {
    this.filteredMovies = this.allMovies.filter(movie => {
      // Language filter
      if (this.currentFilters.language !== 'all' &&
        !movie.language.toLowerCase().includes(this.currentFilters.language.toLowerCase())) {
        return false;
      }

      // Genre filter
      if (this.currentFilters.genre !== 'all' &&
        !movie.genre?.some(g => g.toLowerCase().includes(this.currentFilters.genre.toLowerCase()))) {
        return false;
      }

      // Format filter
      if (this.currentFilters.format !== 'all' &&
        !movie.formats?.includes(this.currentFilters.format)) {
        return false;
      }

      // Rating filter
      if (this.currentFilters.rating !== 'all') {
        if (!movie.rating.includes(this.currentFilters.rating.toUpperCase())) {
          return false;
        }
      }

      return true;
    });
  }

  applyFilter(type: 'language' | 'genre' | 'format' | 'rating', value: string): void {
    this.currentFilters[type] = value;
    this.filterMovies();
  }

  clearFilters(): void {
    this.currentFilters = {
      language: 'all',
      genre: 'all',
      format: 'all',
      rating: 'all'
    };
    this.filterMovies();
  }

  openBookingPage(movie: Movie): void {
    this.selectedMovie = movie;
    this.showBookingPage = true;
    this.bookingLanguageFilter = '';
    this.bookingFormatFilter = '';
    this.filterShowtimes();
  }

  generateDateOptions(): void {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      this.dateOptions.push({
        date: this.datePipe.transform(date, 'yyyy-MM-dd')!,
        day: date.getDate(),
        weekday: days[date.getDay()]
      });
    }
  }

  selectDate(index: number): void {
    this.selectedDateIndex = index;
    this.filterShowtimes();
  }

  filterShowtimes(): void {
    if (!this.selectedMovie) return;

    const selectedDate = this.dateOptions[this.selectedDateIndex].date;
    const theatreMap = new Map<string, CinemaListing>();
    const now = new Date();

    const filteredShows = this.allShows.filter(show => {
      const showDate = this.datePipe.transform(show.show_datetime, 'yyyy-MM-dd');
      const movieMatches = show.movie_id === this.selectedMovie?._id;
      const dateMatches = showDate === selectedDate;

       // New condition: Check if the showtime is in the future
      const isFutureShow = new Date(show.show_datetime) > now;

      // Assuming movie format and language are part of the `movie` object
      const languageMatches = !this.bookingLanguageFilter || this.selectedMovie?.language === this.bookingLanguageFilter;
      const formatMatches = !this.bookingFormatFilter || this.selectedMovie?.formats?.includes(this.bookingFormatFilter);
      
      return show.is_active && movieMatches && dateMatches && languageMatches && formatMatches && isFutureShow;
    });

    filteredShows.forEach(show => {
      const screen = this.allTheatres.flatMap(t => t.screens || []).find(s => s._id === show.screen_id);
      if (!screen) return;

      const theatre = this.allTheatres.find(t => t.screens?.some(s => s._id === screen._id));
      if (!theatre) return;

      const screenName = screen ? screen.name : `Screen ${show.screen_id}`;

      if (!theatreMap.has(theatre._id)) {
        theatreMap.set(theatre._id, {
          theatre: theatre,
          showtimes: []
        });
      }

      const cinema = theatreMap.get(theatre._id);
      if (cinema) {
        cinema.showtimes.push({
          ...show,
          screenName: screenName,
          format: this.selectedMovie?.formats?.[0] || '2D', // Placeholder, adjust if formats are per-show
          available_seats: Math.floor(Math.random() * 100) + 1 // Mock data for now
        });
      }
    });

    this.filteredShowtimes = Array.from(theatreMap.values());
  }

  viewMovieDetails(): void {
    if (!this.selectedMovie) return;

    this.dialog.open(MovieDetailsDialogComponent, {
      width: '600px',
      data: {
        movie: this.selectedMovie
      }
    });
  }

  backToMovies(): void {
    this.showBookingPage = false;
    this.selectedMovie = null;
  }
}