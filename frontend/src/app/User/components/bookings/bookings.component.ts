// frontend/src/app/User/components/bookings/bookings.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { LayoutComponent } from '../../../Core/layout/layout.component';

import { AuthService, User } from '../../../services/auth.service';
import { Booking, BookingService, PopulatedShow, SnackItem, SeatBooked } from '../../../services/booking.service';
import { Show, ShowService } from '../../../services/show.service';
import { Movie, MovieService } from '../../../services/movie.service';
import { Screen, TheatreService, Theatre } from '../../../services/theatre.service';
import Swal from 'sweetalert2';

import { lastValueFrom, forkJoin } from 'rxjs';

@Component({
  standalone: true,
  imports: [RouterLink, CommonModule, LayoutComponent],
  selector: 'app-bookings',
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.css'],
  providers: [BookingService, ShowService, MovieService, TheatreService, DatePipe]
})
export class BookingsComponent implements OnInit {
  userBookings: Booking[] = [];
  showQR: string | null = null;
  isLoading = true;
  error: string | null = null;

  private allShows: Show[] = [];
  private allMovies: Movie[] = [];
  private allTheatres: Theatre[] = [];

  showDeleteConfirmation = false;
  bookingToDeleteId: string | null = null;

  showPartialCancelModal = false;
  bookingToPartialCancel: Booking | null = null;
  selectedSeatsToCancel: string[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private bookingService: BookingService,
    private showService: ShowService,
    private movieService: MovieService,
    private theatreService: TheatreService,
    private datePipe: DatePipe
  ) {}

  async ngOnInit(): Promise<void> {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    await this.loadBookings();
  }

  async loadBookings(): Promise<void> {
    this.isLoading = true;
    this.error = null;
    try {
      const currentUser = this.authService.currentUserValue;
      if (!currentUser) {
        this.router.navigate(['/login']);
        return;
      }
      
      const [movies, shows, theatres, bookings] = await lastValueFrom(
        forkJoin([
          this.movieService.getAllMovies(),
          this.showService.getAllShows(),
          this.theatreService.getAllTheatres(),
          this.bookingService.getUserBookings()
        ])
      );
      this.allMovies = movies ?? [];
      this.allShows = shows ?? [];
      this.allTheatres = theatres ?? [];
      this.userBookings = bookings ?? [];
      
      this.userBookings.forEach(booking => {
          if (booking.show_id && typeof booking.show_id.screen_id === 'string') {
              const theatre = this.allTheatres.find(t => t.screens?.some(s => s._id === booking.show_id.screen_id));
              const screen = theatre?.screens?.find(s => s._id === booking.show_id.screen_id);
              if (screen) {
                  (booking.show_id.screen_details as any) = { ...screen, theatre_id: theatre };
                  (booking.show_id.movie_details as any) = this.allMovies.find(m => m._id === booking.show_id.movie_id);
              }
          }
      });
      
      this.isLoading = false;

    } catch (err: any) {
      this.error = 'Failed to load bookings. Please try again later.';
      this.isLoading = false;
      console.error('Error loading bookings:', err);
      if (err.status === 401 || err.status === 403) {
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    }
  }

  toggleQR(bookingId: string): void { 
    this.showQR = this.showQR === bookingId ? null : bookingId;
  }
  
  // New helper function to check if the QR modal should be open
  showQrModal(bookingId: string): boolean {
    return this.showQR === bookingId;
  }
  
  confirmCancel(bookingId: string): void { this.bookingToDeleteId = bookingId; this.showDeleteConfirmation = true; }
  cancelBooking(): void {
      if (!this.bookingToDeleteId) { this.showDeleteConfirmation = false; return; }
      this.isLoading = true; this.error = null;
      this.bookingService.cancelBooking(this.bookingToDeleteId).subscribe({
          next: () => { this.userBookings = this.userBookings.filter(b => b._id !== this.bookingToDeleteId); this.showDeleteConfirmation = false; this.bookingToDeleteId = null; this.isLoading = false; console.log('Booking cancelled successfully!'); this.loadBookings(); },
          error: (err: any) => { console.error('Failed to cancel booking:', err); this.error = err.error?.msg || 'Failed to cancel booking. Please try again.'; this.showDeleteConfirmation = false; this.isLoading = false; }
      });
  }
  openPartialCancelModal(booking: Booking): void { this.bookingToPartialCancel = booking; this.selectedSeatsToCancel = []; this.showPartialCancelModal = true; console.log("Partial cancel modal opened (logic active, but HTML modal removed for test)"); }
  closePartialCancelModal(): void { this.showPartialCancelModal = false; this.bookingToPartialCancel = null; this.selectedSeatsToCancel = []; }
  onSeatSelectionChange(event: any, seatNumber: string): void { if (event.target.checked) { this.selectedSeatsToCancel.push(seatNumber); } else { this.selectedSeatsToCancel = this.selectedSeatsToCancel.filter(s => s !== seatNumber); } }
  performPartialCancellation(): void {
      if (!this.bookingToPartialCancel || this.selectedSeatsToCancel.length === 0) { this.error = 'Please select seats to cancel.'; return; }
      this.isLoading = true; this.error = null;
      this.bookingService.partialCancelBooking(this.bookingToPartialCancel._id, this.selectedSeatsToCancel).subscribe({
          next: (response) => { console.log('Partial cancellation successful:', response.msg); this.userBookings = this.userBookings.map(b => b._id === response.booking._id ? response.booking : b); this.closePartialCancelModal(); this.isLoading = false; this.loadBookings(); },
          error: (err: any) => { console.error('Failed to partial cancel booking:', err); this.error = err.error?.msg || 'Failed to partial cancel booking. Please try again.'; this.showPartialCancelModal = false; this.isLoading = false; }
      });
  }

  canCancel(booking: Booking): boolean {
    const showDateTime = new Date(booking.show_id.show_datetime);
    const fiveHoursBeforeShow = new Date(showDateTime.getTime() - (5 * 60 * 60 * 1000));
    return new Date() < fiveHoursBeforeShow && (booking.status === 'confirmed' || booking.status === 'pending');
  }
  isEligibleForPartialCancel(booking: Booking): boolean {
    return (booking.seats_booked.length > 5) && (booking.status === 'confirmed' || booking.status === 'partially_cancelled');
  }
  
  // Helper to get formatted seat numbers
  getSeatNumbersDisplay(seats: SeatBooked[]): string {
    return seats?.map(s => s.seat_number).join(', ') || 'N/A';
  }

  getSnacksDisplay(snacks: SnackItem[]): string {
    if (!snacks || snacks.length === 0) return 'No Snacks';
    return snacks.map(s => `${s.name} (x${s.quantity})`).join(', ');
  }
  hasSnacks(snacks: SnackItem[]): boolean {
    return snacks && snacks.length > 0 && snacks.some(s => s.total_price > 0);
  }
  hasParking(parkingCharges: number): boolean {
    return parkingCharges > 0;
  }
// logout(): void {
//   const confirmLogout = window.confirm('Are you sure you want to log out?');
//   if (confirmLogout) {
//     this.authService.logout();
//   }
// }
logout(): void {
  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you really want to log out?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, log out',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      this.authService.logout();
    }
  });
}

}