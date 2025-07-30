// frontend/src/app/admin/movies/movies.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SideNavbarComponent } from '../components/side-navbar/side-navbar.component';
// No longer need HttpClientModule import directly here as it's provided in AppModule
// import { HttpClientModule } from '@angular/common/http';

// Import the new MovieService and its interfaces
import { MovieService, Movie, MoviePayload } from '../../services/movie.service';
import { AdminHeaderComponent } from '../components/admin-header/admin-header.component';
// import { AuthService } from '../../services/auth.service'; // To check admin role if needed for UI

// Removed ApiResponse interface as we'll fetch specific resources

@Component({
  selector: 'app-movies',
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.css'],
  standalone: true,
  // Removed HttpClientModule from imports as it's provided at root in AppModule
  imports: [CommonModule, ReactiveFormsModule, SideNavbarComponent,AdminHeaderComponent],
})
export class MoviesComponent implements OnInit {
  movies: Movie[] = [];
  showForm = false;
  isEditing = false;
  currentMovieId: string | null = null; // This will now be MongoDB's _id (string)
  loading = true;
  error: string | null = null;
  showDeleteConfirmation = false;
  movieToDelete: string | null = null; // This will now be MongoDB's _id (string)

  // Form options
  ratingOptions = ['U', 'UA', 'A'];
  languageOptions = ['Tamil', 'English', 'Hindi', 'Telugu', 'Malayalam'];
  genreOptions = ['Action', 'Drama', 'Comedy', 'Thriller', 'Romance', 'Historical', 'Sci-Fi', 'Adventure'];
  formatOptions = ['2D', '3D', 'IMAX', '4DX', 'Dolby Atmos'];

  movieForm: FormGroup;
  // private apiUrl is no longer needed here, moved to services

  constructor(
    private fb: FormBuilder,
    private movieService: MovieService, // Inject MovieService
    // private authService: AuthService // Inject AuthService to potentially check admin status
  ) {
    this.movieForm = this.fb.group({
      // For new movies, admin might provide a custom ID. For updates, it's not needed in payload.
      // We'll add it conditionally in addMovie.
      id: [''], // Add ID field for new movie creation (optional for custom IDs)
      title: ['', Validators.required],
      poster: ['', [Validators.required, Validators.pattern('https?://.+')]],
      rating: ['U', Validators.required],
      language: ['Tamil', Validators.required],
      genre: [[], [Validators.required, Validators.minLength(1)]],
      formats: [[], [Validators.required, Validators.minLength(1)]],
      duration: ['', Validators.required],
      synopsis: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Ensure user is admin before fetching/displaying admin content (basic check)
    // if (!this.authService.isAdmin()) {
    //   this.error = 'Access Denied: You must be an administrator to view this page.';
    //   this.loading = false;
    //   return;
    // }
    this.fetchMovies();
  }

  fetchMovies(): void {
    this.loading = true;
    this.error = null;
    this.movieService.getAllMovies().subscribe({ // Call MovieService
      next: (movies) => {
        this.movies = movies; // Backend returns an array of movies directly
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load movies. Please try again later.';
        this.loading = false;
        console.error('Error fetching movies:', err);
      }
    });
  }

  handleImageError(event: any) {
    event.target.src = 'IMAGES/Elio.avif'; // Placeholder image
  }

  openAddForm(): void {
    this.isEditing = false;
    this.currentMovieId = null;
    this.movieForm.reset({
      id: '', // Clear ID for new movie
      rating: 'U',
      language: 'Tamil',
      genre: [],
      formats: []
    });
    this.showForm = true;
  }

  openEditForm(movie: Movie): void {
    this.isEditing = true;
    this.currentMovieId = movie._id; // Use _id from MongoDB
    this.movieForm.patchValue({
      // Do NOT patch 'id' field for editing, as it's the _id in MongoDB and not usually changed
      title: movie.title,
      poster: movie.poster,
      rating: movie.rating,
      language: movie.language,
      genre: movie.genre || [], // Ensure these are correctly populated by service
      formats: movie.formats || [], // Ensure these are correctly populated by service
      duration: movie.duration,
      synopsis: movie.synopsis
    });
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.movieForm.reset();
  }

  onGenreChange(event: any): void {
    const genre = event.target.value;
    const genres = this.movieForm.get('genre')?.value as string[] || [];

    if (event.target.checked) {
      if (!genres.includes(genre)) {
        genres.push(genre);
      }
    } else {
      const index = genres.indexOf(genre);
      if (index > -1) {
        genres.splice(index, 1);
      }
    }
    this.movieForm.get('genre')?.setValue(genres);
    this.movieForm.get('genre')?.markAsTouched();
  }

  onFormatChange(event: any): void {
    const format = event.target.value;
    const formats = this.movieForm.get('formats')?.value as string[] || [];

    if (event.target.checked) {
      if (!formats.includes(format)) {
        formats.push(format);
      }
    } else {
      const index = formats.indexOf(format);
      if (index > -1) {
        formats.splice(index, 1);
      }
    }
    this.movieForm.get('formats')?.setValue(formats);
    this.movieForm.get('formats')?.markAsTouched();
  }

  onSubmit(): void {
    if (this.movieForm.invalid) {
      this.movieForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    // Cast to MoviePayload interface for correct type checking
    const movieData: MoviePayload = this.movieForm.value;

    if (this.isEditing && this.currentMovieId) {
      // For update, the 'id' field in the form is not needed in the payload
      const updatePayload: Partial<MoviePayload> = { ...movieData };
      delete updatePayload.id; // Remove the ID from the payload for PUT request
      this.updateMovie(this.currentMovieId, updatePayload);
    } else {
      // For add, the 'id' field from the form is used as _id for the new movie
      // If the ID is not provided by the user, backend will generate ObjectId
      this.addMovie(movieData);
    }
  }

  // addMovie(movieData: MoviePayload): void {
  //   this.movieService.createMovie(movieData).subscribe({ // Call MovieService
  //     next: (newMovie) => {
  //       // Backend returns the newly created movie with its _id
  //       this.movies.push(newMovie); // Add to local array
  //       this.closeForm();
  //       this.loading = false;
  //     },
  //     error: (err) => {
  //       this.handleApiError(err, 'add movie');
  //     }
  //   });
  // }

   addMovie(movieData: MoviePayload): void {
    this.loading = true; // Ensure loading state is set
    let finalMovieData: MoviePayload = { ...movieData }; // Create a mutable copy of the payload

    // If the 'id' field in the form is empty, generate a new one
    if (!finalMovieData.id) {
      // Find the current highest numeric ID (e.g., from "M001", "M002")
      const currentMaxIdNum = this.movies.reduce((max, movie) => {
          // Extract numeric part from existing movie _id (e.g., "M001" -> 1)
          const num = parseInt(movie._id.replace('M', ''), 10);
          return num > max ? num : max;
      }, 0);
      // Generate a new ID (e.g., "M00" + next_number)
      finalMovieData.id = 'M' + (currentMaxIdNum + 1).toString().padStart(3, '0');
      console.log("Generated new movie ID (frontend):", finalMovieData.id); // For debugging
    }

    this.movieService.createMovie(finalMovieData).subscribe({ // Send the processed payload
      next: (newMovie) => {
        this.movies.push(newMovie); // Add to local array (will have _id)
        this.closeForm();
        this.loading = false;
      },
      error: (err) => {
        this.handleApiError(err, 'add movie');
      }
    });
  }

  updateMovie(id: string, movieData: Partial<MoviePayload>): void {
    this.movieService.updateMovie(id, movieData).subscribe({ // Call MovieService
      next: (updatedMovie) => {
        // Backend returns the updated movie
        this.movies = this.movies.map(movie =>
          movie._id === id ? updatedMovie : movie // Update local array
        );
        this.closeForm();
        this.loading = false;
      },
      error: (err) => {
        this.handleApiError(err, 'update movie');
      }
    });
  }

  confirmDelete(id: string): void {
    this.movieToDelete = id;
    this.showDeleteConfirmation = true;
  }

  deleteMovie(): void {
    if (!this.movieToDelete) {
      this.showDeleteConfirmation = false;
      return;
    }

    this.loading = true;
    this.error = null;

    this.movieService.deleteMovie(this.movieToDelete).subscribe({ // Call MovieService
      next: () => {
        this.movies = this.movies.filter(movie => movie._id !== this.movieToDelete); // Update local array
        this.showDeleteConfirmation = false;
        this.movieToDelete = null;
        this.loading = false;
      },
      error: (err) => {
        this.handleApiError(err, 'delete movie');
      }
    });
  }

  private handleApiError(error: any, action: string): void {
    console.error(`Error ${action}:`, error);

    if (error.status === 400) {
      this.error = error.error?.msg || 'Invalid data. Please check your inputs.';
    } else if (error.status === 401 || error.status === 403) {
      this.error = 'Authentication/Authorization failed. Please login as admin.';
      // Optionally redirect to login
    } else if (error.status === 404) {
      this.error = 'Resource not found. It might have been deleted.';
    } else {
      this.error = `Failed to ${action}. Please try again.`;
    }

    this.loading = false;
    this.showDeleteConfirmation = false;
  }
}