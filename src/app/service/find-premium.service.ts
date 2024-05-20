import { ChangeDetectorRef, Component, Injectable, OnInit, ViewChild } from '@angular/core';
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
// import { ring } from 'ldrs';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { InitialRecommendService } from 'src/app/service/initial-recommend.service';
import { GeolocationService } from 'src/app/service/geolocation.service';
import { SupabaseService } from './supabase.service';

interface premiumUserPreferences {
  fService: string;
  // fHealthcare: string;
  fSchedule: string;
  fCoordinates: string;
  // Add other properties as needed
}

interface Clinic {
  distance: number;
  matchCount: any;
  cService: string;
  // cHealthcare: string;
  cSchedule: string;
  similarity?: number;
  rank?: number;
  cLatitude: number;
  cLongitude: number;
  cName: string;
  cAddress: string;
  profile: any;
  // Add other properties as needed
}

@Injectable({
  providedIn: 'root'
})
export class FindPremiumService {
  clinics: any[] = [];
  clinicFeatures: Clinic[] = [];
  lastTwoClinics: any[] = [];
  displayedClinics: any[] = [];
  recommendedClinics: any[] = [];

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
    'Kapon',
    'Spay'
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
  isHovered: boolean = false;

  dataSource = new MatTableDataSource<any>();

  // get location
  latitude!: number;
  longitude!: number;
  errorMessage!: string;
  latitudeDest: number = 14.824725461338147;
  longitudeDest: number = 120.29720868309234;
  locationFetched = false;

  clinicForm!: FormGroup;
  isEditable: boolean = false;


  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private supabaseService: SupabaseService,
    private http: HttpClient,
    // private cdr: ChangeDetectorRef,
    private geolocationService: GeolocationService
  ) {}

  calculateDistanceBetweenCoordinates(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const earthRadiusKm = 6371;
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(lat1)) *
        Math.cos(this.degreesToRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadiusKm * c;
    // Round the distance to two decimal places
    const roundedDistance = parseFloat(distance.toFixed(2));

    return roundedDistance;
  }

  degreesToRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  fetchLocation() {
    this.geolocationService.getCurrentPosition().subscribe(
      (position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.locationFetched = true;
        console.log('Latitude:', this.latitude);
        console.log('Longitude:', this.longitude);
      },
      (error) => {
        this.errorMessage = error.message;
        console.error('Error getting location:', this.errorMessage);
      }
    );
  }

  calculateSimilarity(
    clinic: Clinic,
    userPreferences: premiumUserPreferences
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
    const scheduleWeight = 1;
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

  countMatches(clinic: Clinic, userPreferences: premiumUserPreferences): number {
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

  matchClinicsContentBased(userPreferences: premiumUserPreferences): Clinic[] {
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

  loadClinics() {
    this.supabaseService
      .getSupabase()
      .from('clinic_tbl')
      .select('*')
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching clinics:', error);
        } else {
          this.clinics = data;
          this.displayedClinics = data;
        }
      });
  }

  async loadClinicFeatures() {
    try {
      const clinicsData = await this.supabaseService
        .getSupabase()
        .from('clinic_tbl')
        .select('*');

      if (!clinicsData.error) {
        this.clinicFeatures = clinicsData.data;
      } else {
        console.error('Error fetching clinic features:', clinicsData.error);
      }
    } catch (error) {
      console.error('Error fetching clinic features:', error);
    }
  }
}
