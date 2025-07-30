

// // frontend/src/app/admin/shows-management/shows-management.component.ts
// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
// import { CommonModule, DatePipe } from '@angular/common';
// import { RouterLink } from '@angular/router';
// import { SideNavbarComponent } from '../components/side-navbar/side-navbar.component';
// import { lastValueFrom } from 'rxjs';

// import { Movie, MovieService } from '../../services/movie.service';
// import { Screen, Theatre, TheatreService } from '../../services/theatre.service';
// import { Show, ShowPayload, ShowService } from '../../services/show.service';
// import { AuthService } from '../../services/auth.service';

// @Component({
//   selector: 'app-shows-management',
//   templateUrl: './shows-management.component.html',
//   styleUrls: ['./shows-management.component.css'],
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule, FormsModule, SideNavbarComponent, RouterLink],
//   providers: [DatePipe]
// })
// export class ShowsManagementComponent implements OnInit {
//   // Data Properties
//   theater: Theatre | null = null;
//   movies: Movie[] = [];
//   allShows: Show[] = [];
//   screens: Screen[] = [];

//   // UI State
//   loading = true;
//   error: string | null = null;
//   selectedDate: string;

//   // New properties for date picker restriction
//   todayDate: string;
//   tomorrowDate: string;

//   showFormVisible = false;
//   isEditing = false;
//   currentShow: Show | null = null;

//   showTheaterForm = false;
//   showDeleteConfirmation = false;
//   showToDeleteId: number | null = null;

//   // Forms
//   showForm: FormGroup;
//   theaterForm: FormGroup;

//   // Standard showtimes for display
//   dailyTimeSlots = ['11:00', '14:00', '18:00', '21:00']; // 11:00 AM, 2:00 PM, 6:00 PM, 9:00 PM

//   constructor(
//     private fb: FormBuilder,
//     private movieService: MovieService,
//     private theatreService: TheatreService,
//     private showService: ShowService,
//     private authService: AuthService,
//     private datePipe: DatePipe
//   ) {
//     // Calculate today's date
//     const today = new Date();
//     this.todayDate = this.datePipe.transform(today, 'yyyy-MM-dd')!;

//     // Calculate tomorrow's date
//     const tomorrow = new Date(today);
//     tomorrow.setDate(today.getDate() + 1);
//     this.tomorrowDate = this.datePipe.transform(tomorrow, 'yyyy-MM-dd')!;
    
//     // Set selected date to today by default
//     this.selectedDate = this.todayDate;

//     this.showForm = this.fb.group({
//       _id: [''],
//       movie_id: ['', Validators.required],
//       screen_id: ['', Validators.required],
//       show_datetime: ['', Validators.required],
//       normal_price: [150, [Validators.required, Validators.min(0)]],
//       premium_price: [250, [Validators.required, Validators.min(0)]],
//       is_active: [true]
//     });

//     this.theaterForm = this.fb.group({
//       name: ['', Validators.required],
//       location: ['', Validators.required],
//       contact: ['', Validators.required],
//       is_active: [true]
//     });
//   }

//   async ngOnInit(): Promise<void> {
//     if (!this.authService.isAdmin()) {
//       this.error = 'Access Denied: You must be an administrator to view this page.';
//       this.loading = false;
//       return;
//     }
//     await this.fetchData();
//   }

//   async fetchData(): Promise<void> {
//     this.loading = true;
//     this.error = null;
//     try {
//       const theatres = await lastValueFrom(this.theatreService.getAllTheatres());
//       if (theatres && theatres.length > 0) {
//         this.theater = theatres[0];
//         this.screens = (await lastValueFrom(this.theatreService.getScreensByTheatre(this.theater._id))) ?? [];
//       } else {
//         this.error = 'No theatre found. Please add theatre details first.';
//         this.loading = false;
//         return;
//       }
//       this.movies = (await lastValueFrom(this.movieService.getAllMovies())) ?? [];
//       this.allShows = (await lastValueFrom(this.showService.getAllShows())) ?? [];
//       this.loading = false;
//     } catch (err: any) {
//       this.error = 'Failed to load data. Please try again later.';
//       this.loading = false;
//       console.error('Error fetching initial data:', err);
//       this.handleApiError(err, 'fetch initial data');
//     }
//   }

//   getShowsForScreenAndDate(screenId: string, date: string): Show[] {
//     return this.allShows.filter(show => {
//       const showDate = this.datePipe.transform(show.show_datetime, 'yyyy-MM-dd');
//       return show.screen_id === screenId && showDate === date;
//     });
//   }

//   getShowInSlot(screenId: string, date: string, timeSlot: string): Show | undefined {
//     const showsOnDate = this.getShowsForScreenAndDate(screenId, date);
//     return showsOnDate.find(show => {
//       const showTime = this.datePipe.transform(show.show_datetime, 'HH:mm');
//       return showTime === timeSlot;
//     });
//   }

//   isPastShowtime(date: string, timeSlot: string): boolean {
//     const now = new Date();
//     const showDateTime = new Date(`${date}T${timeSlot}:00`);
//     return showDateTime < now;
//   }

//   openAddShowForm(screen: Screen, timeSlot: string): void {
//     this.isEditing = false;
//     this.currentShow = null;
//     const showDateTime = new Date(`${this.selectedDate}T${timeSlot}:00`).toISOString();
//     this.showForm.reset();
//     this.showForm.patchValue({
//       screen_id: screen._id,
//       show_datetime: showDateTime,
//       normal_price: 150,
//       premium_price: 250,
//       is_active: true
//     });
//     this.showFormVisible = true;
//   }

//   openEditShowForm(show: Show): void {
//     this.isEditing = true;
//     this.currentShow = show;
//     this.showForm.reset();
//     this.showForm.patchValue({
//       _id: show._id,
//       movie_id: show.movie_id,
//       screen_id: show.screen_id,
//       show_datetime: show.show_datetime,
//       normal_price: show.normal_price,
//       premium_price: show.premium_price,
//       is_active: show.is_active
//     });
//     this.showFormVisible = true;
//   }

//   closeShowForm(): void {
//     this.showFormVisible = false;
//     this.showForm.reset();
//     this.currentShow = null;
//   }

//   async onSubmitShowForm(): Promise<void> {
//     if (this.showForm.invalid) {
//       this.showForm.markAllAsTouched();
//       return;
//     }

//     this.loading = true;
//     this.error = null;

//     const formData = this.showForm.value;
//     const showPayload: ShowPayload = {
//       movie_id: formData.movie_id,
//       screen_id: formData.screen_id,
//       show_datetime: formData.show_datetime,
//       normal_price: formData.normal_price,
//       premium_price: formData.premium_price,
//       is_active: formData.is_active
//     };

//     if (this.isEditing && this.currentShow) {
//       try {
//         const updatedShow = await lastValueFrom(this.showService.updateShow(this.currentShow._id, showPayload));
//         this.allShows = this.allShows.map(s => s._id === updatedShow._id ? updatedShow : s);
//         console.log('Show updated:', updatedShow);
//         this.closeShowForm();
//         this.loading = false;
//       } catch (err) {
//         this.handleApiError(err, 'update show');
//       }
//     } else {
//       const newShowId = this.allShows.length ? Math.max(...this.allShows.map(s => s._id)) + 1 : 1;
//       const payloadWithId = { ...showPayload, _id: newShowId };

//       try {
//         const addedShow = await lastValueFrom(this.showService.createShow(payloadWithId));
//         this.allShows.push(addedShow);
//         console.log('Show added:', addedShow);
//         this.closeShowForm();
//         this.loading = false;
//       } catch (err) {
//         this.handleApiError(err, 'add show');
//       }
//     }
//   }

//   confirmDeleteShow(showId: number): void {
//     this.showToDeleteId = showId;
//     this.showDeleteConfirmation = true;
//   }

//   async deleteShow(): Promise<void> {
//     if (!this.showToDeleteId) {
//       this.showDeleteConfirmation = false;
//       return;
//     }
//     this.loading = true;
//     this.error = null;
//     try {
//       await lastValueFrom(this.showService.deleteShow(this.showToDeleteId));
//       this.allShows = this.allShows.filter(s => s._id !== this.showToDeleteId);
//       console.log(`Show ${this.showToDeleteId} deleted.`);
//       this.showDeleteConfirmation = false;
//       this.showToDeleteId = null;
//       this.loading = false;
//     } catch (err) {
//       this.handleApiError(err, 'delete show');
//     }
//   }

//   openEditTheaterForm(): void {
//     if (!this.theater) return;
//     this.theaterForm.patchValue({
//       name: this.theater.name,
//       location: this.theater.location,
//       contact: this.theater.contact,
//       is_active: this.theater.is_active
//     });
//     this.showTheaterForm = true;
//   }

//   closeTheaterForm(): void {
//     this.showTheaterForm = false;
//   }

//   async saveTheater(): Promise<void> {
//     if (this.theaterForm.invalid || !this.theater) {
//       this.theaterForm.markAllAsTouched();
//       return;
//     }
//     this.loading = true;
//     this.error = null;
//     try {
//       const updatedTheater = await lastValueFrom(this.theatreService.updateTheatre(this.theater._id, this.theaterForm.value));
//       this.theater = updatedTheater;
//       console.log('Theater updated:', updatedTheater);
//       this.closeTheaterForm();
//       this.loading = false;
//     } catch (err) {
//       this.handleApiError(err, 'update theater');
//     }
//   }

//   getMovieTitle(movieId: string): string {
//     const movie = this.movies.find(m => m._id === movieId);
//     return movie ? movie.title : 'Unknown Movie';
//   }

//   getScreenName(screenId: string): string {
//     const screen = this.screens.find(s => s._id === screenId);
//     return screen ? screen.name : 'Unknown Screen';
//   }

//   private handleApiError(error: any, action: string): void {
//     console.error(`Error ${action}:`, error);
//     if (error.status === 400) {
//       this.error = error.error?.msg || 'Invalid data. Please check inputs.';
//     } else if (error.status === 401 || error.status === 403) {
//       this.error = 'Authentication/Authorization failed. Please login as admin.';
//     } else if (error.status === 404) {
//       this.error = 'Resource not found. It might have been deleted.';
//     } else {
//       this.error = `Failed to ${action}. Please try again.`;
//     }
//     this.loading = false;
//     this.showDeleteConfirmation = false;
//     this.showFormVisible = false;
//     this.showTheaterForm = false;
//   }
// }


// // frontend/src/app/admin/shows-management/shows-management.component.ts
// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
// import { CommonModule, DatePipe } from '@angular/common';
// import { RouterLink } from '@angular/router';
// import { SideNavbarComponent } from '../components/side-navbar/side-navbar.component';
// import { lastValueFrom } from 'rxjs';

// import { Movie, MovieService } from '../../services/movie.service';
// import { Screen, Theatre, TheatreService } from '../../services/theatre.service';
// import { Show, ShowPayload, ShowService } from '../../services/show.service';
// import { AuthService } from '../../services/auth.service';

// @Component({
//   selector: 'app-shows-management',
//   templateUrl: './shows-management.component.html',
//   styleUrls: ['./shows-management.component.css'],
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule, FormsModule, SideNavbarComponent, RouterLink],
//   providers: [DatePipe]
// })
// export class ShowsManagementComponent implements OnInit {
//   // Data Properties
//   theater: Theatre | null = null;
//   movies: Movie[] = [];
//   allShows: Show[] = [];
//   screens: Screen[] = [];

//   // UI State
//   loading = true;
//   error: string | null = null;
//   selectedDate: string;
//   selectedScreenId: string | null = null; // New property for screen filter

//   todayDate: string;
//   tomorrowDate: string;

//   showFormVisible = false;
//   isEditing = false;
//   currentShow: Show | null = null;

//   showTheaterForm = false;
//   showDeleteConfirmation = false;
//   showToDeleteId: number | null = null;

//   // Forms
//   showForm: FormGroup;
//   theaterForm: FormGroup;

//   // Standard showtimes for display
//   dailyTimeSlots = ['11:00', '14:00', '18:00', '21:00'];

//   constructor(
//     private fb: FormBuilder,
//     private movieService: MovieService,
//     private theatreService: TheatreService,
//     private showService: ShowService,
//     private authService: AuthService,
//     private datePipe: DatePipe
//   ) {
//     // const today = new Date();
//     // this.selectedDate = this.datePipe.transform(today, 'yyyy-MM-dd')!;
//     const today = new Date();
//     this.todayDate = this.datePipe.transform(today, 'yyyy-MM-dd')!;

//     // Calculate tomorrow's date
//     const tomorrow = new Date(today);
//     tomorrow.setDate(today.getDate() + 1);
//     this.tomorrowDate = this.datePipe.transform(tomorrow, 'yyyy-MM-dd')!;
    
//     // Set selected date to today by default
//     this.selectedDate = this.todayDate;

//     this.showForm = this.fb.group({
//       _id: [''],
//       movie_id: ['', Validators.required],
//       screen_id: ['', Validators.required],
//       show_datetime: ['', Validators.required],
//       normal_price: [150, [Validators.required, Validators.min(0)]],
//       premium_price: [250, [Validators.required, Validators.min(0)]],
//       is_active: [true]
//     });

//     this.theaterForm = this.fb.group({
//       name: ['', Validators.required],
//       location: ['', Validators.required],
//       contact: ['', Validators.required],
//       is_active: [true]
//     });
//   }

//   async ngOnInit(): Promise<void> {
//     if (!this.authService.isAdmin()) {
//       this.error = 'Access Denied: You must be an administrator to view this page.';
//       this.loading = false;
//       return;
//     }
//     await this.fetchData();
//   }

//   async fetchData(): Promise<void> {
//     this.loading = true;
//     this.error = null;
//     try {
//       const theatres = await lastValueFrom(this.theatreService.getAllTheatres());
//       if (theatres && theatres.length > 0) {
//         this.theater = theatres[0];
//         this.screens = (await lastValueFrom(this.theatreService.getScreensByTheatre(this.theater._id))) ?? [];
//         if (!this.selectedScreenId && this.screens.length > 0) {
//             this.selectedScreenId = this.screens[0]._id;
//         }
//       } else {
//         this.error = 'No theatre found. Please add theatre details first.';
//         this.loading = false;
//         return;
//       }
//       this.movies = (await lastValueFrom(this.movieService.getAllMovies())) ?? [];
//       this.allShows = (await lastValueFrom(this.showService.getAllShows())) ?? [];
//       this.loading = false;
//     } catch (err: any) {
//       this.error = 'Failed to load data. Please try again later.';
//       this.loading = false;
//       console.error('Error fetching initial data:', err);
//       this.handleApiError(err, 'fetch initial data');
//     }
//   }

//   // New helper function to filter screens for display
//   getFilteredScreens(): Screen[] {
//     if (this.selectedScreenId) {
//       return this.screens.filter(screen => screen._id === this.selectedScreenId);
//     }
//     return this.screens;
//   }

//   getShowsForScreenAndDate(screenId: string, date: string): Show[] {
//     return this.allShows.filter(show => {
//       const showDate = this.datePipe.transform(show.show_datetime, 'yyyy-MM-dd');
//       return show.screen_id === screenId && showDate === date;
//     });
//   }

//   getShowInSlot(screenId: string, date: string, timeSlot: string): Show | undefined {
//     const showsOnDate = this.getShowsForScreenAndDate(screenId, date);
//     return showsOnDate.find(show => {
//       const showTime = this.datePipe.transform(show.show_datetime, 'HH:mm');
//       return showTime === timeSlot;
//     });
//   }

//   isPastShowtime(date: string, timeSlot: string): boolean {
//     const now = new Date();
//     const showDateTime = new Date(`${date}T${timeSlot}:00`);
//     return showDateTime < now;
//   }

//   openAddShowForm(screen: Screen, timeSlot: string): void {
//     if (this.isPastShowtime(this.selectedDate, timeSlot)) return;

//     this.isEditing = false;
//     this.currentShow = null;
//     const showDateTime = new Date(`${this.selectedDate}T${timeSlot}:00`).toISOString();
//     this.showForm.reset();
//     this.showForm.patchValue({
//       screen_id: screen._id,
//       show_datetime: showDateTime,
//       normal_price: 150,
//       premium_price: 250,
//       is_active: true
//     });
//     this.showFormVisible = true;
//   }

//   openEditShowForm(show: Show): void {
//     this.isEditing = true;
//     this.currentShow = show;
//     this.showForm.reset();
//     this.showForm.patchValue({
//       _id: show._id,
//       movie_id: show.movie_id,
//       screen_id: show.screen_id,
//       show_datetime: show.show_datetime,
//       normal_price: show.normal_price,
//       premium_price: show.premium_price,
//       is_active: show.is_active
//     });
//     this.showFormVisible = true;
//   }

//   closeShowForm(): void {
//     this.showFormVisible = false;
//     this.showForm.reset();
//     this.currentShow = null;
//   }

//   async onSubmitShowForm(): Promise<void> {
//     if (this.showForm.invalid) {
//       this.showForm.markAllAsTouched();
//       return;
//     }

//     this.loading = true;
//     this.error = null;

//     const formData = this.showForm.value;
//     const showPayload: ShowPayload = {
//       _id: formData._id,
//       movie_id: formData.movie_id,
//       screen_id: formData.screen_id,
//       show_datetime: formData.show_datetime,
//       normal_price: formData.normal_price,
//       premium_price: formData.premium_price,
//       is_active: formData.is_active
//     };

//     if (this.isEditing && this.currentShow) {
//       try {
//         const updatedShow = await lastValueFrom(this.showService.updateShow(this.currentShow._id, showPayload));
//         this.allShows = this.allShows.map(s => s._id === updatedShow._id ? updatedShow : s);
//         console.log('Show updated:', updatedShow);
//         this.closeShowForm();
//         this.loading = false;
//       } catch (err) {
//         this.handleApiError(err, 'update show');
//       }
//     } else {
//       const newShowId = this.allShows.length ? Math.max(...this.allShows.map(s => s._id)) + 1 : 1;
//       const payloadWithId = { ...showPayload, _id: newShowId };

//       try {
//         const addedShow = await lastValueFrom(this.showService.createShow(payloadWithId));
//         this.allShows.push(addedShow);
//         console.log('Show added:', addedShow);
//         this.closeShowForm();
//         this.loading = false;
//       } catch (err) {
//         this.handleApiError(err, 'add show');
//       }
//     }
//   }

//   confirmDeleteShow(showId: number): void {
//     this.showToDeleteId = showId;
//     this.showDeleteConfirmation = true;
//   }

//   async deleteShow(): Promise<void> {
//     if (!this.showToDeleteId) {
//       this.showDeleteConfirmation = false;
//       return;
//     }
//     this.loading = true;
//     this.error = null;
//     try {
//       await lastValueFrom(this.showService.deleteShow(this.showToDeleteId));
//       this.allShows = this.allShows.filter(s => s._id !== this.showToDeleteId);
//       console.log(`Show ${this.showToDeleteId} deleted.`);
//       this.showDeleteConfirmation = false;
//       this.showToDeleteId = null;
//       this.loading = false;
//     } catch (err) {
//       this.handleApiError(err, 'delete show');
//     }
//   }

//   openEditTheaterForm(): void {
//     if (!this.theater) return;
//     this.theaterForm.patchValue({
//       name: this.theater.name,
//       location: this.theater.location,
//       contact: this.theater.contact,
//       is_active: this.theater.is_active
//     });
//     this.showTheaterForm = true;
//   }

//   closeTheaterForm(): void {
//     this.showTheaterForm = false;
//   }

//   async saveTheater(): Promise<void> {
//     if (this.theaterForm.invalid || !this.theater) {
//       this.theaterForm.markAllAsTouched();
//       return;
//     }
//     this.loading = true;
//     this.error = null;
//     try {
//       const updatedTheater = await lastValueFrom(this.theatreService.updateTheatre(this.theater._id, this.theaterForm.value));
//       this.theater = updatedTheater;
//       console.log('Theater updated:', updatedTheater);
//       this.closeTheaterForm();
//       this.loading = false;
//     } catch (err) {
//       this.handleApiError(err, 'update theater');
//     }
//   }

//   getMovieTitle(movieId: string): string {
//     const movie = this.movies.find(m => m._id === movieId);
//     return movie ? movie.title : 'Unknown Movie';
//   }

//   getScreenName(screenId: string): string {
//     const screen = this.screens.find(s => s._id === screenId);
//     return screen ? screen.name : 'Unknown Screen';
//   }

//   private handleApiError(error: any, action: string): void {
//     console.error(`Error ${action}:`, error);
//     if (error.status === 400) {
//       this.error = error.error?.msg || 'Invalid data. Please check inputs.';
//     } else if (error.status === 401 || error.status === 403) {
//       this.error = 'Authentication/Authorization failed. Please login as admin.';
//     } else if (error.status === 404) {
//       this.error = 'Resource not found. It might have been deleted.';
//     } else {
//       this.error = `Failed to ${action}. Please try again.`;
//     }
//     this.loading = false;
//     this.showDeleteConfirmation = false;
//     this.showFormVisible = false;
//     this.showTheaterForm = false;
//   }
// }


// frontend/src/app/admin/shows-management/shows-management.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SideNavbarComponent } from '../components/side-navbar/side-navbar.component';
import { lastValueFrom } from 'rxjs';

import { Movie, MovieService } from '../../services/movie.service';
import { Screen, Theatre, TheatreService } from '../../services/theatre.service';
import { Show, ShowPayload, ShowService } from '../../services/show.service';
import { AuthService } from '../../services/auth.service';  
import { AdminHeaderComponent } from '../components/admin-header/admin-header.component';

@Component({
  selector: 'app-shows-management',
  templateUrl: './shows-management.component.html', 
  styleUrls: ['./shows-management.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule  , SideNavbarComponent, RouterLink,AdminHeaderComponent],
  providers: [DatePipe]
})
export class ShowsManagementComponent implements OnInit {
  // Data Properties
  theater: Theatre | null = null;
  movies: Movie[] = [];
  allShows: Show[] = [];
  screens: Screen[] = [];

  // UI State
  loading = true;
  error: string | null = null;
  selectedDate: string;
  selectedScreenId: string | null = null; // New property for screen filter

  todayDate: string;
  tomorrowDate: string;

  showFormVisible = false;
  isEditing = false;
  currentShow: Show | null = null;

  showTheaterForm = false;
  showDeleteConfirmation = false;
  showToDeleteId: number | null = null;

  // Forms
  showForm: FormGroup;
  theaterForm: FormGroup;

  // Standard showtimes for display
  dailyTimeSlots = ['11:00', '14:00', '18:00', '21:00'];

  constructor(
    private fb: FormBuilder,
    private movieService: MovieService,
    private theatreService: TheatreService,
    private showService: ShowService,
    private authService: AuthService,
    private datePipe: DatePipe
  ) {
    const today = new Date();
    this.todayDate = this.datePipe.transform(today, 'yyyy-MM-dd')!;

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    this.tomorrowDate = this.datePipe.transform(tomorrow, 'yyyy-MM-dd')!;
    
    this.selectedDate = this.todayDate;

    this.showForm = this.fb.group({
      _id: [''],
      movie_id: ['', Validators.required],
      screen_id: ['', Validators.required],
      show_datetime: ['', Validators.required],
      normal_price: [150, [Validators.required, Validators.min(0)]],
      premium_price: [250, [Validators.required, Validators.min(0)]],
      is_active: [true]
    });

    this.theaterForm = this.fb.group({
      name: ['', Validators.required],
      location: ['', Validators.required],
      contact: ['', Validators.required],
      is_active: [true]
    });
  }

  async ngOnInit(): Promise<void> {
    if (!this.authService.isAdmin()) {
      this.error = 'Access Denied: You must be an administrator to view this page.';
      this.loading = false;
      return;
    }
    await this.fetchData();
  }

  async fetchData(): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      const theatres = await lastValueFrom(this.theatreService.getAllTheatres());
      if (theatres && theatres.length > 0) {
        this.theater = theatres[0];
        this.screens = (await lastValueFrom(this.theatreService.getScreensByTheatre(this.theater._id))) ?? [];
        if (!this.selectedScreenId && this.screens.length > 0) {
            this.selectedScreenId = this.screens[0]._id;
        }
      } else {
        this.error = 'No theatre found. Please add theatre details first.';
        this.loading = false;
        return;
      }
      this.movies = (await lastValueFrom(this.movieService.getAllMovies())) ?? [];
      this.allShows = (await lastValueFrom(this.showService.getAllShows())) ?? [];
      this.loading = false;
    } catch (err: any) {
      this.error = 'Failed to load data. Please try again later.';
      this.loading = false;
      console.error('Error fetching initial data:', err);
      this.handleApiError(err, 'fetch initial data');
    }
  }

  getFilteredScreens(): Screen[] {
    if (this.selectedScreenId) {
      return this.screens.filter(screen => screen._id === this.selectedScreenId);
    }
    return this.screens;
  }

  getShowsForScreenAndDate(screenId: string, date: string): Show[] {
    return this.allShows.filter(show => {
      const showDate = this.datePipe.transform(show.show_datetime, 'yyyy-MM-dd');
      return show.screen_id === screenId && showDate === date;
    });
  }

  getShowInSlot(screenId: string, date: string, timeSlot: string): Show | undefined {
    const showsOnDate = this.getShowsForScreenAndDate(screenId, date);
    return showsOnDate.find(show => {
      const showTime = this.datePipe.transform(show.show_datetime, 'HH:mm');
      return showTime === timeSlot;
    });
  }

  isPastShowtime(date: string, timeSlot: string): boolean {
    const now = new Date();
    const showDateTime = new Date(`${date}T${timeSlot}:00`);
    return showDateTime < now;
  }

  openAddShowForm(screen: Screen, timeSlot: string): void {
    if (this.isPastShowtime(this.selectedDate, timeSlot)) return;

    this.isEditing = false;
    this.currentShow = null;
    const showDateTime = new Date(`${this.selectedDate}T${timeSlot}:00`).toISOString();
    this.showForm.reset();
    this.showForm.patchValue({
      screen_id: screen._id,
      show_datetime: showDateTime,
      normal_price: 150,
      premium_price: 250,
      is_active: true
    });
    this.showFormVisible = true;
  }

  openEditShowForm(show: Show): void {
    this.isEditing = true;
    this.currentShow = show;
    this.showForm.reset();
    this.showForm.patchValue({
      _id: show._id,
      movie_id: show.movie_id,
      screen_id: show.screen_id,
      show_datetime: show.show_datetime,
      normal_price: show.normal_price,
      premium_price: show.premium_price,
      is_active: show.is_active
    });
    this.showFormVisible = true;
  }

  closeShowForm(): void {
    this.showFormVisible = false;
    this.showForm.reset();
    this.currentShow = null;
  }

  async onSubmitShowForm(): Promise<void> {
    if (this.showForm.invalid) {
      this.showForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    const formData = this.showForm.value;
    const showPayload: ShowPayload = {
      _id: formData._id,
      movie_id: formData.movie_id,
      screen_id: formData.screen_id,
      show_datetime: formData.show_datetime,
      normal_price: formData.normal_price,
      premium_price: formData.premium_price,
      is_active: formData.is_active
    };

    if (this.isEditing && this.currentShow) {
      try {
        const updatedShow = await lastValueFrom(this.showService.updateShow(this.currentShow._id, showPayload));
        this.allShows = this.allShows.map(s => s._id === updatedShow._id ? updatedShow : s);
        console.log('Show updated:', updatedShow);
        this.closeShowForm();
        this.loading = false;
      } catch (err) {
        this.handleApiError(err, 'update show');
      }
    } else {
      const newShowId = this.allShows.length ? Math.max(...this.allShows.map(s => s._id)) + 1 : 1;
      const payloadWithId = { ...showPayload, _id: newShowId };

      try {
        const addedShow = await lastValueFrom(this.showService.createShow(payloadWithId));
        this.allShows.push(addedShow);
        console.log('Show added:', addedShow);
        this.closeShowForm();
        this.loading = false;
      } catch (err) {
        this.handleApiError(err, 'add show');
      }
    }
  }

  confirmDeleteShow(showId: number): void {
    this.showToDeleteId = showId;
    this.showDeleteConfirmation = true;
  }

  async deleteShow(): Promise<void> {
    if (!this.showToDeleteId) {
      this.showDeleteConfirmation = false;
      return;
    }
    this.loading = true;
    this.error = null;
    try {
      await lastValueFrom(this.showService.deleteShow(this.showToDeleteId));
      this.allShows = this.allShows.filter(s => s._id !== this.showToDeleteId);
      console.log(`Show ${this.showToDeleteId} deleted.`);
      this.showDeleteConfirmation = false;
      this.showToDeleteId = null;
      this.loading = false;
    } catch (err) {
      this.handleApiError(err, 'delete show');
    }
  }

  openEditTheaterForm(): void {
    if (!this.theater) return;
    this.theaterForm.patchValue({
      name: this.theater.name,
      location: this.theater.location,
      contact: this.theater.contact,
      is_active: this.theater.is_active
    });
    this.showTheaterForm = true;
  }

  closeTheaterForm(): void {
    this.showTheaterForm = false;
  }

  async saveTheater(): Promise<void> {
    if (this.theaterForm.invalid || !this.theater) {
      this.theaterForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = null;
    try {
      const updatedTheater = await lastValueFrom(this.theatreService.updateTheatre(this.theater._id, this.theaterForm.value));
      this.theater = updatedTheater;
      console.log('Theater updated:', updatedTheater);
      this.closeTheaterForm();
      this.loading = false;
    } catch (err) {
      this.handleApiError(err, 'update theater');
    }
  }

  getMovieTitle(movieId: string): string {
    const movie = this.movies.find(m => m._id === movieId);
    return movie ? movie.title : 'Unknown Movie';
  }

  getScreenName(screenId: string): string {
    const screen = this.screens.find(s => s._id === screenId);
    return screen ? screen.name : 'Unknown Screen';
  }

  private handleApiError(error: any, action: string): void {
    console.error(`Error ${action}:`, error);
    if (error.status === 400) {
      this.error = error.error?.msg || 'Invalid data. Please check inputs.';
    } else if (error.status === 401 || error.status === 403) {
      this.error = 'Authentication/Authorization failed. Please login as admin.';
    } else if (error.status === 404) {
      this.error = 'Resource not found. It might have been deleted.';
    } else {
      this.error = `Failed to ${action}. Please try again.`;
    }
    this.loading = false;
    this.showDeleteConfirmation = false;
    this.showFormVisible = false;
    this.showTheaterForm = false;
  }
}