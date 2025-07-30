// frontend/src/app/User/components/offers-page/offers-page.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { LayoutComponent } from '../../../Core/layout/layout.component';
import { RouterLink } from '@angular/router';

// Import the new service and existing Offer interface
import { OfferPageService } from '../../../services/offer-page.service';
import { Offer } from '../../../services/offer.service';

@Component({
  selector: 'app-offers',
  templateUrl: './offers-page.component.html',
  styleUrls: ['./offers-page.component.css'],
  providers: [DatePipe, OfferPageService], // Provide the new service here
  imports:[LayoutComponent, HttpClientModule, RouterLink, CommonModule]
})
export class OffersPageComponent implements OnInit {
  offers: Offer[] = [];
  isLoading: boolean = true;
  showNotification: boolean = false;
  notificationMessage: string = '';

  constructor(private offerPageService: OfferPageService, private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.fetchOffers();
  }

  fetchOffers(): void {
    this.offerPageService.getAllOffers()
      .subscribe({
        next: (data) => {
          this.offers = data.filter(offer => offer.is_active && new Date(offer.valid_to) > new Date());
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching offers:', err);
          this.isLoading = false;
        }
      });
  }

  getOfferIcon(offer: Offer): string {
    let icon = '💸';
    
    if (offer.title.toLowerCase().includes('welcome')) {
      icon = '👋';
    } else if (offer.title.toLowerCase().includes('credit')) {
      icon = '💳';
    } else if (offer.title.toLowerCase().includes('first')) {
      icon = '👤';
    } else if (offer.title.toLowerCase().includes('weekend')) {
      icon = '🎉';
    }
    
    return icon;
  }

  getOfferIconClass(offer: Offer): string {
    let bgClass = 'bg-green-100';
    
    if (offer.title.toLowerCase().includes('welcome')) {
      bgClass = 'bg-blue-100';
    } else if (offer.title.toLowerCase().includes('credit')) {
      bgClass = 'bg-purple-100';
    } else if (offer.title.toLowerCase().includes('first')) {
      bgClass = 'bg-orange-100';
    } else if (offer.title.toLowerCase().includes('weekend')) {
      bgClass = 'bg-yellow-100';
    }
    
    return bgClass;
  }

  getOfferIconTextClass(offer: Offer): string {
    let textClass = 'text-green-600';
    
    if (offer.title.toLowerCase().includes('welcome')) {
      textClass = 'text-blue-600';
    } else if (offer.title.toLowerCase().includes('credit')) {
      textClass = 'text-purple-600';
    } else if (offer.title.toLowerCase().includes('first')) {
      textClass = 'text-orange-600';
    } else if (offer.title.toLowerCase().includes('weekend')) {
      textClass = 'text-yellow-600';
    }
    
    return textClass;
  }

  getOfferDescription(offer: Offer): string {
    if (offer.discount_type === 'fixed') {
      return `Get flat ₹${offer.discount_value} off on your booking`;
    } else if (offer.discount_type === 'percentage') {
      return `Get ${offer.discount_value}% off on your booking`;
    }
    return 'Special discount on your booking';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return this.datePipe.transform(dateString, 'mediumDate') || 'N/A';
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.showNotificationMessage(`Copied: ${text}`);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      this.showNotificationMessage('Failed to copy code');
    });
  }

  showNotificationMessage(message: string): void {
    this.notificationMessage = message;
    this.showNotification = true;
    
    setTimeout(() => {
      this.showNotification = false;
    }, 3000);
  }
}