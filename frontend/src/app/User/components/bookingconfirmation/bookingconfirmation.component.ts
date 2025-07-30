import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Booking {
  id: string;
  movie: string;
  cinema: string;
  time: string;
  date: string | Date;
  seats: string[];
  total: number;
  qrCode: string;
  status?: string;
}

@Component({
  selector: 'app-bookingconfirmation',
  templateUrl: './bookingconfirmation.component.html',
  styleUrls: ['./bookingconfirmation.component.css'],
  standalone: true,
  imports: [CommonModule, RouterLink]
})
export class BookingConfirmationComponent implements OnInit {
  booking: Booking | null = null;
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const bookingId = this.route.snapshot.paramMap.get('id');
    if (!bookingId) {
      this.handleError('No booking ID provided');
      return;
    }
    
    this.loadBookingFromStorage(bookingId);
  }

  loadBookingFromStorage(bookingId: string): void {
    try {
      // Fixed localStorage parsing with proper type handling
      const bookingsData = localStorage.getItem('userBookings');
      const bookings: Booking[] = bookingsData ? JSON.parse(bookingsData) : [];
      
      const foundBooking = bookings.find((b: Booking) => b.id === bookingId);
      this.booking = foundBooking || null;      
      if (!this.booking) {
        this.handleError('Booking not found');
      } else {
        // Ensure date is properly formatted
        if (typeof this.booking.date === 'string') {
          this.booking.date = new Date(this.booking.date);
        }
      }
    } catch (err) {
      this.handleError('Failed to load booking details');
      console.error('Error loading booking:', err);
    } finally {
      this.loading = false;
    }
  }

  handleError(message: string): void {
    this.error = message;
    // setTimeout(() => {
    //   this.router.navigate(['/movies']);
    // }, 3000);
  }

  getFormattedDate(date: Date | string): string {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}