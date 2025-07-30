// frontend/src/app/admin/seat-management/seat-management.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SideNavbarComponent } from '../components/side-navbar/side-navbar.component';
import { lastValueFrom } from 'rxjs';

import { Movie, MovieService } from '../../services/movie.service';
import { Screen, TheatreService } from '../../services/theatre.service';
import { Show, ShowService } from '../../services/show.service';
import { SeatInShowSeat, ShowSeat, SeatService } from '../../services/seat.service';
import { AuthService } from '../../services/auth.service';
import { AdminHeaderComponent } from '../components/admin-header/admin-header.component';

interface SeatOperation {
  id: string;
  seat_id: string;
  admin_id: string;
  action: string;
  reason: string;
  created_at: string; 
}

interface Theatre {
  _id: string;
  name: string;
  location: string;
  contact: string;
  is_active: boolean;
  created_at: string;
  screens?: Screen[];
}

@Component({
  standalone: true,
  selector: 'app-seat-management',
  templateUrl: './seat-management.component.html',
  styleUrls: ['./seat-management.component.css'],
  imports: [CommonModule, FormsModule, SideNavbarComponent,AdminHeaderComponent],
  providers: [DatePipe]
})
export class SeatManagementComponent implements OnInit {
  loading: boolean = true;
  error: string | null = null;
  
  theatre: Theatre | null = null;
  screens: Screen[] = [];
  movies: Movie[] = [];
  allShows: Show[] = [];
  seatOperations: SeatOperation[] = [];

  selectedDate: string;
  todayDate: string;
  tomorrowDate: string;

  selectedScreenId: string = '';
  selectedShowId: number | null = null;
  selectedSeats: string[] = [];
  operationReason: string = '';
  
  filteredShows: Show[] = [];
  showSeatData: ShowSeat | null = null;
  seatRows: string[] = []; // <-- NEW PROPERTY TO HOLD SEAT ROWS

  constructor(
    private http: HttpClient,
    private movieService: MovieService,
    private theatreService: TheatreService,
    private showService: ShowService,
    private seatService: SeatService,
    private datePipe: DatePipe,
    private authService: AuthService
  ) {
    const today = new Date();
    this.todayDate = this.datePipe.transform(today, 'yyyy-MM-dd')!;
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    this.tomorrowDate = this.datePipe.transform(tomorrow, 'yyyy-MM-dd')!;
    
    this.selectedDate = this.todayDate;
  }

  async ngOnInit(): Promise<void> {
    if (!this.authService.isAdmin()) {
      this.error = 'Access Denied: You must be an administrator to view this page.';
      this.loading = false;
      return;
    }
    await this.loadInitialData();
  }

  async loadInitialData(): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      const theatres = await lastValueFrom(this.theatreService.getAllTheatres());
      if (theatres && theatres.length > 0) {
        this.theatre = theatres[0];
        this.screens = await lastValueFrom(this.theatreService.getScreensByTheatre(this.theatre._id)) || [];
        this.selectedScreenId = this.screens.length > 0 ? this.screens[0]._id : '';
      } else {
        this.error = 'No theatre found.';
        this.loading = false;
        return;
      }
      this.movies = await lastValueFrom(this.movieService.getAllMovies()) || [];
      this.allShows = await lastValueFrom(this.showService.getAllShows()) || [];
      
      this.filterShowsAndLoadSeats();
      this.loading = false;
    } catch (err: any) {
      this.error = 'Failed to load initial data.';
      this.loading = false;
      console.error('Error fetching initial data:', err);
    }
  }

  onDateChange(): void {
    this.filterShowsAndLoadSeats();
  }

  onScreenChange(): void {
    this.filterShowsAndLoadSeats();
  }

  filterShowsAndLoadSeats(): void {
    this.filteredShows = this.allShows
      .filter(show => 
        show.screen_id === this.selectedScreenId && 
        this.datePipe.transform(show.show_datetime, 'yyyy-MM-dd') === this.selectedDate
      )
      .sort((a, b) => new Date(a.show_datetime).getTime() - new Date(b.show_datetime).getTime());
    
    this.selectedShowId = this.filteredShows.length > 0 ? this.filteredShows[0]._id : null;
    if (this.selectedShowId) {
      this.loadSeatsForShow(this.selectedShowId);
    } else {
      this.showSeatData = null;
      this.selectedSeats = [];
      this.seatRows = []; // Clear rows as well
    }
  }

  async loadSeatsForShow(showId: number): Promise<void> {
    this.loading = true;
    this.error = null;
    this.selectedSeats = [];
    this.operationReason = '';
    try {
      this.showSeatData = await lastValueFrom(this.seatService.getShowSeatsStatus(showId));
      this.generateSeatRows(); // <-- NEW: GENERATE THE ROWS AFTER DATA IS LOADED
      this.loading = false;
    } catch (err: any) {
      this.error = 'Failed to load seats for this show.';
      this.loading = false;
      this.showSeatData = null;
      this.seatRows = []; // Clear rows on error
      console.error('Error loading seats:', err);
    }
  }

  // <-- NEW METHOD TO GENERATE SEAT ROWS
  generateSeatRows(): void {
    if (!this.showSeatData?.seats) {
      this.seatRows = [];
      return;
    }

    const uniqueRows = new Set<string>();
    this.showSeatData.seats.forEach(seat => {
      const rowLetter = seat.seat_number.charAt(0);
      uniqueRows.add(rowLetter);
    });

    this.seatRows = Array.from(uniqueRows).sort();
  }

  getMovieTitle(show: Show): string {
    return this.movies.find(m => m._id === show.movie_id)?.title || 'Unknown';
  }

  getSeatsForRow(row: string): SeatInShowSeat[] {
    if (!this.showSeatData?.seats) return [];
    
    // First, filter out any null, undefined, or malformed seat objects
    const validSeats = this.showSeatData.seats.filter(seat => seat && seat.seat_number);

    // Then, filter and sort the valid seats
    return validSeats
        .filter(seat => seat.seat_number.startsWith(row))
        .sort((a, b) => parseInt(a.seat_number.slice(1)) - parseInt(b.seat_number.slice(1)));
  }

  toggleSeatSelection(seatNumber: string): void {
    const seat = this.showSeatData?.seats.find(s => s.seat_number === seatNumber);
    if (seat && (seat.status === 'available' || seat.status === 'blocked')) {
      const index = this.selectedSeats.indexOf(seatNumber);
      if (index === -1) {
        this.selectedSeats.push(seatNumber);
      } else {
        this.selectedSeats.splice(index, 1);
      }
    }
  }

  isSeatSelected(seatNumber: string): boolean {
    return this.selectedSeats.includes(seatNumber);
  }

  getSeatClass(seat: SeatInShowSeat): string {
    const isSelected = this.isSeatSelected(seat.seat_number);
    if (seat.status === 'booked') {
      return 'bg-gray-400 text-white cursor-not-allowed';
    } else if (seat.status === 'blocked') {
      return isSelected ? 'bg-red-600 text-white' : 'bg-red-400 text-white';
    } else if (isSelected) {
      return 'bg-yellow-400 text-black';
    } else if (seat.seat_type === 'premium' || seat.seat_type === 'VIP') {
      return 'bg-blue-500 text-white hover:bg-blue-600';
    } else {
      return 'bg-green-500 text-white hover:bg-green-600';
    }
  }

  getSeatTooltip(seat: SeatInShowSeat): string {
    let tooltip = `Seat ${seat.seat_number}`;
    tooltip += `\nType: ${seat.seat_type === 'premium' ? 'Premium' : 'Normal'}`;
    tooltip += `\nStatus: ${seat.status}`;
    if (this.isSeatSelected(seat.seat_number)) {
      tooltip += '\n(Selected)';
    }
    return tooltip;
  }

  getSelectedSeatsDisplay(): string {
    return this.selectedSeats.length > 0 ? this.selectedSeats.join(', ') : 'None';
  }

  async blockSeats(): Promise<void> {
    if (!this.selectedShowId || this.selectedSeats.length === 0 || !this.operationReason) {
      alert('Please select a show, seats, and provide a reason');
      return;
    }
    this.loading = true;
    try {
      await lastValueFrom(this.seatService.blockSeats(this.selectedShowId, this.selectedSeats, this.operationReason));
      alert(`Successfully blocked ${this.selectedSeats.length} seat(s)`);
      this.loadSeatsForShow(this.selectedShowId);
    } catch (error) {
      console.error('Error blocking seats:', error);
      alert('Failed to block seats. Please try again.');
      this.loading = false;
    }
  }

  async unblockSeats(): Promise<void> {
    if (!this.selectedShowId || this.selectedSeats.length === 0) {
      alert('Please select a show and seats');
      return;
    } 
    this.loading = true;
    try {
      await lastValueFrom(this.seatService.unblockSeats(this.selectedShowId, this.selectedSeats, this.operationReason || 'Admin unblocked'));
      alert(`Successfully unblocked ${this.selectedSeats.length} seat(s)`);
      this.loadSeatsForShow(this.selectedShowId);
    } catch (error) {
      console.error('Error unblocking seats:', error);
      alert('Failed to unblock seats. Please try again.');
      this.loading = false;
    }
  }
}