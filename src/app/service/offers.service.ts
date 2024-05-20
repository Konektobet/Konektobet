import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OffersService {

  constructor() { }

  private services: string[] = [
    'Confinement',
    'Boarding',
    'Grooming',
    'Pet Supply',
    'Home Service',
    'Deworming',
    'CBC',
    'Blood Chemistry',
    'PCR Test',
    'Treatment',
    'Vaccination',
    'Surgery',
    'Teeth Cleaning',
    'Lab Tests',
    'Ultrasound',
    'Digital Xray',
  ];

  private schedules: string[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  getServices(): string[] {
    return this.services;
  }

  getSchedules(): string[] {
    return this.schedules;
  }
}
