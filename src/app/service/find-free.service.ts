import { ChangeDetectorRef, Component, OnInit, ViewChild, Injectable } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { MatStepper } from '@angular/material/stepper';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { InitialRecommendService } from 'src/app/service/initial-recommend.service';
import { SupabaseService } from './supabase.service';

interface UserPreferences {
  fService: string;
  // fHealthcare: string;
  fSchedule: string;
  // Add other properties as needed
}

interface Clinic {
  matchCount: any;
  cService: string;
  // cHealthcare: string;
  cSchedule: string;
  similarity?: number;
  rank?: number;
  // Add other properties as needed
}

@Injectable({
  providedIn: 'root'
})
export class FindFreeService {
  clinics: any[] = [];
  clinicFeatures: Clinic[] = [];
  lastTwoClinics: any[] = [];
  displayedClinics: any[] = [];

  serviceControl = new FormControl('');
  scheduleControl = new FormControl('');
  healthcareControl = new FormControl('');

  isDropdownActive = false;

  panelOpenState = false;

  services: string[] = [
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
  filteredServices!: Observable<string[]>;
  selectedServices: string[] = [];
  
  // healthcares: string[] = [
  //   'CBC',
  //   'Blood Chemistry',
  //   'PCR Test',
  //   'Treatment',
  //   'Vaccination',
  //   'Surgery',
  //   'Teeth Cleaning',
  //   'Lab Tests',
  //   'Ultrasound',
  //   'Digital Xray',
  // ];
  // filteredHealthcares!: Observable<string[]>;
  // selectedHealthcares: string[] = [];

  schedules: string[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  filteredSchedules!: Observable<string[]>;
  selectedSchedules: string[] = [];

  isLinear = false;
  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  thirdFormGroup!: FormGroup;

  loading = false;
  clinicsFound = false;

  dataSource = new MatTableDataSource<any>();

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private supabaseService: SupabaseService,
    private http: HttpClient,
    // private cdr: ChangeDetectorRef,
    private initialRecommendService: InitialRecommendService,
  ) {}

    calculateSimilarity(
    clinic: Clinic,
    userPreferences: UserPreferences
  ): number {
    const serviceIntersection = this.calculateIntersection(
      clinic.cService,
      userPreferences.fService
    );
    // const healthcareIntersection = this.calculateIntersection(
    //   clinic.cHealthcare,
    //   userPreferences.fHealthcare
    // );
    const scheduleIntersection = this.calculateIntersection(
      clinic.cSchedule,
      userPreferences.fSchedule
    );

    const serviceWeight = 2;
    // const healthcareWeight = 2;
    const scheduleWeight =1;
    const rankWeight = 3; // Adjust the weight for ranking

    // Check for undefined values before using them in calculations
    const clinicRank = clinic.rank !== undefined ? clinic.rank : 0;
    const clinicSimilarity =
      clinic.similarity !== undefined ? clinic.similarity : 0;

      const weightedSimilarity =
      (serviceIntersection * serviceWeight +
        scheduleIntersection * scheduleWeight +
        // healthcareIntersection * healthcareWeight +
        clinicRank * rankWeight) /
      (serviceWeight + scheduleWeight + rankWeight);

    return weightedSimilarity;
}

  calculateIntersection(str1: string, str2: string): number {
    const set1 = new Set(str1.split(', '));
    const set2 = new Set(str2.split(', '));

    const intersection = new Set([...set1].filter((value) => set2.has(value)));

    return intersection.size;
  }

  countMatches(clinic: Clinic, userPreferences: UserPreferences): number {
    let matchCount = 0;
  
    // Ensure values are defined before splitting
    const services = clinic.cService.split(', ');
    // const healthcares = clinic.cHealthcare.split(', ');
    const schedules = clinic.cSchedule.split(', ');
  
     // Count matches for services
    // matchCount += this.selectedServices.some(service => services.includes(service)) ? 1 : 0;

    // Count matches for schedules
    // matchCount += healthcares.some(healthcare => userPreferences.fHealthcare.includes(healthcare)) ? 1 : 0;

    // Count matches for schedules
    // matchCount += this.selectedSchedules.some(schedule => schedules.includes(schedule)) ? 1 : 0;

      // Count matches for services
    matchCount += services.filter((service) =>
      userPreferences.fService.includes(service)
    ).length;

    // Count matches for schedules
    matchCount += schedules.filter((schedule) =>
      userPreferences.fSchedule.includes(schedule)
    ).length;

    return matchCount;
  }

    matchClinicsContentBased(userPreferences: UserPreferences): Clinic[] {
    const matchedClinics: Clinic[] = [];
  
    this.clinicFeatures.forEach((clinic, index) => {
      const matchCount = this.countMatches(clinic, userPreferences);
      if (matchCount > 0) {
        matchedClinics.push({ ...clinic, matchCount, rank: index + 1 });
      }
    });
  
    // Sort clinics based on the number of matches in descending order
    matchedClinics.sort((a, b) => b.matchCount - a.matchCount);
  
    // Assign ranks based on the sorted order
    matchedClinics.forEach((clinic, index) => {
      clinic.rank = index + 1;
    });
  
    return matchedClinics;
  }

  recommendClinics(matchedClinics: Clinic[]): Clinic[] {
    const recommendedClinics = this.clinicFeatures
      .filter(
        (clinic) =>
          !matchedClinics.some(
            (matchedClinic) => matchedClinic.cService === clinic.cService 
            // && matchedClinic.cHealthcare === clinic.cHealthcare
          )
      )
      .slice(0, 2); // Limit the recommended clinics to at most three

    return recommendedClinics;
  }
}
