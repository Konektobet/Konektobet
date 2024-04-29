// src/app/api.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'http://localhost:5000/api/recommendations'; // Replace with your Flask API URL

  constructor(private http: HttpClient) {}

  findClinics(preferences: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/find-clinics`, preferences);
  }

  getMatchedClinics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/matched-clinics`);
  }

  getRecommendedClinics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/recommended-clinics`);
  }
}
