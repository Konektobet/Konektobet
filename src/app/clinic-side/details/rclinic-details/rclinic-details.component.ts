import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { SupabaseService, User } from 'src/app/service/supabase.service';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ReviewService } from 'src/app/service/review.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { InitialRecommendService } from 'src/app/service/initial-recommend.service';
import { EditClinicComponent } from '../../crud/edit-clinic/edit-clinic.component';

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
  selector: 'app-rclinic-details',
  templateUrl: './rclinic-details.component.html',
  styleUrls: ['./rclinic-details.component.scss']
})
export class RclinicDetailsComponent {
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
  constructor(
    private supabaseService: SupabaseService,
    private dialog: MatDialog,
    private reviewService: ReviewService,
    private route: ActivatedRoute,
    private initialRecommendService: InitialRecommendService,
    private router: Router,
    private cdr: ChangeDetectorRef,
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
  }

  backToClinics(){
    this.router.navigate(['clinic/clinic-list'])
  }

  // user
  async loadUser() {
    try {
      const currentUser = this.supabaseService.getAuthStateSnapshot();
  
      if (currentUser) {
        const { data: userData, error: userError } = await this.supabaseService
          .getSupabase()
          .from('users_tbl')
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
          .from('users_tbl')
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
            .from('admin_rejected_tbl')
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
          .from('admin_rejected_tbl') // Update with the correct table name
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
        .from('admin_rejected_tbl')
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

  popEditClinic(clinic: any): void {
    const dialogRef = this.dialog.open(EditClinicComponent, {
      width: '70%',
      height: 'auto',
      data: { clinic: clinic }, // Pass the clinic data to the dialog
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Update the clinic in the list
        const index = this.clinics.findIndex((c) => c.id === clinic.id);
        if (index !== -1) {
          this.clinics[index] = { ...result };
        }
      }
    });
  }

  deleteClinic(clinic: any): void {
    // Use SweetAlert to confirm deletion
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3f51b5',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        // Remove clinic from the local array
        const index = this.clinics.findIndex((c) => c.id === clinic.id);
        if (index !== -1) {
          this.clinics.splice(index, 1);
        }

        // Delete clinic from the database
        this.deleteClinicFromDatabase(clinic.id);
      }
    });
  }

  private async deleteClinicFromDatabase(clinicId: number): Promise<void> {
    try {
      // Delete clinic from 'clinic_tbl' based on the clinic ID
      const { error: deleteError } = await this.supabaseService
        .getSupabase()
        .from('admin_rejected_tbl')
        .delete()
        .eq('id', clinicId);

      if (deleteError) {
        console.error('Error deleting clinic:', deleteError);
        // Handle error appropriately
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Clinic Successfully Deleted!',
          text: 'The clinic has been deleted.',
        });
        this.router.navigate(['clinic/clinic-list'])
        console.log('Clinic deleted successfully from the database.');
      }
    } catch (error) {
      console.error('Error:', error);
      // Handle error appropriately
    }
  }

}
