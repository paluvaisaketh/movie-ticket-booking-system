// // frontend/src/app/User/components/payment/payment.component.ts

// import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute, Router, RouterLink } from '@angular/router';
// import { CommonModule, Location, DatePipe } from '@angular/common';
// import { HttpClientModule } from '@angular/common/http';
// import { lastValueFrom } from 'rxjs';
// import { FormsModule } from '@angular/forms';

// import { AuthService, User } from '../../../services/auth.service';
// import { OfferService, Offer } from '../../../services/offer.service';
// import { ShowService, Show } from '../../../services/show.service';
// import { TheatreService, Theatre, Screen } from '../../../services/theatre.service';
// import { Movie } from '../../../services/movie.service';

// // Corrected PopulatedShow interface to be consistent with the backend structure
// interface PopulatedShow extends Show {
//   movie_details?: Movie;
//   screen_details?: {
//     _id: string;
//     theatre_id: string;
//     name: string;
//   };
// }

// interface SeatInShowSeat {
//   seat_number: string;
//   seat_type: 'normal' | 'premium' | 'VIP' | 'accessible';
// }

// interface Snack {
//   name: string;
//   price: number;
//   quantity: number;
// }

// @Component({
//   imports:[CommonModule, HttpClientModule, FormsModule],
//   selector: 'app-payment',
//   templateUrl: './payment.component.html',
//   styleUrls: ['./payment.component.css'],
//   standalone: true,
//   providers: [ShowService, TheatreService, OfferService, DatePipe]
// })
// export class PaymentComponent implements OnInit {
//   // Booking details from URL
//   private showId: number = 0;
//   seatNumbers: string[] = [];
  
//   // Show data from backend
//   showDetails: PopulatedShow | null = null;
//   theatreDetails: Theatre | null = null;

//   // Display properties
//   movieTitle: string = 'Loading...';
//   cinemaName: string = 'Loading...';
//   screenName: string = 'Loading...';
//   showTime: string = '';
//   showFormat: string = '';
//   posterUrl: string = '';
//   showDate: string = '';

//   // User details
//   currentUser: User | null = null;

//   // Pricing
//   basePrice: number = 0;
//   totalAmount: number = 0;
//   convenienceFee: number = 0;
//   discountApplied: number = 0;
  
//   // Optional items
//   snacks: Snack[] = [
//     { name: 'Popcorn', price: 150, quantity: 0 },
//     { name: 'Coke', price: 80, quantity: 0 },
//     { name: 'Nachos', price: 200, quantity: 0 },
//   ];
//   parkingFee: number = 0;
//   couponCode: string = '';
//   appliedOffer: Offer | null = null;
//   couponMessage: string = '';

//   // Payment details
//   selectedPaymentMethod: string = 'card';
//   paymentProcessing: boolean = false;
  
//   // Card details
//   cardNumber: string = '';
//   cardExpiry: string = '';
//   cardCvv: string = '';
//   cardName: string = '';
//   upiId: string = '';

//   constructor(
//     private route: ActivatedRoute,
//     private router: Router,
//     private location: Location,
//     private authService: AuthService,
//     private offerService: OfferService,
//     private datePipe: DatePipe,
//     private showService: ShowService,
//     private theatreService: TheatreService
//   ) {}

//   ngOnInit(): void {
//     this.currentUser = this.authService.currentUserValue;

//     this.route.queryParams.subscribe(params => {
//       this.showId = parseInt(params['showId']);
//       this.seatNumbers = params['seats']?.split(',') || [];
//       this.basePrice = parseInt(params['total']) || 0;

//       if (this.showId) {
//         this.fetchBookingData();
//       } else {
//         this.router.navigate(['/movies']);
//       }
//     });
//   }

//   async fetchBookingData(): Promise<void> {
//     try {
//       const showData = await lastValueFrom(this.showService.getShowById(this.showId));
//       this.showDetails = showData as PopulatedShow;

//       const theatreData = await lastValueFrom(this.theatreService.getTheatreByScreenId(this.showDetails.screen_id));
//       this.theatreDetails = theatreData;
      
//       this.updateDisplayProperties();
//       this.calculateTotal();
//     } catch (error) {
//       console.error('Error fetching data for payment:', error);
//       this.router.navigate(['/movies']);
//     }
//   }

//   updateDisplayProperties(): void {
//     this.movieTitle = this.showDetails?.movie_details?.title || 'Unknown Movie';
//     this.posterUrl = this.showDetails?.movie_details?.poster || 'assets/images/default-poster.jpg';
//     this.showFormat = this.showDetails?.movie_details?.formats?.[0] || '2D';
//     this.cinemaName = this.theatreDetails?.name || 'Unknown Theatre';
//     this.screenName = this.showDetails?.screen_details?.name || 'Unknown Screen';
//     this.showTime = this.datePipe.transform(this.showDetails?.show_datetime, 'shortTime') || '';
//     this.showDate = this.datePipe.transform(this.showDetails?.show_datetime, 'yyyy-MM-dd') || '';
//   }

//   calculateTotal(): void {
//     const selectedSeats = JSON.parse(localStorage.getItem('selectedSeats') || '[]');
//     this.basePrice = selectedSeats.reduce((sum: number, seat: any) => sum + this.getSeatPrice(seat), 0);
    
//     const snacksTotal = this.getSnacksTotal();
    
//     this.convenienceFee = Math.max(30, Math.round(this.basePrice * 0.05));
//     let total = this.basePrice + this.convenienceFee + snacksTotal + this.parkingFee;
    
//     this.discountApplied = 0;
//     if (this.appliedOffer) {
//       if (this.appliedOffer.discount_type === 'percentage') {
//         const discount = (total * this.appliedOffer.discount_value) / 100;
//         this.discountApplied = Math.min(discount, this.appliedOffer.max_discount || discount);
//       } else if (this.appliedOffer.discount_type === 'fixed') {
//         this.discountApplied = this.appliedOffer.discount_value;
//       }
//     }
    
//     this.totalAmount = total - this.discountApplied;
//   }
  
//   // NEW METHOD to simplify the template binding
//   getSnacksTotal(): number {
//     return this.snacks.reduce((sum, snack) => sum + (snack.price * snack.quantity), 0);
//   }

//   // NEW METHOD to simplify the template binding for the ngIf check
//   hasSnacks(): boolean {
//     return this.snacks.some(s => s.quantity > 0);
//   }

//   async applyCoupon(): Promise<void> {
//     if (!this.couponCode) {
//       this.couponMessage = 'Please enter a coupon code.';
//       return;
//     }
//     try {
//       const offers = await lastValueFrom(this.offerService.getAllOffers());
//       const offer = offers.find(o => o.code === this.couponCode.toUpperCase());

//       if (offer && offer.is_active && new Date() >= new Date(offer.valid_from) && new Date() <= new Date(offer.valid_to) && this.totalAmount >= offer.min_amount) {
//         this.appliedOffer = offer;
//         this.couponMessage = `Coupon "${this.couponCode.toUpperCase()}" applied successfully!`;
//         this.calculateTotal();
//       } else {
//         this.appliedOffer = null;
//         this.couponMessage = 'Invalid or expired coupon code.';
//         this.calculateTotal();
//       }
//     } catch (error) {
//       this.appliedOffer = null;
//       this.couponMessage = 'Failed to apply coupon. Please try again.';
//       console.error('Error applying coupon:', error);
//       this.calculateTotal();
//     }
//   }

//   getSeatPrice(seat: any): number {
//     return seat.seat_type === 'premium' ? this.showDetails?.premium_price || 0 : this.showDetails?.normal_price || 0;
//   }

//   selectPaymentMethod(method: string): void {
//     this.selectedPaymentMethod = method;
//   }

//   increaseSnackQuantity(snack: Snack): void {
//     snack.quantity++;
//     this.calculateTotal();
//   }

//   decreaseSnackQuantity(snack: Snack): void {
//     if (snack.quantity > 0) {
//       snack.quantity--;
//       this.calculateTotal();
//     }
//   }

//   onParkingChange(event: any): void {
//     this.parkingFee = event.target.checked ? 10 : 0;
//     this.calculateTotal();
//   }

// makePayment(): void {
//   if (this.paymentProcessing) return;
//   this.paymentProcessing = true;
  
//   // Create a mock booking ID for now. In a real app, this would come from the backend after a successful booking API call.
//   const mockBookingId = 'b' + Date.now();
  
//   // Create a booking object for local storage
//   const bookingDetails = {
//     id: mockBookingId,
//     movie: this.movieTitle,
//     cinema: this.cinemaName,
//     screen: this.screenName,
//     time: this.showTime,
//     date: this.showDate,
//     seats: this.seatNumbers,
//     total: this.totalAmount,
//     status: 'Confirmed',
//     qrCode: this.generateRandomQRCode()
//   };

//   // Save the booking details to local storage
//   this.saveBooking(bookingDetails);

//   console.log('Simulating payment...');
//   console.log('Booking Details:', bookingDetails);
  
//   setTimeout(() => {
//     this.paymentProcessing = false;
//     localStorage.removeItem('selectedSeats');
    
//     // Corrected navigation to include the booking ID
//     this.router.navigate(['/booking-confirmation', mockBookingId]);
//   }, 1500);
// }

// // Add this helper method to save booking data to local storage
// private saveBooking(booking: any): void {
//   const userBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
//   userBookings.push(booking);
//   localStorage.setItem('userBookings', JSON.stringify(userBookings));
// }

// // Add a mock QR code generator for the booking object
// private generateRandomQRCode(): string {
//   // This is a placeholder. In a real app, the backend would generate this.
//   return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="#fff"/><path d="M20,20h10v10H20V20z M40,20h10v10H40V20z M60,20h10v10H60V20z M20,40h10v10H20V40z M40,40h10v10H40V40z M60,40h10v10H60V40z M20,60h10v10H20V60z M40,60h10v10H40V60z M60,60h10v10H60V60z" fill="#000"/></svg>`;
// }

  
//   goBack(): void {
//     this.location.back();
//   }

//   getFormattedDate(): string {
//     if (!this.showDate) return '';
//     const date = new Date(this.showDate);
//     return this.datePipe.transform(date, 'EEE, MMM d') || '';
//   }
// }

// frontend/src/app/User/components/payment/payment.component.ts

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, Location, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';

import { AuthService, User } from '../../../services/auth.service';
import { OfferService, Offer } from '../../../services/offer.service';
import { ShowService, Show } from '../../../services/show.service';
import { TheatreService, Theatre, Screen } from '../../../services/theatre.service';
import { Movie } from '../../../services/movie.service';
import { BookingService, BookingPayload, Booking } from '../../../services/booking.service';

// Corrected PopulatedShow interface to be consistent with the backend structure
interface PopulatedShow extends Show {
  movie_details?: Movie;
  screen_details?: {
    _id: string;
    theatre_id: string;
    name: string;
  };
}

interface SeatInShowSeat {
  seat_number: string;
  seat_type: 'normal' | 'premium' | 'VIP' | 'accessible';
}

interface Snack {
  name: string;
  price: number;
  quantity: number;
}

@Component({
  imports:[CommonModule,HttpClientModule, FormsModule],
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
  standalone: true,
  providers: [ShowService, TheatreService, OfferService, BookingService, DatePipe] // <-- Corrected line
})
export class PaymentComponent implements OnInit {
  // Booking details from URL
  private showId: number = 0;
  seatNumbers: string[] = [];
  
  // Show data from backend
  showDetails: PopulatedShow | null = null;
  theatreDetails: Theatre | null = null;

  // Display properties
  movieTitle: string = 'Loading...';
  cinemaName: string = 'Loading...';
  screenName: string = 'Loading...';
  showTime: string = '';
  showFormat: string = '';
  posterUrl: string = '';
  showDate: string = '';

  // User details
  currentUser: User | null = null;

  // Pricing
  basePrice: number = 0;
  totalAmount: number = 0;
  convenienceFee: number = 0;
  discountApplied: number = 0;
  
  // Optional items
  snacks: Snack[] = [
    { name: 'Popcorn', price: 150, quantity: 0 },
    { name: 'Coke', price: 80, quantity: 0 },
    { name: 'Nachos', price: 200, quantity: 0 },
  ];
  parkingFee: number = 0;
  couponCode: string = '';
  appliedOffer: Offer | null = null;
  couponMessage: string = '';

  // Payment details
  selectedPaymentMethod: string = 'card';
  paymentProcessing: boolean = false;
  
  // Card details
  cardNumber: string = '';
  cardExpiry: string = '';
  cardCvv: string = '';
  cardName: string = '';
  upiId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private authService: AuthService,
    private offerService: OfferService,
    private datePipe: DatePipe,
    private showService: ShowService,
    private theatreService: TheatreService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;

    this.route.queryParams.subscribe(params => {
      this.showId = parseInt(params['showId']);
      this.seatNumbers = params['seats']?.split(',') || [];
      this.basePrice = parseInt(params['total']) || 0;

      if (this.showId) {
        this.fetchBookingData();
       } else {
         this.router.navigate(['/movies']);
       }
    });
  }

  async fetchBookingData(): Promise<void> {
    try {
      const showData = await lastValueFrom(this.showService.getShowById(this.showId));
      this.showDetails = showData as PopulatedShow;

      const theatreData = await lastValueFrom(this.theatreService.getTheatreByScreenId(this.showDetails.screen_id));
      this.theatreDetails = theatreData;
      
      this.updateDisplayProperties();
      this.calculateTotal();
    } catch (error) {
      console.error('Error fetching data for payment:', error);
      this.router.navigate(['/movies']);
    }
  }

  updateDisplayProperties(): void {
    this.movieTitle = this.showDetails?.movie_details?.title || 'Unknown Movie';
    this.posterUrl = this.showDetails?.movie_details?.poster || 'assets/images/default-poster.jpg';
    this.showFormat = this.showDetails?.movie_details?.formats?.[0] || '2D';
    this.cinemaName = this.theatreDetails?.name || 'Unknown Theatre';
    this.screenName = this.showDetails?.screen_details?.name || 'Unknown Screen';
    this.showTime = this.datePipe.transform(this.showDetails?.show_datetime, 'shortTime') || '';
    this.showDate = this.datePipe.transform(this.showDetails?.show_datetime, 'yyyy-MM-dd') || '';
  }

  calculateTotal(): void {
    const selectedSeats = JSON.parse(localStorage.getItem('selectedSeats') || '[]');
    this.basePrice = selectedSeats.reduce((sum: number, seat: any) => sum + this.getSeatPrice(seat), 0);
    
    const snacksTotal = this.getSnacksTotal();
    
    this.convenienceFee = Math.max(30, Math.round(this.basePrice * 0.05));
    let total = this.basePrice + this.convenienceFee + snacksTotal + this.parkingFee;
    
    this.discountApplied = 0;
    if (this.appliedOffer) {
      if (this.appliedOffer.discount_type === 'percentage') {
        const discount = (total * this.appliedOffer.discount_value) / 100;
        this.discountApplied = Math.min(discount, this.appliedOffer.max_discount || discount);
      } else if (this.appliedOffer.discount_type === 'fixed') {
        this.discountApplied = this.appliedOffer.discount_value;
      }
    }
    
    this.totalAmount = total - this.discountApplied;
  }
  
  getSnacksTotal(): number {
    return this.snacks.reduce((sum, snack) => sum + (snack.price * snack.quantity), 0);
  }

  hasSnacks(): boolean {
    return this.snacks.some(s => s.quantity > 0);
  }

  async applyCoupon(): Promise<void> {
    if (!this.couponCode) {
      this.couponMessage = 'Please enter a coupon code.';
      return;
    }
    try {
      const offers = await lastValueFrom(this.offerService.getAllOffers());
      const offer = offers.find(o => o.code === this.couponCode.toUpperCase());

      if (offer && offer.is_active && new Date() >= new Date(offer.valid_from) && new Date() <= new Date(offer.valid_to) && this.totalAmount >= offer.min_amount) {
        this.appliedOffer = offer;
        this.couponMessage = `Coupon "${this.couponCode.toUpperCase()}" applied successfully!`;
        this.calculateTotal();
      } else {
        this.appliedOffer = null;
        this.couponMessage = 'Invalid or expired coupon code.';
        this.calculateTotal();
      }
    } catch (error) {
      this.appliedOffer = null;
      this.couponMessage = 'Failed to apply coupon. Please try again.';
      console.error('Error applying coupon:', error);
      this.calculateTotal();
    }
  }

  getSeatPrice(seat: any): number {
    return seat.seat_type === 'premium' ? this.showDetails?.premium_price || 0 : this.showDetails?.normal_price || 0;
  }

  selectPaymentMethod(method: string): void {
    this.selectedPaymentMethod = method;
  }

  increaseSnackQuantity(snack: Snack): void {
    snack.quantity++;
    this.calculateTotal();
  }

  decreaseSnackQuantity(snack: Snack): void {
    if (snack.quantity > 0) {
      snack.quantity--;
      this.calculateTotal();
    }
  }

  onParkingChange(event: any): void {
    this.parkingFee = event.target.checked ? 10 : 0;
    this.calculateTotal();
  }

  async makePayment(): Promise<void> {
    if (this.paymentProcessing) return;
    this.paymentProcessing = true;
    
    const bookingPayload: BookingPayload = {
      show_id: this.showId,
      seat_numbers: this.seatNumbers,
      snacks_items: this.snacks.filter(s => s.quantity > 0).map(s => ({
        name: s.name,
        quantity: s.quantity
      })),
      parking_charges: this.parkingFee,
    };
    
    try {
      const newBooking = await lastValueFrom(this.bookingService.createBooking(bookingPayload));
      
      this.paymentProcessing = false;
      localStorage.removeItem('selectedSeats');
      
      this.router.navigate(['/booking-confirmation', newBooking._id]);
      
    } catch (error) {
      this.paymentProcessing = false;
      console.error('Booking failed:', error);
      alert('Payment failed. Please try again.');
    }
  }

  goBack(): void {
    this.location.back();
  }

  getFormattedDate(): string {
    if (!this.showDate) return '';
    const date = new Date(this.showDate);
    return this.datePipe.transform(date, 'EEE, MMM d') || '';
  }
}