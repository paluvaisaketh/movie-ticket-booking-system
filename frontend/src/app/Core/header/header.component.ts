// frontend/src/app/Core/header/header.component.ts
import { Component, OnInit } from '@angular/core';
import { ProfileDropdownComponent } from '../profile-dropdown/profile-dropdown.component';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LoginComponent } from '../../auth/login/login.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../../services/search.service';
import { AuthService, User } from '../../services/auth.service'; // Import User interface
import { MovieService, Movie } from '../../services/movie.service'; // Import MovieService

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [ProfileDropdownComponent, RouterLink, RouterLinkActive, LoginComponent, CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  providers: [MovieService] // Provide MovieService here
})
export class HeaderComponent implements OnInit {
    showLoginModal = false;
    isMobileMenuOpen = false;
    searchTerm: string = '';
    isLoggedIn: boolean = false;
    isAdmin: boolean = false;
    showProfileDropdown: boolean = false;
    
    allMovies: Movie[] = [];
    searchResults: Movie[] = [];
    
    private allMoviesFetched = false;

    constructor(
      private router: Router,
      private authService: AuthService,
      private movieService: MovieService // Inject the MovieService
    ) {}

    ngOnInit(): void {
      this.authService.user.subscribe(user => {
        this.isLoggedIn = !!user;
        this.isAdmin = user?.role === 'admin';
      });

      // Fetch all movies when the header component initializes
      this.movieService.getAllMovies().subscribe(movies => {
        this.allMovies = movies;
        this.allMoviesFetched = true;
      });
    }

    // Function to perform the search
    searchMovies(): void {
      if (this.searchTerm.trim() === '' || !this.allMoviesFetched) {
        this.searchResults = [];
        return;
      }
      this.searchResults = this.allMovies.filter(movie => 
        movie.title.toLowerCase().includes(this.searchTerm.toLowerCase())
      ).slice(0, 5); // Limit to 5 results
    }

    // Navigates to the movie's shows page and clears the search bar
    navigateToMovie(movieId: string): void {
      this.router.navigate(['/movies'], { queryParams: { movieId: movieId } });
      this.searchTerm = '';
      this.searchResults = [];
    }
    
    toggleMobileMenu(): void {
      const mobileMenu = document.getElementById('mobileMenu');
      mobileMenu?.classList.toggle('hidden');
    }

    openLoginModal(): void {
      this.showLoginModal = true;
      document.body.classList.add('no-scroll');
    }

    closeLoginModal(): void {
      this.showLoginModal = false;
      document.body.classList.remove('no-scroll');
    }
}