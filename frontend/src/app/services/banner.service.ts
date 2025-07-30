// frontend/src/app/core/services/banner.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Define the interface for a banner, matching the backend's model
export interface Banner {
    _id: string; // The unique identifier from MongoDB
    title: string;
    target_url: string; // URL the banner links to
    image_url: string; // URL for the banner image itself
    position: number;
    is_active: boolean;
    start_date: string; // Date string
    end_date: string; // Date string
    created_by: string; // Reference to the Admin User who created it
    created_at: string; // Date string
}

// Define the payload interface for creating or updating a banner
export interface BannerPayload {
    title: string;
    target_url: string;
    image_url: string;
    position: number;
    is_active: boolean;
    start_date: string;
    end_date: string;
    created_by?: string; // Optional for payload, as it's set on the backend
}

@Injectable({
    providedIn: 'root'
})
export class BannerService {
    private apiUrl = environment.apiUrl + '/banners'; // Points to your backend /api/banners

    constructor(private http: HttpClient) { }

    /**
     * @description Fetches all active banners. This is a public endpoint.
     * @returns An Observable of an array of Banner objects.
     */
    getAllBanners(): Observable<Banner[]> {
        return this.http.get<Banner[]>(this.apiUrl); // GET /api/banners
    }

    /**
     * @description Creates a new banner. This is an admin-only endpoint.
     * @param bannerData The data for the new banner.
     * @returns An Observable of the created Banner object.
     */
    createBanner(bannerData: BannerPayload): Observable<Banner> {
        return this.http.post<Banner>(this.apiUrl, bannerData); // POST /api/banners
    }

    /**
     * @description Updates an existing banner. This is an admin-only endpoint.
     * @param id The ID of the banner to update.
     * @param bannerData The partial data to update the banner with.
     * @returns An Observable of the updated Banner object.
     */
    updateBanner(id: string, bannerData: Partial<BannerPayload>): Observable<Banner> {
        return this.http.put<Banner>(`${this.apiUrl}/${id}`, bannerData); // PUT /api/banners/:id
    }

    /**
     * @description Deletes a banner. This is an admin-only endpoint.
     * @param id The ID of the banner to delete.
     * @returns An Observable with a success message.
     */
    deleteBanner(id: string): Observable<{ msg: string }> {
        return this.http.delete<{ msg: string }>(`${this.apiUrl}/${id}`); // DELETE /api/banners/:id
    }
}