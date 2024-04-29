import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { SupabaseService, User } from 'src/app/service/supabase.service';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ReviewService } from 'src/app/service/review.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { InitialRecommendService } from 'src/app/service/initial-recommend.service';
import { MakeAppointmentComponent } from 'src/app/modules/make-appointment/make-appointment.component';
import { RatingsComponent } from 'src/app/modules/ratings/ratings.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface Review {
  user: string;
  timestamp: Date | string;
  content: string;
  serviceRating?: number,
  facilityRating?: number,
  priceRating?: number,
}

export interface RecommendedClinics {
  name: string;
  address: string;
  image: string;
}

interface Clinic {
  id: any
  matchCount: any;
  cService: string;
  cSchedule: string;
  // cHealthcare: string;
  similarity?: number;
  rank?: number;
  cName: string;
  cAddress: string;
  cEmail: string;
  cNumber: string;
  cVet: string;
  cLink: string;
  cPrice: string;
  cTime: string;
}

interface UserPrefs{
  favService: string;
  favSchedule: string;
}
@Component({
  selector: 'app-admin-acdetails',
  templateUrl: './admin-acdetails.component.html',
  styleUrls: ['./admin-acdetails.component.scss']
})
export class AdminAcdetailsComponent implements OnInit{
  images: string[] = [];  // Array to store image filenames
  currentImageIndex = 0;  // Index to display the current image
  url = '';
  file!: File;
  showChooseFile = false;

  firstname!: string;
  lastname!: string;
  email!: string;
  phoneNumber!: string;
  
  selectedServices: string[] = [];
  selectedSchedules: string[] = [];

  reviews: Review[] = [];
  recommendedClinics: RecommendedClinics[] = [];
  newReview: Review | string = '';
  newRating: number | undefined;
  showAllReviews: boolean = false;

  // clinic
  clinics: any[] = [];
  clinicFeatures: Clinic[] = [];
  clinic: any;

  // favorites
  isFavorite: boolean = false;
  addedToFavorites: boolean = false;

  last: boolean = false;
  loading: boolean = false;
  clinicsFound: boolean = false;
  lastTwoClinics: any[] = [];

  overallRating: number = 0;
  overallServiceRating: number = 0;
  overallFacilityRating: number = 0;
  overallPriceRating: number = 0;

  clinicForm!: FormGroup;
  constructor(
    private supabaseService: SupabaseService,
    private dialog: MatDialog,
    private reviewService: ReviewService,
    private route: ActivatedRoute,
    private initialRecommendService: InitialRecommendService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
  ){
    // this.clinic = data.clinic;
  }

  ngOnInit(): void {
    this.loadUser();

    this.loadClinicFeatures();
    this.loadClinicDetails();

    this.route.params.subscribe((params) => {
      const clinicId = params['id'];
      // console.log('Clinic ID:', clinicId);
      this.loadAdditionalClinicDetails(clinicId);
    });

    this.clinicForm = this.formBuilder.group({
      cName: ['', Validators.required],
      cAddress: ['', Validators.required],
      cNumber: ['', Validators.required],
      cEmail: ['', Validators.required],
      cLink: ['', Validators.required],
      cGrmPrice: ['', Validators.required],
      cLabPrice: ['', Validators.required],
      cSrgPrice: ['', Validators.required],
      cTime: ['', Validators.required],
      cETime: ['', Validators.required],
      cSTime: ['', Validators.required],
      cService: [''],
      // cHealthcare: [''],
      cSchedule: [''],
    });

    this.route.params.subscribe((params) => {
      const clinicId = params['id'];
      // console.log('Clinic ID:', clinicId);
      this.loadAdditionalClinicDetails(clinicId);
    });
  }

  backToClinics(){
    this.router.navigate(['/admin/admin-accepted'])
  }
  
  // user
  async loadUser() {
    try {
      const currentUser = this.supabaseService.getAuthStateSnapshot();
  
      if (currentUser) {
        const { data: userData, error: userError } = await this.supabaseService
          .getSupabase()
          .from('admin_users_tbl')
          .select('*')
          .eq('email', currentUser.email)
          .single();
  
        if (userError) {
          console.error('Error fetching user data:', userError);
        } else {
          if (userData) {
            this.firstname = userData.firstname;
            this.lastname = userData.lastname;
            this.phoneNumber = userData.phoneNumber;
            this.email = userData.email;
  
            // Fetch user preferences from the interest_tbl
            const { data: userPrefsData, error: userPrefsError } =
              await this.supabaseService
                .getSupabase()
                .from('interests_tbl')
                .select('*')
                .eq('iUsers_id', userData.id)
                .single();
  
            if (userPrefsError) {
              console.error('Error fetching user preferences:', userPrefsError);
            } else {
              if (userPrefsData) {
                // Update component properties with user preferences
                this.selectedServices = userPrefsData.iService.split(', ');
                // this.selectedHealthcares = userPrefsData.iHealthcare.split(', ');
                this.selectedSchedules = userPrefsData.iSchedule.split(', ');
              }
            }
          } else {
            console.error('No user data found for the logged-in user.');
          }
        }
      } else {
        console.log('No logged-in user');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // clinic
  async loadClinicFeatures() {
    try {
      const currentUser = await this.supabaseService.getAuthStateSnapshot();
  
      if (currentUser) {
        const { data: userData, error: userError } = await this.supabaseService
          .getSupabase()
          .from('admin_users_tbl')
          .select('*')
          .eq('email', currentUser.email)
          .single();
  
        if (userError) {
          console.error('Error fetching user data:', userError);
        } else {
          if (userData) {          
            const userId = userData.id;
  
            const clinicsData = await this.supabaseService
            .getSupabase()
            .from('admin_accepted_tbl')
            .select('*')
            // .eq('mUsers_id', userId)
    
            if (!clinicsData.error) {
              this.clinicFeatures = clinicsData.data;
            } else {
              console.error('Error fetching clinic features:', clinicsData.error);
            }
          }
        }
      } else {
        console.error('No logged-in user found. Redirecting to the login page.');
      }
    } catch (error) {
      console.error('Error fetching clinic features:', error);
    }
  }

  async loadAdditionalClinicDetails(clinicId: any) {
    try {
      // Continue only if clinicId is defined
      if (clinicId) {
        // Fetch additional details from Supabase
        const { data: additionalDetails, error } = await this.supabaseService
          .getSupabase()
          .from('admin_accepted_tbl') // Update with the correct table name
          .select('*')
          .eq('id', clinicId); // Update with the correct identifier
  
          console.log('load add enw', additionalDetails)

        if (error) {
          console.error('Error fetching additional clinic details:', error);
        } else {
          // Merge the additional details with the existing clinic data
          this.clinic = { ...this.clinic, ...additionalDetails };
        }
      }
    } catch (error) {
      console.error('Error:', error);
      // Handle error appropriately
    }
  }

  async loadClinicDetails() {
    try {
      const clinicId = this.route.snapshot.params['id'];
  
      // Fetch clinic details from Supabase based on the clinic ID
      const { data: clinicData, error } = await this.supabaseService
        .getSupabase()
        .from('admin_accepted_tbl')
        .select('*')
        .eq('id', clinicId)
        .single();
  
      if (error) {
        console.error('Error fetching clinic details:', error);
      } else {
        // Update the clinic property with the fetched clinic data
        this.clinic = clinicData;
  
      }
    } catch (error) {
      console.error('Error:', error);
      // Handle error appropriately
    }
  }


}
