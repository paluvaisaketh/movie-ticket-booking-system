// frontend/src/app/services/offer-page.service.ts
import { Injectable } from '@angular/core';
import { Offer, OfferService } from '../services/offer.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OfferPageService {

  constructor(private offerService: OfferService) { }

  getAllOffers(): Observable<Offer[]> {
    // This is the public endpoint, so no authentication is needed here.
    return this.offerService.getAllOffers();
  }
}