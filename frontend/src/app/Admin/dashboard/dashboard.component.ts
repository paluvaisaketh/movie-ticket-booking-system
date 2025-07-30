// src/app/Admin/dashboard/dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js/auto';
import { CommonModule, DatePipe } from '@angular/common';
import { SideNavbarComponent } from '../components/side-navbar/side-navbar.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminHeaderComponent } from '../components/admin-header/admin-header.component';
import { forkJoin, catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';

// Update interfaces to match backend schemas
interface Movie {
  _id: string; // Updated to string
  title: string;
  poster: string;
  rating: string;
  language: string;
  genre: string[];
  duration: string;
  synopsis: string;
  formats: string[];
}

interface Booking {
  _id: string; // Updated to string
  user_id: string; // Updated to string
  show_id: number; // Updated to number
  base_amount: number;
  convenience_fee: number;
  discount_applied: number;
  final_amount: number;
  status: string;
  created_at: string;
  snacks_items: { name: string; quantity: number }[]; // Corrected interface
  parking_charges: number; // Corrected interface
  // Add other properties that are in your backend Booking model here
}

interface Show {
  _id: number;
  movie_id: string;
  screen_id: string;
  show_datetime: string;
  normal_price: number;
  premium_price: number;
  is_active: boolean;
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
}

interface Theatre {
  _id: string;
  name: string;
  location: string;
  contact: string;
  is_active: boolean;
  created_at: string;
  screens: { _id: string; name: string }[];
}

interface Payment {
  _id: string;
  booking_id: string;
  original_amount: number;
  final_amount: number;
  payment_method: string;
  status: string;
  created_at: string;
}

interface DashboardData {
  totalActiveMovies: number;
  todaysBookings: number;
  totalRevenue: number;
  totalBookings: number;
  popularMovies: { movie: Movie; bookingsCount: number }[];
  recentBookings: {
    id: string;
    user_id: string;
    movieTitle: string;
    theaterName: string;
    showtime: string;
    seats: string[];
    totalAmount: number;
    bookingDate: string;
    status: string;
  }[];
  // New metrics for charts
  totalSnackRevenue: number;
  totalParkingRevenue: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, SideNavbarComponent, HttpClientModule, FormsModule,ReactiveFormsModule,AdminHeaderComponent],
  providers: [DatePipe]
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Data from API
  movies: Movie[] = [];
  bookings: Booking[] = [];
  shows: Show[] = [];
  users: User[] = [];
  payments: Payment[] = [];
  theatre: Theatre = {
    _id: '',
    name: '',
    location: '',
    contact: '',
    is_active: false,
    created_at: '',
    screens: []
  };

  // Filtered data
  filteredData: DashboardData = {
    totalActiveMovies: 0,
    todaysBookings: 0,
    totalRevenue: 0,
    totalBookings: 0,
    popularMovies: [],
    recentBookings: [],
    totalSnackRevenue: 0,
    totalParkingRevenue: 0
  };

  // Previous period data for comparison
  previousPeriodData: DashboardData = {
    totalActiveMovies: 0,
    todaysBookings: 0,
    totalRevenue: 0,
    totalBookings: 0,
    popularMovies: [],
    recentBookings: [],
    totalSnackRevenue: 0,
    totalParkingRevenue: 0
  };

  // UI State
  loading: boolean = true;
  error: string | null = null;
  hasChartData: boolean = false;
  timeRange: string = 'today';
  searchQuery: string = '';
  selectedMovie: string = '';
  selectedScreen: string = '';
  selectedStatus: string = '';
  startDate: string = '';
  endDate: string = '';
  bookingsChartType: string = 'day';
  revenueChartType: string = 'day';

  // Chart instances
  bookingsChart: Chart | null = null;
  revenueChart: Chart | null = null;
  moviePerformanceChart: Chart | null = null;
  screenUtilizationChart: Chart | null = null;
  paymentMethodsChart: Chart | null = null;
  snackRevenueChart: Chart | null = null; // New chart
  parkingRevenueChart: Chart | null = null; // New chart

  private baseUrl = environment.apiUrl;
  private token = '';

  constructor(private http: HttpClient, private datePipe: DatePipe) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.token = localStorage.getItem('token') || '';
    if (!this.token) {
      this.error = 'No token found. Please log in as an admin.';
      this.loading = false;
      return;
    }
    this.fetchDashboardData();
    this.setDefaultDates();
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  private handleError(message: string, error: any): void {
  console.error(message, error);
  this.error = message;
  this.loading = false;
}

  private destroyCharts(): void {
    if (this.bookingsChart) this.bookingsChart.destroy();
    if (this.revenueChart) this.revenueChart.destroy();
    if (this.moviePerformanceChart) this.moviePerformanceChart.destroy();
    if (this.screenUtilizationChart) this.screenUtilizationChart.destroy();
    if (this.paymentMethodsChart) this.paymentMethodsChart.destroy();
    if (this.snackRevenueChart) this.snackRevenueChart.destroy();
    if (this.parkingRevenueChart) this.parkingRevenueChart.destroy();
  }

  setDefaultDates(): void {
    const today = new Date();
    this.endDate = today.toISOString().split('T')[0];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    this.startDate = sevenDaysAgo.toISOString().split('T')[0];
  }

  fetchDashboardData(): void {
    this.loading = true;
    this.error = null;
    this.hasChartData = false;

    const headers = { 'x-auth-token': this.token };

    const movies$ = this.http.get<Movie[]>(`${this.baseUrl}/movies`, { headers }).pipe(
      catchError(err => { this.handleError('Failed to load movies.', err); return of([]); })
    );
    const bookings$ = this.http.get<Booking[]>(`${this.baseUrl}/bookings`, { headers }).pipe(
      catchError(err => { this.handleError('Failed to load bookings.', err); return of([]); })
    );
    const shows$ = this.http.get<Show[]>(`${this.baseUrl}/shows`, { headers }).pipe(
      catchError(err => { this.handleError('Failed to load shows.', err); return of([]); })
    );
    const users$ = this.http.get<User[]>(`${this.baseUrl}/users`, { headers }).pipe(
      catchError(err => { this.handleError('Failed to load users.', err); return of([]); })
    );
    const payments$ = this.http.get<Payment[]>(`${this.baseUrl}/payments`, { headers }).pipe(
      catchError(err => { this.handleError('Failed to load payments.', err); return of([]); })
    );
    const theatre$ = this.http.get<Theatre[]>(`${this.baseUrl}/theatres`, { headers }).pipe(
      catchError(err => { this.handleError('Failed to load theatre.', err); return of([]); })
    );

    forkJoin({
      movies: movies$,
      bookings: bookings$,
      shows: shows$,
      users: users$,
      payments: payments$,
      theatre: theatre$
    }).subscribe({
      next: (response) => {
        this.movies = response.movies || [];
        this.bookings = response.bookings || [];
        this.shows = response.shows || [];
        this.users = response.users || [];
        this.payments = response.payments || [];
        this.theatre = response.theatre[0] || { _id: '', name: '', location: '', contact: '', is_active: false, created_at: '', screens: [] };

        this.processDashboardData();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  processDashboardData(): void {
    const allData = this.processData(this.bookings, this.shows, this.movies, this.theatre, this.users);
    this.previousPeriodData = this.calculatePreviousPeriodData(allData);
    this.filterData();
  }

  processData(bookings: Booking[], shows: Show[], movies: Movie[], theatre: Theatre, users: User[]): DashboardData {
    let filteredBookings = [...bookings];
    
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filteredBookings = filteredBookings.filter(booking => {
        const user = users.find(u => u._id === booking.user_id);
        const show = shows.find(s => s._id === Number(booking.show_id));
        const movie = show ? movies.find(m => m._id === show.movie_id) : null;
        
        return (
          (user && user.name.toLowerCase().includes(query)) ||
          (movie && movie.title.toLowerCase().includes(query)) ||
          booking._id.includes(query)
        );
      });
    }

    if (this.selectedMovie) {
      filteredBookings = filteredBookings.filter(booking => {
        const show = shows.find(s => s._id === Number(booking.show_id));
        return show && show.movie_id === this.selectedMovie;
      });
    }

    if (this.selectedScreen) {
      filteredBookings = filteredBookings.filter(booking => {
        const show = shows.find(s => s._id === Number(booking.show_id));
        return show && show.screen_id === this.selectedScreen;
      });
    }

    if (this.selectedStatus) {
      filteredBookings = filteredBookings.filter(booking => booking.status === this.selectedStatus);
    }

    if (this.startDate && this.endDate) {
      filteredBookings = filteredBookings.filter(booking => {
        const bookingDate = new Date(booking.created_at);
        return bookingDate >= new Date(this.startDate) && bookingDate <= new Date(this.endDate);
      });
    } else {
      const dateFilter = this.getDateRangeFilter(this.timeRange);
      if (dateFilter) {
        filteredBookings = filteredBookings.filter(booking => {
          const bookingDate = new Date(booking.created_at);
          return bookingDate >= new Date(dateFilter.start) && bookingDate <= new Date(dateFilter.end);
        });
      }
    }

    const totalActiveMovies = movies.length;
    const totalBookings = filteredBookings.length;
    const today = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    const todaysBookings = filteredBookings.filter(booking => this.datePipe.transform(booking.created_at, 'yyyy-MM-dd') === today).length;
    const totalRevenue = filteredBookings.reduce((sum, booking) => sum + booking.final_amount, 0);
    // Assuming each snack has a fixed price, e.g., 100. Replace 100 with actual price if available.
    const SNACK_PRICE = 100;
    const totalSnackRevenue = filteredBookings.reduce((sum, booking) => 
      sum + (booking.snacks_items ? booking.snacks_items.reduce((snackSum, snack) => snackSum + (snack.quantity * SNACK_PRICE), 0) : 0), 0);
    const totalParkingRevenue = filteredBookings.reduce((sum, booking) => sum + (booking.parking_charges || 0), 0);


    const movieBookingsCount = new Map<string, number>();
    const movieRevenue = new Map<string, number>();
    
    filteredBookings.forEach(booking => {
      const show = shows.find(s => s._id === Number(booking.show_id));
      if (show) {
        const count = movieBookingsCount.get(show.movie_id) || 0;
        movieBookingsCount.set(show.movie_id, count + 1);
        let revenue = movieRevenue.get(show.movie_id) || 0;
        revenue += booking.final_amount;
        movieRevenue.set(show.movie_id, revenue);
      }
    });

    const popularMovies = movies
      .map(movie => ({
        movie,
        bookingsCount: movieBookingsCount.get(movie._id) || 0
      }))
      .sort((a, b) => b.bookingsCount - a.bookingsCount)
      .slice(0, 5);

    const recentBookings = filteredBookings
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map(booking => {
        const show = shows.find(s => s._id === Number(booking.show_id));
        const movie = show ? movies.find(m => m._id === show.movie_id) : null;
        const screen = show ? theatre.screens.find(s => s._id === show.screen_id) : null;
        
        return {
          id: booking._id,
          user_id: booking.user_id,
          movieTitle: movie?.title || 'Unknown Movie',
          theaterName: screen?.name || 'Unknown Screen',
          showtime: show ? show.show_datetime : 'Unknown Time',
          seats: ['A1', 'A2'], // Placeholder for now, as seat info not in Booking model
          totalAmount: booking.final_amount,
          bookingDate: booking.created_at,
          status: booking.status
        };
      });

    return {
      totalActiveMovies,
      todaysBookings,
      totalRevenue,
      totalBookings,
      popularMovies,
      recentBookings,
      totalSnackRevenue,
      totalParkingRevenue
    };
  }

  calculatePreviousPeriodData(currentData: DashboardData): DashboardData {
    let daysToSubtract = 0;
    
    switch (this.timeRange) {
      case 'today': daysToSubtract = 1; break;
      case 'week': daysToSubtract = 7; break;
      case 'month': daysToSubtract = 30; break;
      case 'year': daysToSubtract = 365; break;
      default: return { ...currentData, totalBookings: 0, totalRevenue: 0, todaysBookings: 0 };
    }

    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() - daysToSubtract);
    const startDate = new Date(endDate);
    
    switch (this.timeRange) {
      case 'today': startDate.setDate(endDate.getDate() - 1); break;
      case 'week': startDate.setDate(endDate.getDate() - 7); break;
      case 'month': startDate.setDate(endDate.getDate() - 30); break;
      case 'year': startDate.setDate(endDate.getDate() - 365); break;
    }

    const prevBookings = this.bookings.filter(booking => {
      const bookingDate = new Date(booking.created_at);
      return bookingDate >= startDate && bookingDate <= endDate;
    });

    return this.processData(prevBookings, this.shows, this.movies, this.theatre, this.users);
  }

  filterData(): void {
    if (!this.bookings || !this.shows || !this.movies) return;

    this.filteredData = this.processData(this.bookings, this.shows, this.movies, this.theatre, this.users);
    this.hasChartData = this.filteredData.totalBookings > 0;
    
    if (this.hasChartData) {
      setTimeout(() => { this.createCharts(); }, 0);
    }
  }

  private getDateRangeFilter(range: string): { start: string; end: string } | null {
    const today = new Date();
    const endDate = this.datePipe.transform(today, 'yyyy-MM-dd')!;
    
    switch (range) {
      case 'today': return { start: endDate, end: endDate };
      case 'week':
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);
        return { start: this.datePipe.transform(weekAgo, 'yyyy-MM-dd')!, end: endDate };
      case 'month':
        const monthAgo = new Date();
        monthAgo.setMonth(today.getMonth() - 1);
        return { start: this.datePipe.transform(monthAgo, 'yyyy-MM-dd')!, end: endDate };
      case 'year':
        const yearAgo = new Date();
        yearAgo.setFullYear(today.getFullYear() - 1);
        return { start: this.datePipe.transform(yearAgo, 'yyyy-MM-dd')!, end: endDate };
      case 'all': return null;
      default: return { start: endDate, end: endDate };
    }
  }

  createCharts(): void {
    this.destroyCharts();
    this.createBookingsChart();
    this.createRevenueChart();
    this.createMoviePerformanceChart();
    this.createScreenUtilizationChart();
    this.createPaymentMethodsChart();
  }

  private createBookingsChart(): void {
    const ctx = document.getElementById('bookingsChart') as HTMLCanvasElement;
    if (!ctx) return;
    const bookingsData = this.getTimeGroupedData('bookings');
    this.bookingsChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: bookingsData.labels,
        datasets: [{
          label: 'Bookings',
          data: bookingsData.values,
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: 'rgba(59, 130, 246, 0.8)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        }]
      },
      options: { responsive: true, plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } }, scales: { y: { beginAtZero: true, title: { display: true, text: 'Number of Bookings' } }, x: { title: { display: true, text: this.getChartXAxisLabel() } } } }
    });
  }

  private createRevenueChart(): void {
    const ctx = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (!ctx) return;
    const revenueData = this.getTimeGroupedData('revenue');
    this.revenueChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: revenueData.labels,
        datasets: [{
          label: 'Revenue (₹)',
          data: revenueData.values,
          backgroundColor: 'rgba(124, 58, 237, 0.7)',
          borderColor: 'rgba(124, 58, 237, 1)',
          borderWidth: 1
        }]
      },
      options: { responsive: true, plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false, callbacks: { label: (context) => `₹${(context.raw as number).toLocaleString()}` } } }, scales: { y: { beginAtZero: true, title: { display: true, text: 'Revenue (₹)' }, ticks: { callback: (value) => `₹${value.toLocaleString()}` } }, x: { title: { display: true, text: this.getChartXAxisLabel() } } } }
    });
  }

  private createMoviePerformanceChart(): void {
    const ctx = document.getElementById('moviePerformanceChart') as HTMLCanvasElement;
    if (!ctx) return;
    const movieRevenue = new Map<string, number>();
    this.filteredData.popularMovies.forEach(item => {
      const revenue = this.getMovieRevenue(item.movie._id);
      movieRevenue.set(item.movie.title, revenue);
    });
    const sortedMovies = Array.from(movieRevenue.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
    this.moviePerformanceChart = new Chart(ctx, {
      type: 'doughnut',
      data: { labels: sortedMovies.map(item => item[0]), datasets: [{ data: sortedMovies.map(item => item[1]), backgroundColor: [ 'rgba(59, 130, 246, 0.7)', 'rgba(16, 185, 129, 0.7)', 'rgba(245, 158, 11, 0.7)', 'rgba(139, 92, 246, 0.7)', 'rgba(244, 63, 94, 0.7)' ], borderWidth: 1 }] },
      options: { responsive: true, plugins: { legend: { position: 'right' }, tooltip: { callbacks: { label: (context) => { const value = context.raw as number; const total = this.filteredData.totalRevenue; const percentage = ((value / total) * 100).toFixed(1); return `${context.label}: ₹${value.toLocaleString()} (${percentage}%)`; } } } } }
    });
  }

  private createScreenUtilizationChart(): void {
    const ctx = document.getElementById('screenUtilizationChart') as HTMLCanvasElement;
    if (!ctx) return;
    const screenUtilization = new Map<string, number>();
    this.theatre.screens.forEach(screen => {
      const bookingsForScreen = this.bookings.filter(booking => {
        const show = this.shows.find(s => s._id === Number(booking.show_id));
        return show && show.screen_id === screen._id;
      }).length;
      screenUtilization.set(screen.name, bookingsForScreen);
    });
    this.screenUtilizationChart = new Chart(ctx, {
      type: 'bar',
      data: { labels: Array.from(screenUtilization.keys()), datasets: [{ label: 'Bookings', data: Array.from(screenUtilization.values()), backgroundColor: 'rgba(16, 185, 129, 0.7)', borderColor: 'rgba(16, 185, 129, 1)', borderWidth: 1 }] },
      options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, title: { display: true, text: 'Number of Bookings' } }, x: { title: { display: true, text: 'Screen' } } } }
    });
  }

  private createPaymentMethodsChart(): void {
    const ctx = document.getElementById('paymentMethodsChart') as HTMLCanvasElement;
    if (!ctx) return;
    const paymentMethods = new Map<string, number>();
    this.payments.forEach(payment => {
      const count = paymentMethods.get(payment.payment_method) || 0;
      paymentMethods.set(payment.payment_method, count + 1);
    });
    this.paymentMethodsChart = new Chart(ctx, {
      type: 'pie',
      data: { labels: Array.from(paymentMethods.keys()).map(method => method.charAt(0).toUpperCase() + method.slice(1) ), datasets: [{ data: Array.from(paymentMethods.values()), backgroundColor: [ 'rgba(59, 130, 246, 0.7)', 'rgba(16, 185, 129, 0.7)', 'rgba(245, 158, 11, 0.7)' ], borderWidth: 1 }] },
      options: { responsive: true, plugins: { legend: { position: 'right' }, tooltip: { callbacks: { label: (context) => { const value = context.raw as number; const total = this.filteredData.totalBookings; const percentage = ((value / total) * 100).toFixed(1); return `${context.label}: ${value} (${percentage}%)`; } } } } }
    });
  }

  private getTimeGroupedData(type: 'bookings' | 'revenue'): { labels: string[]; values: number[] } {
    const bookings = this.bookings;
    const shows = this.shows;
    const groupBy = type === 'bookings' ? this.bookingsChartType : this.revenueChartType;
    const result: { [key: string]: number } = {};
    const labels: string[] = [];
    const values: number[] = [];
    let startDate: Date;
    let endDate: Date = new Date();
    
    if (this.startDate && this.endDate) {
      startDate = new Date(this.startDate);
      endDate = new Date(this.endDate);
    } else {
      const range = this.getDateRangeFilter(this.timeRange);
      if (range) {
        startDate = new Date(range.start);
        endDate = new Date(range.end);
      } else {
        if (bookings.length > 0) {
          const firstBooking = new Date(bookings[bookings.length - 1].created_at);
          const lastBooking = new Date(bookings[0].created_at);
          startDate = firstBooking;
          endDate = lastBooking;
        } else {
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 1);
        }
      }
    }
    
    const current = new Date(startDate);
    
    while (current <= endDate) {
      let key: string;
      if (groupBy === 'day') {
        key = this.datePipe.transform(current, 'yyyy-MM-dd')!;
        labels.push(this.datePipe.transform(current, 'MMM d')!);
        current.setDate(current.getDate() + 1);
      } else if (groupBy === 'week') {
        const weekStart = new Date(current);
        weekStart.setDate(current.getDate() - current.getDay());
        key = `Week of ${this.datePipe.transform(weekStart, 'MMM d')!}`;
        labels.push(key);
        current.setDate(current.getDate() + 7);
      } else { // month
        const monthStart = new Date(current);
        key = this.datePipe.transform(monthStart, 'MMM yyyy')!;
        labels.push(key);
        current.setMonth(current.getMonth() + 1);
      }
      result[key] = 0;
    }
    
    bookings.forEach(booking => {
      const bookingDate = new Date(booking.created_at);
      let key: string;
      if (groupBy === 'day') {
        key = this.datePipe.transform(bookingDate, 'yyyy-MM-dd')!;
      } else if (groupBy === 'week') {
        const weekStart = new Date(bookingDate);
        weekStart.setDate(bookingDate.getDate() - bookingDate.getDay());
        key = `Week of ${this.datePipe.transform(weekStart, 'MMM d')!}`;
      } else { // month
        key = this.datePipe.transform(bookingDate, 'MMM yyyy')!;
      }
      if (result.hasOwnProperty(key)) {
        if (type === 'bookings') {
          result[key]++;
        } else { // revenue
          result[key] += booking.final_amount;
        }
      }
    });
    
    for (const key in result) {
      values.push(result[key]);
    }
    
    return { labels, values };
  }

  private getChartXAxisLabel(): string {
    switch (this.bookingsChartType) {
      case 'day': return 'Date';
      case 'week': return 'Week';
      case 'month': return 'Month';
      default: return 'Date';
    }
  }

  updateBookingsChart(): void {
    if (this.bookingsChart) {
      const data = this.getTimeGroupedData('bookings');
      this.bookingsChart.data.labels = data.labels;
      this.bookingsChart.data.datasets[0].data = data.values;
      this.bookingsChart.update();
    }
  }

  updateRevenueChart(): void {
    if (this.revenueChart) {
      const data = this.getTimeGroupedData('revenue');
      this.revenueChart.data.labels = data.labels;
      this.revenueChart.data.datasets[0].data = data.values;
      this.revenueChart.update();
    }
  }

  private getMovieRevenue(movieId: string): number {
    let revenue = 0;
    this.bookings.forEach(booking => {
      const show = this.shows.find(s => s._id === Number(booking.show_id));
      if (show && show.movie_id === movieId) {
        revenue += booking.final_amount;
      }
    });
    return revenue;
  }

  getComparisonText(metric: keyof DashboardData): string {
    const current = this.filteredData[metric];
    const previous = this.previousPeriodData[metric];
    if (previous === 0) {
      return 'No previous data available';
    }
    const currentNum = typeof current === 'number' ? current : 0;
    const previousNum = typeof previous === 'number' ? previous : 0;
    const difference = currentNum - previousNum;
    const percentage = previousNum !== 0 ? Math.abs(Math.round((difference / previousNum) * 100)) : 0;
    if (difference > 0) {
      return `↑ ${percentage}% from previous period`;
    } else if (difference < 0) {
      return `↓ ${percentage}% from previous period`;
    } else {
      return 'No change from previous period';
    }
  }

  getPercentage(value: number, total: number): string {
    if (total === 0) return '0';
    return ((value / total) * 100).toFixed(1);
  }

  getUserName(userId: string): string {
    const user = this.users.find(u => u._id === userId);
    return user ? user.name : 'Unknown User';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'MMM d, y') || '';
  }

  formatTime(timeString: string): string {
    const show = this.shows.find(s => s.show_datetime.includes(timeString));
    if (show) {
      const date = new Date(show.show_datetime);
      return this.datePipe.transform(date, 'shortTime') || '';
    }
    return '';
  }

  viewMovieDetails(movieId: string): void {
    console.log('View movie details:', movieId);
    alert(`Viewing details for movie ID: ${movieId}`);
  }

  viewBookingDetails(bookingId: string): void {
    console.log('View booking details:', bookingId);
    alert(`Viewing details for booking ID: ${bookingId}`);
  }

  exportPopularMovies(): void {
    console.log('Exporting popular movies data');
    alert('Popular movies data exported (simulated)');
  }

  exportRecentBookings(): void {
    console.log('Exporting recent bookings data');
    alert('Recent bookings data exported (simulated)');
  }
} 