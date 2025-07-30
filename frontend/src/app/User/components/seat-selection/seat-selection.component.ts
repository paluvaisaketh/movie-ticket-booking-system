import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, Location, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { forkJoin, lastValueFrom } from 'rxjs';
import { AuthService } from '../../../services/auth.service'; // Import AuthService

import { ShowService, Show } from '../../../services/show.service';
import { TheatreService, Theatre, Screen } from '../../../services/theatre.service';
import { SeatService, ShowSeat, SeatInShowSeat } from '../../../services/seat.service';


// Extend the Show interface to include movie_details and screen_details as populated by the backend
interface PopulatedShow extends Show {
  movie_details?: { // Matches the structure from showController.js
    _id: string;
    title: string;
    poster: string;
    rating: string;
    language: string;
    duration: string;
    synopsis: string;
    genre: string[];
    formats: string[];
  };
  screen_details?: { // Matches the structure from showController.js
    _id: string;
    theatre_id: string;
    name: string;
  };
}

@Component({
  standalone: true,
  selector: 'app-seat-selection',
  templateUrl: './seat-selection.component.html',
  styleUrls: ['./seat-selection.component.css'],
  imports: [CommonModule, HttpClientModule],
  providers: [ShowService, TheatreService, SeatService, DatePipe]
})
export class SeatSelectionComponent implements OnInit {
  // Show data from backend
  private showId: number = 0;
  private selectedMovieId: string = ''; // Not directly used in this component, but passed from movies-page
  showDetails: PopulatedShow | null = null; // Use PopulatedShow interface
  theatreDetails: Theatre | null = null;
  screenDetails: Screen | null = null;
  showSeatData: ShowSeat | null = null;

  // Display properties
  movieTitle: string = 'Loading...';
  cinemaName: string = 'Loading...';
  screenName: string = 'Loading...';
  showTime: string = 'Loading...';
  showDate: string = ''; // Format: YYYY-MM-DD
  showFormat: string = ''; // This comes from movie_details now
  
  rows: string[] = []; // e.g., ['K', 'J', 'I', ...]
  selectedSeats: SeatInShowSeat[] = [];
  totalPrice: number = 0;
  
  loading: boolean = true;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private showService: ShowService,
    private theatreService: TheatreService,
    private seatService: SeatService,
    private datePipe: DatePipe,
    private authService: AuthService // Inject AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.showId = parseInt(params['showId']);
      this.showDate = params['date']; // This is the YYYY-MM-DD string
      this.selectedMovieId = params['movieId']; // Passed from movies-page, not directly used here

      if (this.showId) {
        this.fetchShowData();
      } else {
        this.loading = false;
        console.error('Show ID not found in URL parameters.');
        this.router.navigate(['/movies']);
      }
    });
  }

  async fetchShowData(): Promise<void> {
    this.loading = true;
    try {
      // Fetch show details and show seat status in parallel
      const [show, showSeats] = await lastValueFrom(
        forkJoin([
          this.showService.getShowById(this.showId),
          this.seatService.getShowSeatsStatus(this.showId)
        ])
      );
      
      this.showDetails = show as PopulatedShow; // Cast to PopulatedShow
      this.showSeatData = showSeats;
      
      // Fetch theatre details using the screen_id from the show
      // The getTheatreByScreenId method is now implemented in TheatreService
      const theatre = await lastValueFrom(this.theatreService.getTheatreByScreenId(this.showDetails.screen_id));
      this.theatreDetails = theatre;
      // Find the specific screen within the fetched theatre
      this.screenDetails = theatre.screens?.find((s: Screen) => s._id === this.showDetails?.screen_id) || null;

      // Populate display properties
      this.movieTitle = this.showDetails.movie_details?.title || 'Movie not found';
      this.cinemaName = this.theatreDetails?.name || 'Theatre not found';
      this.screenName = this.screenDetails?.name || 'Screen not found';
      this.showTime = this.datePipe.transform(this.showDetails.show_datetime, 'shortTime') || 'Time not available';
      this.showFormat = this.showDetails.movie_details?.formats?.[0] || '2D'; // Assuming first format for display
      
      this.generateSeatRows();
      this.loadSelectedSeats(); // Load previously selected seats (if any)
      this.loading = false;

    } catch (error) {
      console.error('Error fetching show data:', error);
      this.loading = false;
      // Display a user-friendly error message
      alert('Failed to load show details or seat map. Please try again later.');
      this.router.navigate(['/movies']); // Redirect back to movies page on error
    }
  }

  // Generates unique row labels (e.g., ['K', 'J', 'I', ...]) from seat data
  generateSeatRows(): void {
    if (!this.showSeatData?.seats) {
      this.rows = [];
      return;
    }
    const uniqueRows = new Set<string>();
    this.showSeatData.seats.forEach(seat => uniqueRows.add(seat.seat_number.charAt(0)));
    this.rows = Array.from(uniqueRows).sort().reverse(); // Sort alphabetically and reverse for K at top
  }
  
  // Filters and sorts seats for a given row
  getSeatsForRow(row: string): SeatInShowSeat[] {
    if (!this.showSeatData?.seats) return [];
    return this.showSeatData.seats
      .filter((seat: SeatInShowSeat) => seat.seat_number.startsWith(row))
      .sort((a, b) => parseInt(a.seat_number.slice(1)) - parseInt(b.seat_number.slice(1)));
  }

  // Calculates seat price based on type and show's pricing
  getSeatPrice(seat: SeatInShowSeat): number {
    if (!this.showDetails) return 0;
    // Assume price multipliers are handled on the backend or in a helper
    // For now, use a simple check based on seat type
    return seat.seat_type === 'premium' ? this.showDetails.premium_price : this.showDetails.normal_price;
  }

  // Toggles seat selection
  toggleSeatSelection(seat: SeatInShowSeat): void {
    // Treat 'blocked' seats as unavailable to the user, same as 'booked'
    if (seat.status === 'booked' || seat.status === 'blocked') return;

    const index = this.selectedSeats.findIndex(s => s.seat_number === seat.seat_number);

    if (index === -1) {
      this.selectedSeats.push(seat);
    } else {
      this.selectedSeats.splice(index, 1);
    }
    
    this.updateTotalPrice();
  }

  // Updates total price of selected seats
  updateTotalPrice(): void {
    this.totalPrice = this.selectedSeats.reduce((sum, seat) => sum + this.getSeatPrice(seat), 0);
  }

  // Loads previously selected seats from local storage
  loadSelectedSeats(): void {
    const savedSeats = localStorage.getItem('selectedSeats');
    if (savedSeats && this.showSeatData) {
      const seats: SeatInShowSeat[] = JSON.parse(savedSeats);
      // Filter out seats that are no longer available or are already booked/blocked
      this.selectedSeats = seats.filter(savedSeat => {
        const currentSeatStatus = this.showSeatData?.seats.find(s => s.seat_number === savedSeat.seat_number);
        return currentSeatStatus && currentSeatStatus.status === 'available';
      });
      this.updateTotalPrice();
    }
  }

  // Checks if a seat is currently selected
  isSeatSelected(seatNumber: string): boolean {
    return this.selectedSeats.some(s => s.seat_number === seatNumber);
  }

  // Determines CSS class for a seat based on its status and type
  getSeatClass(seat: SeatInShowSeat): string {
    const isSelected = this.isSeatSelected(seat.seat_number);
    if (seat.status === 'booked' || seat.status === 'blocked') {
      return 'booked';
    } else if (isSelected) {
      return 'selected';
    } else if (seat.seat_type === 'premium' || seat.seat_type === 'VIP') {
      return 'premium';
    } else {
      return 'available';
    }
  }

  // Gets the display text for a seat (e.g., just the number)
  getSeatDisplay(seat: SeatInShowSeat): string {
    return seat.seat_number.slice(1);
  }

// A method to check if the user is authenticated
isLoggedIn(): boolean {
  return this.authService.getToken() !== null;
}

proceedToPayment(): void {
  if (this.selectedSeats.length === 0) {
    alert('Please select at least one seat');
    return;
  }

  // Check if the user is logged in
  if (!this.authService.isAuthenticated()) {
    // If not logged in, save the current selection and redirect to login
    localStorage.setItem('selectedSeats', JSON.stringify(this.selectedSeats));
    
    // Capture the current URL to use as a redirect destination
    const currentUrl = this.router.url;
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: currentUrl }
    });
  } else {
    // If already logged in, proceed directly to the payment page
    localStorage.setItem('selectedSeats', JSON.stringify(this.selectedSeats));
    
    this.router.navigate(['/payment'], {
      queryParams: {
        showId: this.showId,
        seats: this.selectedSeats.map(s => s.seat_number).join(','),
        total: this.totalPrice
      }
    });
  }
}
  goBack(): void {
    this.selectedSeats = [];
    this.totalPrice = 0;
    localStorage.removeItem('selectedSeats');
    this.location.back();
  }
}