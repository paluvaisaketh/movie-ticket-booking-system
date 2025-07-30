// src/app/Admin/content-management/content-management.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SideNavbarComponent } from '../components/side-navbar/side-navbar.component';
import { HttpClientModule } from '@angular/common/http';
import { AdminHeaderComponent } from '../components/admin-header/admin-header.component';
import { catchError, forkJoin, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService, User } from '../../services/auth.service'; // <-- Import AuthService
import { Router } from '@angular/router'; // <-- Import Router

// Interfaces to match backend schemas
interface Banner {
  _id: string;
  position: number;
  title: string;
  target_url: string;
  image_url: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  created_by: string;
  created_at: string;
}

interface Offer {
  _id: string;
  code: string;
  title: string;
  discount_type: 'fixed' | 'percentage';
  discount_value: number;
  min_amount: number;
  max_discount: number | null;
  valid_from: string;
  valid_to: string;
  is_active: boolean;
  created_at: string;
}

interface Movie {
  _id: string;
  title: string;
  poster: string;
  rating: string;
  language: string;
  genre: string[];
  duration: string;
  synopsis: string;
  formats: string[];
}

interface MovieCategories {
  recent: string[];
  recommended: string[];
  '3d': string[];
}

@Component({
  selector: 'app-content-management',
  templateUrl: './content-management.component.html',
  styleUrls: ['./content-management.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SideNavbarComponent,
    HttpClientModule,
    AdminHeaderComponent
  ],
  providers: [DatePipe]
})
export class ContentManagementComponent implements OnInit {
  loading: boolean = true;
  error: string | null = null;
  successMessage: string = '';
  showProfileDropdown: boolean = false;
  
  private baseUrl = environment.apiUrl;
  private currentUser: User | null = null;

  tabs = [
    { id: 'banners', name: 'Banners' },
    { id: 'offers', name: 'Offers' },
    { id: 'movies', name: 'Movie Categories' }
  ];
  activeTab: string = 'banners';

  banners: Banner[] = [];
  offers: Offer[] = [];
  movies: Movie[] = [];
  movieCategories: MovieCategories = {
    recent: [],
    recommended: [],
    '3d': []
  };

  showBannerModal: boolean = false;
  editingBanner: boolean = false;
  bannerForm: Partial<Banner> = {
    title: '',
    target_url: '',
    image_url: '',
    position: 1,
    is_active: true,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  };

  showOfferModal: boolean = false;
  editingOffer: boolean = false;
  offerForm: Partial<Offer> = {
    code: '',
    title: '',
    discount_type: 'fixed',
    discount_value: 100,
    min_amount: 300,
    max_discount: null,
    is_active: true,
    valid_from: new Date().toISOString().split('T')[0],
    valid_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  };

  showCategoryMovieModal: boolean = false;
  currentCategory: keyof MovieCategories | null = null;
  selectedMoviesForCategory: string[] = [];
  categoryDisplayNames = {
    recommended: 'Recommended',
    recent: 'Recent Releases',
    '3d': '3D Releases'
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService, // <-- Inject AuthService
    private router: Router // <-- Inject Router
  ) {
    // Subscribe to the user subject to get real-time user info
    this.authService.user.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnInit(): void {
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      this.handleError('Access denied: You must be an admin to view this page.');
      this.router.navigate(['/login']); // Redirect non-admins
    } else {
      this.fetchAllData();
    }
  }

  get token(): string {
    return this.authService.currentUserValue ? localStorage.getItem('token') || '' : '';
  }

  fetchAllData(): void {
    this.loading = true;
    const headers = { 'Authorization': `Bearer ${this.token}` };

    const movies$ = this.http.get<Movie[]>(`${this.baseUrl}/movies`, { headers }).pipe(
      catchError(err => {
        this.handleError('Failed to load movies.', err);
        return of([]);
      })
    );
    const offers$ = this.http.get<Offer[]>(`${this.baseUrl}/offers`, { headers }).pipe(
      catchError(err => {
        this.handleError('Failed to load offers.', err);
        return of([]);
      })
    );
    const banners$ = this.http.get<Banner[]>(`${this.baseUrl}/banners`, { headers }).pipe(
      catchError(err => {
        this.handleError('Failed to load banners.', err);
        return of([]);
      })
    );
    const categories$ = this.http.get<MovieCategories>(`${this.baseUrl}/categories`, { headers }).pipe(
      catchError(err => {
        this.handleError('Failed to load movie categories.', err);
        return of({ recent: [], recommended: [], '3d': [] });
      })
    );
    
    forkJoin({
      movies: movies$,
      offers: offers$,
      banners: banners$,
      categories: categories$
    }).subscribe({
      next: (results) => {
        this.movies = results.movies;
        this.offers = results.offers;
        this.banners = results.banners;
        this.movieCategories = results.categories;
        this.loading = false;
      },
      error: () => {
        // Errors are already handled by the catchError on each stream
        this.loading = false;
      }
    });
  }

  // Banner methods
  openBannerModal(banner?: Banner): void {
    this.editingBanner = !!banner;
    this.bannerForm = banner ? { 
      ...banner,
      start_date: new Date(banner.start_date).toISOString().split('T')[0],
      end_date: new Date(banner.end_date).toISOString().split('T')[0]
    } : {
      title: '',
      target_url: '',
      image_url: '',
      position: 1,
      is_active: true,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    this.showBannerModal = true;
  }

  closeBannerModal(): void {
    this.showBannerModal = false;
    this.bannerForm = {};
  }

  saveBanner(): void {
    if (!this.bannerForm.title || !this.bannerForm.image_url) {
      this.error = 'Title and Image URL are required';
      return;
    }

    const payload = { 
      ...this.bannerForm,
      start_date: new Date(this.bannerForm.start_date as string).toISOString(),
      end_date: new Date(this.bannerForm.end_date as string).toISOString()
    };
    const headers = { 'Authorization': `Bearer ${this.token}` };

    if (this.editingBanner && this.bannerForm._id) {
      this.http.put(`${this.baseUrl}/banners/${this.bannerForm._id}`, payload, { headers }).subscribe({
        next: () => {
          this.closeBannerModal();
          this.successMessage = 'Banner updated successfully!';
          this.fetchAllData();
        },
        error: (err) => this.handleError('Failed to update banner.', err)
      });
    } else {
      this.http.post(`${this.baseUrl}/banners`, payload, { headers }).subscribe({
        next: () => {
          this.closeBannerModal();
          this.successMessage = 'Banner added successfully!';
          this.fetchAllData();
        },
        error: (err) => this.handleError('Failed to add banner.', err)
      });
    }
  }

  editBanner(banner: Banner): void {
    this.openBannerModal(banner);
  }

  deleteBanner(id: string): void {
    if (confirm('Are you sure you want to delete this banner?')) {
      const headers = { 'Authorization': `Bearer ${this.token}` };
      this.http.delete(`${this.baseUrl}/banners/${id}`, { headers }).subscribe({
        next: () => {
          this.successMessage = 'Banner deleted successfully!';
          this.fetchAllData();
        },
        error: (err) => this.handleError('Failed to delete banner.', err)
      });
    }
  }

  // Offer methods
  openOfferModal(offer?: Offer): void {
    this.editingOffer = !!offer;
    this.offerForm = offer ? { 
      ...offer,
      valid_from: new Date(offer.valid_from).toISOString().split('T')[0],
      valid_to: new Date(offer.valid_to).toISOString().split('T')[0]
    } : {
      code: '',
      title: '',
      discount_type: 'fixed',
      discount_value: 100,
      min_amount: 300,
      max_discount: null,
      is_active: true,
      valid_from: new Date().toISOString().split('T')[0],
      valid_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    this.showOfferModal = true;
  }
  
  closeOfferModal(): void {
    this.showOfferModal = false;
    this.offerForm = {};
  }

  saveOffer(): void {
    if (!this.offerForm.code || !this.offerForm.title) {
      this.error = 'Code and title are required';
      return;
    }

    const payload = { 
      ...this.offerForm,
      valid_from: new Date(this.offerForm.valid_from as string).toISOString(),
      valid_to: new Date(this.offerForm.valid_to as string).toISOString()
    };
    const headers = { 'Authorization': `Bearer ${this.token}` };

    if (this.editingOffer && this.offerForm._id) {
      this.http.put(`${this.baseUrl}/offers/${this.offerForm._id}`, payload, { headers }).subscribe({
        next: () => {
          this.closeOfferModal();
          this.successMessage = 'Offer updated successfully!';
          this.fetchAllData();
        },
        error: (err) => this.handleError('Failed to update offer.', err)
      });
    } else {
      this.http.post(`${this.baseUrl}/offers`, payload, { headers }).subscribe({
        next: () => {
          this.closeOfferModal();
          this.successMessage = 'Offer added successfully!';
          this.fetchAllData();
        },
        error: (err) => this.handleError('Failed to add offer.', err)
      });
    }
  }

  editOffer(offer: Offer): void {
    this.openOfferModal(offer);
  }

  deleteOffer(id: string): void {
    if (confirm('Are you sure you want to delete this offer?')) {
      const headers = { 'Authorization': `Bearer ${this.token}` };
      this.http.delete(`${this.baseUrl}/offers/${id}`, { headers }).subscribe({
        next: () => {
          this.successMessage = 'Offer deleted successfully!';
          this.fetchAllData();
        },
        error: (err) => this.handleError('Failed to delete offer.', err)
      });
    }
  }

  // Movie Category Management
  openCategoryMovieModal(category: keyof MovieCategories): void {
    this.currentCategory = category;
    this.selectedMoviesForCategory = [...(this.movieCategories[category]??[])];
    this.showCategoryMovieModal = true;
  }

  closeCategoryMovieModal(): void {
    this.showCategoryMovieModal = false;
    this.currentCategory = null;
    this.selectedMoviesForCategory = [];
  }

  toggleMovieForCategory(movieId: string): void {
    if (this.selectedMoviesForCategory.includes(movieId)) {
      this.selectedMoviesForCategory = this.selectedMoviesForCategory.filter(id => id !== movieId);
    } else {
      this.selectedMoviesForCategory.push(movieId);
    }
  }

  saveMoviesToCategory(): void {
    if (this.currentCategory) {
      const headers = { 'Authorization': `Bearer ${this.token}` };
      const categoryName = this.currentCategory;
      const movieIds = this.selectedMoviesForCategory;

      this.http.post(`${this.baseUrl}/categories/${categoryName}`, { movieIds }, { headers }).subscribe({
        next: () => {
          this.closeCategoryMovieModal();
          this.successMessage = `Category '${categoryName}' updated successfully!`;
          this.fetchAllData();
        },
        error: (err) => this.handleError('Failed to update movie category.', err)
      });
    }
  }

  removeMovieFromCategory(movieId: string, category: keyof MovieCategories): void {
    const headers = { 'Authorization': `Bearer ${this.token}` };
    if (confirm(`Are you sure you want to remove this movie from the '${category}' category?`)) {
      this.http.delete(`${this.baseUrl}/categories/${category}/movies/${movieId}`, { headers }).subscribe({
        next: () => {
          this.successMessage = 'Movie removed from category successfully!';
          this.fetchAllData();
        },
        error: (err) => this.handleError('Failed to remove movie from category.', err)
      });
    }
  }

  getMovieById(id: string): Movie | undefined {
    return this.movies.find(movie => movie._id === id);
  }
  
  get currentCategoryDisplay(): string {
    return this.currentCategory ? this.categoryDisplayNames[this.currentCategory] : '';
  }

  // Helper methods
  handleError(message: string, err?: any): void {
    console.error(message, err);
    this.error = message;
    this.loading = false;
    setTimeout(() => this.error = null, 5000);
  }
}