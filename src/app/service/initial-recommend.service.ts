import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InitialRecommendService {
  private matchedClinicsSubject = new BehaviorSubject<any[]>([]);
  matchedClinics$: Observable<any[]> =
    this.matchedClinicsSubject.asObservable();

  setMatchedClinics(clinics: any[]): void {
    this.matchedClinicsSubject.next(clinics);
  }

  private reloadAllClinics: boolean = false;

  setReloadAllClinics(reload: boolean) {
    this.reloadAllClinics = reload;
  }

  shouldReloadAllClinics(): boolean {
    return this.reloadAllClinics;
  }

  constructor() {}
}
