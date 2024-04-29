import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FavClinicService {
  private favClinicsSubject = new BehaviorSubject<any[]>([]);
  favClinics$ = this.favClinicsSubject.asObservable();

  updateFavClinics(favClinics: any[]): void {
    this.favClinicsSubject.next(favClinics);
  }
}