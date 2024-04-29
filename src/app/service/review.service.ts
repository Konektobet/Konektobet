import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  constructor(private http: HttpClient) {}

  getReviewsForClinic(clinicId: string): Observable<any> {
    // Adjust the URL to match your backend API endpoint
    const url = `/api/reviews?clinicId=${clinicId}`;
    return this.http.get<any>(url);
  }
}
