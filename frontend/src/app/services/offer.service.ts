// frontend/src/app/core/services/offer.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Define the interface for an offer, matching the backend's model
export interface Offer {
    _id: string; // The unique identifier from MongoDB
    code: string;
    title: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_amount: number;
    max_discount: number | null; // Can be null
    valid_from: string; // Date string
    valid_to: string; // Date string
    is_active: boolean;
    created_at: string; // Date string
}

// Define the payload interface for creating or updating an offer
export interface OfferPayload {
    code: string;
    title: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_amount: number;
    max_discount?: number | null; // Optional for payload
    valid_from: string;
    valid_to: string;
    is_active: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class OfferService {
    private apiUrl = environment.apiUrl + '/offers'; // Points to your backend /api/offers

    constructor(private http: HttpClient) { }

    // GET /api/offers - Public route to get all offers
    getAllOffers(): Observable<Offer[]> {
        return this.http.get<Offer[]>(this.apiUrl);
    }

    // POST /api/offers - Admin-only route to create a new offer
    createOffer(offerData: OfferPayload): Observable<Offer> {
        return this.http.post<Offer>(this.apiUrl, offerData);
    }

    // PUT /api/offers/:id - Admin-only route to update an existing offer
    updateOffer(id: string, offerData: Partial<OfferPayload>): Observable<Offer> {
        return this.http.put<Offer>(`${this.apiUrl}/${id}`, offerData);
    }

    // DELETE /api/offers/:id - Admin-only route to delete an offer
    deleteOffer(id: string): Observable<{ msg: string }> {
        return this.http.delete<{ msg: string }>(`${this.apiUrl}/${id}`);
    }
}