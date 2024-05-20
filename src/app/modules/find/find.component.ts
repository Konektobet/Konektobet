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
import { GeolocationService } from 'src/app/service/geolocation.service';
import { FindDetailsComponent } from '../details/find-details/find-details.component';
import { FindFreeService } from 'src/app/service/find-free.service';
import { FindPremiumService } from 'src/app/service/find-premium.service';
// ring.register();

interface UserPreferences {
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
    'Spay',
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

  isPaid: boolean = false;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private supabaseService: SupabaseService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private geolocationService: GeolocationService,
    private findFreeService: FindFreeService,
    private findPremiumService: FindPremiumService
  ) {}

  ngOnInit() {
    this.getSubsInfo();
    this.loadClinics();
    this.loadClinicFeatures();
    this.freeLoadClinicFeatures();
    // this.fetchAllClinicLogos();
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

    this.clinicForm = this.formBuilder.group({
      cName: ['', Validators.required],
      cAddress: ['', Validators.required],
      cEmail: ['', Validators.required],
      cNumber: ['', Validators.required],
      cTime: ['', Validators.required],
      cSchedule: ['', Validators.required],
      cService: ['', Validators.required],
      cGrmPrice: ['', Validators.required],
      cLabPrice: ['', Validators.required],
      cSrgPrice: ['', Validators.required],
      cLink: ['', Validators.required],
      distance: ['', Validators.required],
    });

    // geolocation
    // this.geolocationService.getCurrentPosition()
    // .subscribe((position) => {
    //   this.latitude = position.coords.latitude;
    //   this.longitude = position.coords.longitude;
    // }, (error) => {
    //   this.errorMessage = error.message;
    // });
  }

  onMouseEnter(clinic: any) {
    // this.isHovered = true;

    const dialogRef = this.dialog.open(ClinicDetailsComponent, {
      width: '50%',
      height: 'auto',
      data: { clinic: clinic },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      // Handle any actions after the dialog is closed, if needed
    });
  }

  onMouseLeave() {
    this.isHovered = false;
  }

  async getSubsInfo() {
    const currentUser = this.supabaseService.getAuthStateSnapshot();

    if (currentUser) {
      const { data: userData, error: userError } = await this.supabaseService
        .getSupabase()
        .from('users_tbl')
        .select('id')
        .eq('email', currentUser.email);

      if (userError) {
        console.error('Error fetching user data:', userError);
        return;
      }

      if (userData && userData.length > 0) {
        const userId = userData[0].id;
        const { data: subsData, error: subsError } = await this.supabaseService
          .getSupabase()
          .from('subscribers_tbl')
          .select('subscribed')
          .eq('subsUsers_id', userId);

        if (subsError) {
          console.error('Error fetching subscription data:', subsError);
          return;
        }

        if (subsData && subsData.length > 0) {
          // If user is subscribed, set isPaid to true
          this.isPaid = subsData[0].subscribed === true;
          this.cdr.detectChanges();
        } else {
          // If no subscription data is found, set isPaid to false
          this.isPaid = false;
        }
      }
    }
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
              fCoordinates: `${this.latitude}, ${this.longitude}`,
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
                  this.findPremiumService.matchClinicsContentBased(
                    userPreferences
                  );

                // Calculate distance and match count for each clinic
                matchedClinics.forEach((clinic) => {
                  clinic.distance =
                    this.findPremiumService.calculateDistanceBetweenCoordinates(
                      this.latitude,
                      this.longitude,
                      clinic.cLatitude,
                      clinic.cLongitude
                    );
                  clinic.matchCount = this.findPremiumService.countMatches(
                    clinic,
                    userPreferences
                  );
                });

                // Sort clinics based on match count in descending order
                // and then by distance in ascending order
                matchedClinics.sort((a, b) => {
                  // Sort by match count in descending order
                  if (a.matchCount !== b.matchCount) {
                    return b.matchCount - a.matchCount; // Higher match count first
                  } else {
                    // If match counts are equal, sort by distance in ascending order
                    return a.distance - b.distance; // Lower distance first
                  }
                });

                // Assign ranks based on the sorted order
                matchedClinics.forEach((clinic, index) => {
                  clinic.rank = index + 1;
                });

                const recommendedClinics =
                  this.findPremiumService.recommendClinics(matchedClinics);

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
                this.fetchAllClinicLogos();
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
          'No logged-in user found or location not fetched. Redirecting to the login page.'
        );
      }
    } catch (error) {
      this.loading = false;
      console.error('Error:', error);
    }
  }

  async freeFindClinic() {
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
                  this.findFreeService.matchClinicsContentBased(userPreferences);
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
                  this.findFreeService.recommendClinics(matchedClinics);

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
                this.fetchAllClinicLogos();
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

  // pet clinic logo
  async fetchAllClinicLogos() {
    const fetchPromises = this.clinics.map(async (clinic) => {
      const filename = `${clinic.cName}_clinicLogo`;
      try {
        const { data, error } = await this.supabaseService
          .getSupabase()
          .storage.from('clinicLogo')
          .download(filename);

        if (error) {
          clinic.profile = 'assets/logoo.png';
        } else {
          clinic.profile = URL.createObjectURL(data);
        }
      } catch (error) {
        clinic.profile = 'assets/logoo.png';
      }
    });

    await Promise.all(fetchPromises);
    this.cdr.detectChanges(); // Ensure Angular detects the changes
  }

  onSelectServices(service: string): void {
    if (!this.selectedServices.includes(service)) {
      this.selectedServices.push(service);
      console.log('Selected Services:', this.selectedServices);
    }

    this.resetControl(this.serviceControl);
  }

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
      width: '100%',
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

  freeLoadClinics() {
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
        this.findPremiumService.clinicFeatures = clinicsData.data;
      } else {
        console.error('Error fetching clinic features:', clinicsData.error);
      }
    } catch (error) {
      console.error('Error fetching clinic features:', error);
    }
  }

  async freeLoadClinicFeatures() {
    try {
      const clinicsData = await this.supabaseService
        .getSupabase()
        .from('clinic_tbl')
        .select('*');

      if (!clinicsData.error) {
        this.findFreeService.clinicFeatures = clinicsData.data;
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
    const dialogRef = this.dialog.open(FindDetailsComponent, {
      width: 'auto',
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

  async goBackHome() {
    this.router.navigate(['/']);
  }

  navigateToSubscriptionPage(){
    this.router.navigate(['/pricing']);
  }
}
