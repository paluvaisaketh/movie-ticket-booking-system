// app/Admin/reports/reports.component.ts

import { Component, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { Chart, registerables, ScaleOptionsByType } from 'chart.js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SideNavbarComponent } from '../components/side-navbar/side-navbar.component';
import { ReportsService, ReportsData as BackendReportsData } from '../../services/reports.service';
// import { environment } from '../../../environments/environment';

Chart.register(...registerables);

// --- All Interfaces defined directly in this file as requested ---

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
}

interface Screen {
  _id: string;
  name: string;
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

interface Offer {
  _id: string;
  code: string;
  title: string;
  discount_type: string;
  discount_value: number;
  min_amount: number;
  max_discount: number | null;
  valid_from: string;
  valid_to: string;
  created_at: string;
}

interface Booking {
  _id: string;
  user_id: string;
  show_id: number;
  seats_booked: {
    seat_number: string;
    price_at_booking: number;
    seat_type: string;
  }[];
  base_amount: number;
  convenience_fee: number;
  discount_applied: number;
  final_amount: number;
  status: string;
  created_at: string;
}

interface BookingOffer {
  _id: string;
  booking_id: string;
  offer_id: string;
  discount_amount: number;
  created_at: string;
}

interface Payment {
  _id: string;
  booking_id: string;
  original_amount: number;
  final_amount: number;
  payment_method: string;
  receipt_number: string;
  status: string;
  created_at: string;
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

interface TimePeriod {
  value: string;
  label: string;
  days: number;
}

interface ReportData {
  totalBookings: number;
  totalRevenue: number;
  avgTicketsPerBooking: number;
  occupancyRate: number;
  bookingChangePercent: number;
  revenueChangePercent: number;
  avgTicketChangePercent: number;
  occupancyChangePercent: number;
  topMovies: {
    id: string;
    title: string;
    poster: string;
    bookingsCount: number;
    bookingsPercent: number;
    revenue: number;
    revenuePercent: number;
    occupancyRate: number;
    avgRating: number;
    genre: string[];
  }[];
  topTheaters: {
    id: string;
    name: string;
    location: string;
    bookingsCount: number;
    revenue: number;
    revenuePercent: number;
    occupancyRate: number;
    screensCount: number;
    showsCount: number;
  }[];
  topUsers: {
    id: string;
    name: string;
    email: string;
    bookingsCount: number;
    totalSpent: number;
  }[];
  topOffers: {
    id: string;
    code: string;
    title: string;
    usageCount: number;
    totalDiscount: number;
  }[];
  maxOfferUsage: number;
  paymentMethods: {
    method: string;
    count: number;
    amount: number;
  }[];
  showTimes: {
    time: string;
    count: number;
    revenue: number;
  }[];
  userAcquisition: {
    period: string;
    count: number;
  }[];
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, SideNavbarComponent, HttpClientModule],
  providers: [ReportsService]
})
export class ReportsComponent implements OnInit {
  loading: boolean = true;
  error: string | null = null;
  showProfileDropdown: boolean = false;
  showTimePeriodDropdown: boolean = false;
  public Math = Math;
  fromDate: string = '';
  toDate: string = '';

  timePeriods: TimePeriod[] = [
    { value: '7d', label: 'Last 7 Days', days: 7 },
    { value: '30d', label: 'Last 30 Days', days: 30 },
    { value: '90d', label: 'Last 90 Days', days: 90 },
    { value: '12m', label: 'Last 12 Months', days: 365 },
    { value: 'custom', label: 'Custom Range', days: 0 }
  ];

  selectedTimePeriod: TimePeriod = this.timePeriods[1];

  reportData: ReportData = {
    totalBookings: 0,
    totalRevenue: 0,
    avgTicketsPerBooking: 0,
    occupancyRate: 0,
    bookingChangePercent: 0,
    revenueChangePercent: 0,
    avgTicketChangePercent: 0,
    occupancyChangePercent: 0,
    topMovies: [],
    topTheaters: [],
    topUsers: [],
    topOffers: [],
    maxOfferUsage: 0,
    paymentMethods: [],
    showTimes: [],
    userAcquisition: []
  };

  private charts: { [key: string]: Chart } = {};
  private allData: BackendReportsData | null = null;

  constructor(private reportsService: ReportsService) {}

  ngOnInit(): void {
    this.updateDateRange();
    this.fetchData();
  }

  toggleTimePeriodDropdown(): void {
    this.showTimePeriodDropdown = !this.showTimePeriodDropdown;
  }

  selectTimePeriod(period: TimePeriod): void {
    this.selectedTimePeriod = period;
    this.showTimePeriodDropdown = false;
    this.updateDateRange();
    this.processData();
  }

  updateDateRange(): void {
    const today = new Date();
    const fromDate = new Date();
    if (this.selectedTimePeriod.value !== 'custom') {
      fromDate.setDate(today.getDate() - this.selectedTimePeriod.days);
      this.fromDate = this.formatDate(fromDate);
      this.toDate = this.formatDate(today);
    }
  }

  resetDateRange(): void {
    this.selectedTimePeriod = this.timePeriods[1];
    this.updateDateRange();
    this.processData();
  }

  fetchData(): void {
    this.loading = true;
    this.reportsService.getReportsData().subscribe({
      next: (data: BackendReportsData) => {
        this.allData = data;
        this.processData();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load report data from the backend. Please check the server logs.';
        this.loading = false;
        console.error('Error fetching report data:', err);
      }
    });
  }

  processData(): void {
    if (!this.allData) {
      return;
    }

    const { users, movies, shows, bookings, offers, theatres, payments, bookingOffers } = this.allData;

    const filteredBookings = this.filterBookingsByDate(bookings);
    const previousPeriodBookings = this.getPreviousPeriodBookings(bookings);

    this.reportData.totalBookings = filteredBookings.length;
    this.reportData.totalRevenue = filteredBookings.reduce((sum, booking) => sum + booking.final_amount, 0);

    const prevTotalBookings = previousPeriodBookings.length;
    const prevTotalRevenue = previousPeriodBookings.reduce((sum, booking) => sum + booking.final_amount, 0);

    this.reportData.bookingChangePercent = prevTotalBookings > 0
      ? (this.reportData.totalBookings - prevTotalBookings) / prevTotalBookings
      : 0;

    this.reportData.revenueChangePercent = prevTotalRevenue > 0
      ? (this.reportData.totalRevenue - prevTotalRevenue) / prevTotalRevenue
      : 0;

    const totalTickets = filteredBookings.reduce((sum, booking) => sum + booking.seats_booked.length, 0);
    const prevTotalTickets = previousPeriodBookings.reduce((sum, booking) => sum + booking.seats_booked.length, 0);

    this.reportData.avgTicketsPerBooking = this.reportData.totalBookings > 0
      ? totalTickets / this.reportData.totalBookings
      : 0;

    const prevAvgTickets = prevTotalBookings > 0
      ? prevTotalTickets / prevTotalBookings
      : 0;

    this.reportData.avgTicketChangePercent = prevAvgTickets > 0
      ? (this.reportData.avgTicketsPerBooking - prevAvgTickets) / prevAvgTickets
      : 0;

    const totalPossibleSeats = shows.length * 11 * 18;
    this.reportData.occupancyRate = totalPossibleSeats > 0
      ? totalTickets / totalPossibleSeats
      : 0;

    const prevTotalPossibleSeats = shows.length * 11 * 18;
    const prevOccupancyRate = prevTotalPossibleSeats > 0
      ? prevTotalTickets / prevTotalPossibleSeats
      : 0;

    this.reportData.occupancyChangePercent = prevOccupancyRate > 0
      ? (this.reportData.occupancyRate - prevOccupancyRate) / prevOccupancyRate
      : 0;

    const movieStats = new Map<string, { bookingsCount: number; revenue: number }>();
    filteredBookings.forEach(booking => {
      const show = shows.find(s => s._id === booking.show_id);
      if (show) {
        if (!movieStats.has(show.movie_id)) {
          movieStats.set(show.movie_id, { bookingsCount: 0, revenue: 0 });
        }
        const stats = movieStats.get(show.movie_id)!;
        stats.bookingsCount += booking.seats_booked.length;
        stats.revenue += booking.final_amount;
      }
    });

    this.reportData.topMovies = Array.from(movieStats.entries()).map(([movieId, stats]) => {
      const movie = movies.find(m => m._id === movieId);
      if (!movie) return null;
      const movieShowsCount = shows.filter(s => s.movie_id === movieId).length;
      return {
        id: movieId,
        title: movie.title,
        poster: movie.poster,
        bookingsCount: stats.bookingsCount,
        bookingsPercent: totalTickets > 0 ? stats.bookingsCount / totalTickets : 0,
        revenue: stats.revenue,
        revenuePercent: this.reportData.totalRevenue > 0 ? stats.revenue / this.reportData.totalRevenue : 0,
        occupancyRate: movieShowsCount > 0 ? (stats.bookingsCount / (movieShowsCount * 198)) : 0,
        genre: movie.genre,
        avgRating: Math.random() * 2 + 3
      };
    }).filter(m => m !== null) as any;
    this.reportData.topMovies = this.reportData.topMovies.sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    const theaterStats = new Map<string, { bookingsCount: number, revenue: number, screensCount: number, showsCount: number }>();
    theatres.forEach(theater => {
        const theaterShows = shows.filter(show => {
            const screen = theatres.find(t => t._id === theater._id)?.screens?.find(s => s._id === show.screen_id);
            return !!screen;
        });
        const theaterBookings = filteredBookings.filter(booking => theaterShows.some(show => show._id === booking.show_id));
        const totalTheaterTickets = theaterBookings.reduce((sum, booking) => sum + booking.seats_booked.length, 0);

        theaterStats.set(theater._id, {
            bookingsCount: totalTheaterTickets,
            revenue: theaterBookings.reduce((sum, booking) => sum + booking.final_amount, 0),
            screensCount: theater.screens?.length || 0,
            showsCount: theaterShows.length
        });
    });

    this.reportData.topTheaters = Array.from(theaterStats.entries()).map(([theaterId, stats]) => {
        const theater = theatres.find(t => t._id === theaterId);
        if (!theater) return null;
        const totalTheaterSeats = stats.showsCount * 198;
        return {
            id: theaterId,
            name: theater.name,
            location: theater.location,
            bookingsCount: stats.bookingsCount,
            revenue: stats.revenue,
            revenuePercent: this.reportData.totalRevenue > 0 ? stats.revenue / this.reportData.totalRevenue : 0,
            occupancyRate: totalTheaterSeats > 0 ? stats.bookingsCount / totalTheaterSeats : 0,
            screensCount: stats.screensCount,
            showsCount: stats.showsCount
        };
    }).filter(t => t !== null) as any;
    this.reportData.topTheaters = this.reportData.topTheaters.sort((a, b) => b.revenue - a.revenue);

    const userStats = new Map<string, { bookingsCount: number, totalSpent: number }>();
    filteredBookings.forEach(booking => {
      const user = users.find(u => u._id === booking.user_id);
      if (user && user.role === 'user') {
        if (!userStats.has(user._id)) {
          userStats.set(user._id, { bookingsCount: 0, totalSpent: 0 });
        }
        const stats = userStats.get(user._id)!;
        stats.bookingsCount++;
        stats.totalSpent += booking.final_amount;
      }
    });

    this.reportData.topUsers = Array.from(userStats.entries()).map(([userId, stats]) => {
      const user = users.find(u => u._id === userId)!;
      return {
        id: userId,
        name: user.name || 'N/A',
        email: user.email || 'N/A',
        bookingsCount: stats.bookingsCount,
        totalSpent: stats.totalSpent
      };
    }).sort((a, b) => b.bookingsCount - a.bookingsCount).slice(0, 5);

    const offerStats = new Map<string, { usageCount: number, totalDiscount: number }>();
    bookingOffers.forEach(bookingOffer => {
      const booking = filteredBookings.find(b => b._id === bookingOffer.booking_id);
      if (booking) {
        if (!offerStats.has(bookingOffer.offer_id)) {
          offerStats.set(bookingOffer.offer_id, { usageCount: 0, totalDiscount: 0 });
        }
        const stats = offerStats.get(bookingOffer.offer_id)!;
        stats.usageCount++;
        stats.totalDiscount += bookingOffer.discount_amount;
      }
    });

    this.reportData.topOffers = Array.from(offerStats.entries()).map(([offerId, stats]) => {
      const offer = offers.find(o => o._id === offerId)!;
      return {
        id: offerId,
        code: offer.code,
        title: offer.title,
        usageCount: stats.usageCount,
        totalDiscount: stats.totalDiscount
      };
    }).sort((a, b) => b.usageCount - a.usageCount);

    this.reportData.maxOfferUsage = this.reportData.topOffers.length > 0
      ? Math.max(...this.reportData.topOffers.map(o => o.usageCount))
      : 1;

    const paymentMethods = new Map<string, { count: number, amount: number }>();
    payments.forEach(payment => {
      const booking = filteredBookings.find(b => b._id === payment.booking_id);
      if (booking) {
        if (!paymentMethods.has(payment.payment_method)) {
          paymentMethods.set(payment.payment_method, { count: 0, amount: 0 });
        }
        const stats = paymentMethods.get(payment.payment_method)!;
        stats.count++;
        stats.amount += payment.final_amount;
      }
    });

    this.reportData.paymentMethods = Array.from(paymentMethods.entries()).map(([method, stats]) => ({
      method,
      count: stats.count,
      amount: stats.amount
    }));

    const showTimes = new Map<string, { count: number, revenue: number }>();
    filteredBookings.forEach(booking => {
      const show = shows.find(s => s._id === booking.show_id);
      if (show) {
        const showHour = new Date(show.show_datetime).getHours();
        let timeBucket = '';

        if (showHour < 12) timeBucket = 'Morning (6AM-12PM)';
        else if (showHour < 17) timeBucket = 'Afternoon (12PM-5PM)';
        else if (showHour < 22) timeBucket = 'Evening (5PM-10PM)';
        else timeBucket = 'Late Night (10PM-6AM)';

        if (!showTimes.has(timeBucket)) {
          showTimes.set(timeBucket, { count: 0, revenue: 0 });
        }
        const stats = showTimes.get(timeBucket)!;
        stats.count++;
        stats.revenue += booking.final_amount;
      }
    });

    this.reportData.showTimes = Array.from(showTimes.entries()).map(([time, stats]) => ({
      time,
      count: stats.count,
      revenue: stats.revenue
    }));

    const userAcquisition = new Map<string, number>();
    const periodDays = this.selectedTimePeriod.days || 30;
    const periodStart = new Date(this.fromDate);

    for (let i = 0; i < periodDays; i += Math.max(1, Math.floor(periodDays / 7))) {
      const date = new Date(periodStart);
      date.setDate(periodStart.getDate() + i);
      const dateStr = this.formatDate(date, 'MMM dd');

      const usersInPeriod = users.filter(user => {
        const userDate = new Date(user.created_at);
        return userDate >= periodStart && userDate <= date;
      });

      userAcquisition.set(dateStr, usersInPeriod.length);
    }

    this.reportData.userAcquisition = Array.from(userAcquisition.entries()).map(([period, count]) => ({
      period,
      count
    }));

    setTimeout(() => {
      this.initBookingsChart(bookings, filteredBookings);
      this.initRevenueChart(bookings, filteredBookings);
      this.initPaymentMethodsChart();
      this.initShowTimeChart();
      this.initUserAcquisitionChart();
    }, 100);
  }

  filterBookingsByDate(bookings: Booking[]): Booking[] {
    if (!this.fromDate || !this.toDate) return bookings;
    const from = new Date(this.fromDate);
    const to = new Date(this.toDate);
    to.setDate(to.getDate() + 1);
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.created_at);
      return bookingDate >= from && bookingDate <= to;
    });
  }

  getPreviousPeriodBookings(bookings: Booking[]): Booking[] {
    if (!this.fromDate || !this.toDate || this.selectedTimePeriod.value === 'custom') return [];
    const from = new Date(this.fromDate);
    const to = new Date(this.toDate);
    const periodDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    const prevFrom = new Date(from);
    const prevTo = new Date(to);
    prevFrom.setDate(from.getDate() - periodDays);
    prevTo.setDate(to.getDate() - periodDays);
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.created_at);
      return bookingDate >= prevFrom && bookingDate <= prevTo;
    });
  }

  initBookingsChart(allBookings: Booking[], filteredBookings: Booking[]): void {
    const bookingsByDate: {[key: string]: number} = {};
    filteredBookings.forEach(booking => {
      const date = booking.created_at.split('T')[0];
      bookingsByDate[date] = (bookingsByDate[date] || 0) + 1;
    });
    const dates = Object.keys(bookingsByDate).sort();
    const counts = dates.map(date => bookingsByDate[date]);
    const ctx = document.getElementById('bookingsChart') as HTMLCanvasElement;
    if (this.charts['bookingsChart']) {
      this.charts['bookingsChart'].destroy();
    }
    this.charts['bookingsChart'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: 'Bookings',
          data: counts,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1,
          fill: true,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#fff',
          pointHoverRadius: 5,
          pointHoverBackgroundColor: 'rgb(59, 130, 246)',
          pointHoverBorderColor: '#fff',
          pointHitRadius: 10,
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Bookings'
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date'
            },
            grid: {
              display: false
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'nearest'
        }
      }
    });
  }

  initRevenueChart(allBookings: Booking[], filteredBookings: Booking[]): void {
    const revenueByDate: {[key: string]: number} = {};
    filteredBookings.forEach(booking => {
      const date = booking.created_at.split('T')[0];
      revenueByDate[date] = (revenueByDate[date] || 0) + booking.final_amount;
    });
    const dates = Object.keys(revenueByDate).sort();
    const amounts = dates.map(date => revenueByDate[date]);
    const ctx = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (this.charts['revenueChart']) {
      this.charts['revenueChart'].destroy();
    }
    this.charts['revenueChart'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dates,
        datasets: [{
          label: 'Revenue',
          data: amounts,
          backgroundColor: 'rgba(124, 58, 237, 0.7)',
          borderColor: 'rgba(124, 58, 237, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                  return '₹' + (context.raw as number).toLocaleString();
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Revenue (₹)'
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              callback: function(value) {
                return '₹' + (value as number).toLocaleString();
              }
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date'
            },
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  initPaymentMethodsChart(): void {
    const ctx = document.getElementById('paymentMethodsChart') as HTMLCanvasElement;
    if (this.charts['paymentMethodsChart']) {
      this.charts['paymentMethodsChart'].destroy();
    }
    const backgroundColors = [
      'rgba(255, 99, 132, 0.7)',
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 206, 86, 0.7)',
      'rgba(75, 192, 192, 0.7)',
      'rgba(153, 102, 255, 0.7)'
    ];
    this.charts['paymentMethodsChart'] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.reportData.paymentMethods.map(p => p.method.toUpperCase()),
        datasets: [{
          data: this.reportData.paymentMethods.map(p => p.count),
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(c => c.replace('0.7', '1')),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw as number;
                const total = (context.dataset.data as number[]).reduce((a: number, b: number) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  initShowTimeChart(): void {
    const ctx = document.getElementById('showTimeChart') as HTMLCanvasElement;
    if (this.charts['showTimeChart']) {
      this.charts['showTimeChart'].destroy();
    }
    this.charts['showTimeChart'] = new Chart(ctx, {
      type: 'polarArea',
      data: {
        labels: this.reportData.showTimes.map(s => s.time),
        datasets: [{
          data: this.reportData.showTimes.map(s => s.count),
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw as number;
                const total = (context.dataset.data as number[]).reduce((a: number, b: number) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} bookings (${percentage}%)`;
              }
            }
          }
        },
        scales: {
          r: {
            pointLabels: {
              display: false
            }
          } as ScaleOptionsByType<'radialLinear'>
        }
      }
    });
  }

  initUserAcquisitionChart(): void {
    const ctx = document.getElementById('userAcquisitionChart') as HTMLCanvasElement;
    if (this.charts['userAcquisitionChart']) {
      this.charts['userAcquisitionChart'].destroy();
    }
    this.charts['userAcquisitionChart'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.reportData.userAcquisition.map(u => u.period),
        datasets: [{
          label: 'New Users',
          data: this.reportData.userAcquisition.map(u => u.count),
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'New Users'
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date'
            },
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  generateReports(): void {
    this.selectedTimePeriod = this.timePeriods.find(p => p.value === 'custom') || this.timePeriods[1];
    this.processData();
  }

  exportAllData(): void {
    alert('Exporting all report data as CSV...');
    console.log('All report data:', this.reportData);
  }

  exportChartData(chartType: string): void {
    alert(`Exporting ${chartType} chart data as CSV...`);
    console.log(`${chartType} chart data:`, this.charts[chartType + 'Chart']?.data);
  }

  exportMoviePerformance(): void {
    alert('Exporting movie performance data as CSV...');
    console.log('Movie performance data:', this.reportData.topMovies);
  }

  exportCinemaPerformance(): void {
    alert('Exporting cinema performance data as CSV...');
    console.log('Cinema performance data:', this.reportData.topTheaters);
  }

  exportUserAnalytics(): void {
    alert('Exporting user analytics data as CSV...');
    console.log('User analytics data:', {
      topUsers: this.reportData.topUsers,
      userAcquisition: this.reportData.userAcquisition,
      topOffers: this.reportData.topOffers
    });
  }

  toggleProfileDropdown(): void {
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  logout(): void {
    alert('Logging out...');
    this.showProfileDropdown = false;
  }

  private formatDate(date: Date, format: string = 'yyyy-MM-dd'): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    if (format === 'MMM dd') {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[date.getMonth()]} ${day}`;
    }

    return `${year}-${month}-${day}`;
  }
}