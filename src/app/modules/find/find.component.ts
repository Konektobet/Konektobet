import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
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
import { ClinicDetailsComponent } from '../details/clinic-details/clinic-details.component';
import { ClinicUser, SupabaseService } from '../../service/supabase.service';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { MatStepper } from '@angular/material/stepper';
// import { ring } from 'ldrs';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { InitialRecommendService } from 'src/app/service/initial-recommend.service';
// ring.register();

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

@Component({
  selector: 'app-find',
  templateUrl: './find.component.html',
  styleUrls: ['./find.component.scss'],
})
export class FindComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
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
    private cdr: ChangeDetectorRef,
    private initialRecommendService: InitialRecommendService,
  ) {}

  ngOnInit() {
    this.loadClinics();
    this.loadClinicFeatures();
    this.filteredServices = this.serviceControl.valueChanges.pipe(
      startWith(''),
      map((value) => this.filterService(value || ''))
    );

    this.filteredSchedules = this.scheduleControl.valueChanges.pipe(
      startWith(''),
      map((value) => this.filterSchedule(value || ''))
    );

    // this.filteredHealthcares = this.healthcareControl.valueChanges.pipe(
    //   startWith(''),
    //   map(value => this.filterHealthcare(value || ''))
    // );

    this.filteredServices.subscribe(() => {
      this.resetControl(this.serviceControl);
    });

    this.filteredSchedules.subscribe(() => {
      this.resetControl(this.scheduleControl);
    });

    // this.filteredHealthcares.subscribe(() => {
    //   this.resetControl(this.healthcareControl);
    // });

    this.firstFormGroup = this.formBuilder.group({
      firstCtrl: ['', Validators.required],
    });

    this.secondFormGroup = this.formBuilder.group({
      secondCtrl: ['', Validators.required],
    });
  }

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

  async findClinic() {
    try {
      const currentUser = this.supabaseService.getAuthStateSnapshot();
      this.loading = true;

      if (currentUser) {
        const { data: userData, error: userError } = await this.supabaseService
          .getSupabase()
          .from('users_tbl')
          .select('id')
          .eq('email', currentUser.email);

        if (userError) {
          console.error('Error fetching user data:', userError);
        } else {
          if (userData && userData.length > 0) {
            const userPreferences = {
              fUser_id: userData[0].id,
              fService: this.selectedServices.join(', '),
              // fHealthcare: this.selectedHealthcares.join(', '),
              fSchedule: this.selectedSchedules.join(', '),
            };

            console.log('User Preferences:', userPreferences);

            // const { data: deleteData, error: deleteError } = await this.supabaseService
            // .getSupabase()
            // .from('find_clinic_tbl')
            // .delete()
            // .eq('fUser_id', userPreferences.fUser_id)

            // if(deleteData){
            //   console.log('Deleted Successfully')
            // }

            // Save user preferences to the database
            const { data: insertData, error: insertError } =
              await this.supabaseService
                .getSupabase()
                .from('find_clinic_tbl')
                .insert([userPreferences]);

            if (insertError) {
              console.error('Error inserting user preferences:', insertError);
            } else {
              console.log('User preferences added successfully:', insertData);

              // Now you can use userPreferences in the matching algorithm
              // Update: Fetch user preferences before matching
              const { data: userPrefsData, error: userPrefsError } =
                await this.supabaseService
                  .getSupabase()
                  .from('find_clinic_tbl')
                  .select('*')
                  .eq('fUser_id', userPreferences.fUser_id)
                  .order('created_at', { ascending: false })
                  .limit(1);

              if (userPrefsError) {
                console.error(
                  'Error fetching user preferences:',
                  userPrefsError
                );
              } else {
                const matchedClinics =
                  this.matchClinicsContentBased(userPreferences);
                  // this.initialRecommendService.setMatchedClinics(matchedClinics);

                // Sort clinics based on the similarity score in descending order
                matchedClinics.sort(
                  (a, b) =>
                    (b.similarity !== undefined ? b.similarity : 0) -
                    (a.similarity !== undefined ? a.similarity : 0)
                );

                // Assign final ranks based on the sorted order
                matchedClinics.forEach((clinic, index) => {
                  clinic.rank = index + 1;
                });

                const recommendedClinics =
                  this.recommendClinics(matchedClinics);

                console.log('Matched Clinics:', matchedClinics);
                console.log('Recommended Clinics:', recommendedClinics);

                this.clinics = matchedClinics.map((clinic) => ({
                  ...clinic,
                  similarity: undefined,
                }));
                this.clinicsFound = matchedClinics.length > 0;

                this.lastTwoClinics = recommendedClinics.map((clinic) => ({
                  ...clinic,
                  similarity: undefined,
                }));

                this.loading = false;
                this.clinicsFound = matchedClinics.length > 0;

                this.cdr.detectChanges();

                // Move to the next step programmatically
                this.stepper.next();
              }
            }
          } else {
            console.error('No user data found for the logged-in user.');
          }
        }
      } else {
        this.router.navigate(['/login']);
        console.error(
          'No logged-in user found. Redirecting to the login page.'
        );
      }
    } catch (error) {
      this.loading = false;
      console.error('Error:', error);
    }
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

  onSelectServices(service: string): void {
    if (!this.selectedServices.includes(service)) {
      this.selectedServices.push(service);
      console.log('Selected Services:', this.selectedServices);
    }

    this.resetControl(this.serviceControl);
  }

  // onSelectHealthcares(healthcare: string): void {
  //   if (!this.selectedHealthcares.includes(healthcare)) {
  //     this.selectedHealthcares.push(healthcare);
  //     console.log('Selected Healthcares:', this.selectedHealthcares);
  //   }

  //   this.resetControl(this.serviceControl);
  // }

  onSelectSchedules(schedule: string): void {
    if (!this.selectedSchedules.includes(schedule)) {
      this.selectedSchedules.push(schedule);
      console.log('Selected Schedules:', this.selectedSchedules);
    }

    this.resetControl(this.scheduleControl);
  }

  removeServices(service: string): void {
    const index = this.selectedServices.indexOf(service);
    if (index !== -1) {
      this.selectedServices.splice(index, 1);
    }
  }

  // removeHealthcares(healthcare: string): void {
  //   const index = this.selectedHealthcares.indexOf(healthcare);
  //   if (index !== -1) {
  //     this.selectedHealthcares.splice(index, 1);
  //   }
  // }

  removeSchedules(schedule: string): void {
    const index = this.selectedSchedules.indexOf(schedule);
    if (index !== -1) {
      this.selectedSchedules.splice(index, 1);
    }
  }

  areServicesSelected(): boolean {
    return (
      this.selectedServices.length > 0 ||
      //  this.selectedHealthcares.length > 0 ||
      this.selectedSchedules.length > 0
    );
  }

  toggleSelectService(service: string): void {
    const index = this.selectedServices.indexOf(service);

    if (index !== -1) {
      // If the service is already selected, unselect it
      this.selectedServices.splice(index, 1);
      console.log(`Service "${service}" is unselected`);
    } else {
      // If the service is not selected, select it
      this.selectedServices.push(service);
      console.log(`Service "${service}" is selected`);
    }
  }

  // toggleSelectHealthcare(healthcare: string): void {
  //   const index = this.selectedHealthcares.indexOf(healthcare);
  
  //   if (index !== -1) {
  //     // If the Healthcare is already selected, unselect it
  //     this.selectedHealthcares.splice(index, 1);
  //     console.log(`Healthcare "${healthcare}" is unselected`);
  //   } else {
  //     // If the Healthcare is not selected, select it
  //     this.selectedHealthcares.push(healthcare);
  //     console.log(`Healthcare "${healthcare}" is selected`);
  //   }
  // }

  toggleSelectSchedule(schedule: string): void {
    const index = this.selectedSchedules.indexOf(schedule);

    if (index !== -1) {
      // If the schedule is already selected, unselect it
      this.selectedSchedules.splice(index, 1);
      console.log(`Schedule "${schedule}" is unselected`);
    } else {
      // If the schedule is not selected, select it
      this.selectedSchedules.push(schedule);
      console.log(`Schedule "${schedule}" is selected`);
    }
  }

  toggleDropdown(): void {
    this.isDropdownActive = !this.isDropdownActive;
  }

  private filterService(value: string): string[] {
    const filterValueService = this.normalizeValue(value);
    return this.services.filter((service) =>
      this.normalizeValue(service).includes(filterValueService)
    );
  }

  // private filterHealthcare(value: string): string[] {
  //   const filterValueHealthcare = this.normalizeValue(value);
  //   return this.healthcares.filter((healthcare) =>
  //     this.normalizeValue(healthcare).includes(filterValueHealthcare)
  //   );
  // }

  private filterSchedule(value: string): string[] {
    const filterValueSchedule = this.normalizeValue(value);
    return this.schedules.filter((schedule) =>
      this.normalizeValue(schedule).includes(filterValueSchedule)
    );
  }

  private normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }

  private resetControl(control: FormControl): void {
    if (control.value !== '') {
      control.reset('');
    }
  }

  // for pop up of check-details
  openCheckDetails(): void {
    this.dialog.open(ClinicDetailsComponent, {
      width: '60%',
      height: 'auto',
    });
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

  onPageChange(event: PageEvent) {
    const startIndex = event.pageIndex * event.pageSize;
    const endIndex = startIndex + event.pageSize;
    this.displayedClinics = this.clinics.slice(startIndex, endIndex);
  }

  setClinicsData(clinics: any[]) {
    this.dataSource = new MatTableDataSource<any>(clinics);
    this.dataSource.paginator = this.paginator;
  }

  popSeeMoreDetails(clinic: any): void {
    const dialogRef = this.dialog.open(ClinicDetailsComponent, {
      width: '50%',
      height: 'auto',
      data: { clinic: clinic },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      // Handle any actions after the dialog is closed, if needed
    });
  }

  searchTerm: string = '';

  clearSearch() {
    this.searchTerm = '';
  }
}
