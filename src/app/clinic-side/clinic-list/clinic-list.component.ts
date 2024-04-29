import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SupabaseService } from '../../service/supabase.service';
import { InitialRecommendService } from 'src/app/service/initial-recommend.service';
import { Router } from '@angular/router';
import { AddClinicComponent } from '../crud/add-clinic/add-clinic.component';
import Swal from 'sweetalert2';

interface Clinic {
  matchCount: any;
  cService: string;
  cSchedule: string;
  similarity?: number;
  rank?: number;
}

@Component({
  selector: 'app-clinic-list',
  templateUrl: './clinic-list.component.html',
  styleUrls: ['./clinic-list.component.scss'],
})
export class ClinicListComponent implements OnInit {
  clinicAdded: boolean = false;
  clinics: any[] = [];
  rejectedClinics: any[] = [];
  clinicsFound = false;
  redirectionPerformed: boolean = false;
  newClinic: any = {
    cName: '',
    cAddress: '',
    cService: '',
  };

  isHovered: boolean = false;

  constructor(
    private supabaseService: SupabaseService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private initialRecommendService: InitialRecommendService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadClinics();
    this.loadAcceptedClinic();
    this.loadRejectedClinics();
    this.fetchClinicLogo();
  }

  onMouseEnter() {
    this.isHovered = true;
  }

  onMouseLeave() {
    this.isHovered = false;
  }

  async loadClinics() {
    try {
      // Get the currently logged-in user's information
      const currentUser =
        await this.supabaseService.getClinicAuthStateSnapshot();

      // Check if there is a logged-in user
      if (currentUser) {
        // Fetch the user ID from clinic_users_tbl based on the email
        const { data: userData, error: userError } = await this.supabaseService
          .getSupabase()
          .from('clinic_users_tbl')
          .select('id')
          .eq('email', currentUser.email);

        if (userError) {
          console.error('Error fetching user data:', userError);
          // Handle error appropriately
        } else {
          if (userData && userData.length > 0) {
            const userId = userData[0].id;

            // Load clinics where cUsers_id is equal to the user's ID
            const { data: clinicsData, error: clinicsError } =
              await this.supabaseService
                .getSupabase()
                .from('clinic_tbl')
                .select('*')
                .eq('cUsers_id', userId);

            if (clinicsError) {
              console.error('Error fetching clinics:', clinicsError);
            } else {
              this.clinics = clinicsData || [];
              this.fetchClinicLogo();
            }
          } else {
            console.error('No user data found for the logged-in user.');
          }
        }
      } else {
        console.error('No logged-in user found.');
      }
    } catch (error) {
      console.error('Error:', error);
      // Handle error appropriately
    }
  }

  async loadAcceptedClinic() {
    try {
      const currentUser = this.supabaseService.getClinicAuthStateSnapshot();

      if (currentUser) {
        const { data: userData, error: userError } = await this.supabaseService
          .getSupabase()
          .from('clinic_users_tbl')
          .select('*')
          .eq('email', currentUser.email);

        if (userError) {
          console.error('Error fetching user data:', userError);
        } else {
          if (userData && userData.length > 0) {
            const acUsers_id = userData[0].id;

            const { data: adminClinicData, error: adminClinicError } =
              await this.supabaseService
                .getSupabase()
                .from('admin_clinic_tbl')
                .select('*')
                .eq('adUsers_id', acUsers_id);

            const { data: clinicData, error: clinicError } =
              await this.supabaseService
                .getSupabase()
                .from('clinic_tbl')
                .select('*')
                .eq('cUsers_id', acUsers_id);

            if (
              !adminClinicError &&
              adminClinicData &&
              adminClinicData.length === 0 &&
              !clinicError &&
              clinicData &&
              clinicData.length === 0
            ) {
              // No record found in admin_clinic_tbl and clinic_tbl, redirect to onboarding page
              this.router.navigate(['/clinic/onboarding']);
              console.log('Clinic data found:', clinicData);
              console.log('Admin data found:', adminClinicData);
            } else {
              // Redirect to clinic-home page
              // this.router.navigate(['/clinic/clinic-list']);
              console.log('Clinic data found:', clinicData);
              console.log('Admin data found:', adminClinicData);
            }

            this.redirectionPerformed = true;
          } else {
            console.error('No user data found for the logged-in user.');
          }
        }
      } else {
        console.error('No logged-in user found.');
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while loading the clinic. Please try again.',
      });
    }
  }

  async loadRejectedClinics() {
    try {
      // Get the currently logged-in user's information
      const currentUser =
        await this.supabaseService.getClinicAuthStateSnapshot();

      // Check if there is a logged-in user
      if (currentUser) {
        // Fetch the user ID from clinic_users_tbl based on the email
        const { data: userData, error: userError } = await this.supabaseService
          .getSupabase()
          .from('clinic_users_tbl')
          .select('id')
          .eq('email', currentUser.email);

        if (userError) {
          console.error('Error fetching user data:', userError);
          // Handle error appropriately
        } else {
          if (userData && userData.length > 0) {
            const userId = userData[0].id;

            // Load clinics where cUsers_id is equal to the user's ID
            const { data: clinicsData, error: clinicsError } =
              await this.supabaseService
                .getSupabase()
                .from('admin_rejected_tbl')
                .select('*')
                .eq('arUsers_id', userId);

            if (clinicsError) {
              console.error('Error fetching clinics:', clinicsError);
            } else {
              this.rejectedClinics = clinicsData || [];
            }
          } else {
            console.error('No user data found for the logged-in user.');
          }
        }
      } else {
        console.error('No logged-in user found.');
      }
    } catch (error) {
      console.error('Error:', error);
      // Handle error appropriately
    }
  }

  popAddClinic(): void {
    // Check if the user has already added a clinic
    if (this.clinics) {
      const dialogRef = this.dialog.open(AddClinicComponent, {
        width: '70%',
        height: 'auto',
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.addClinic(result);
        }
      });
    } else {
      // Optionally, you can display a message to the user that they can only add one clinic
      Swal.fire({
        icon: 'info',
        title: 'Notice!',
        text: 'You can only add one clinic.',
      });
    }
  }

  addClinic(newClinic: any) {
    // Assuming newClinic is an object with the same structure as other clinics
    // this.clinics.push({ ...newClinic });
    this.clearNewClinic();
    // Set the flag to true to display the verification pending card
    this.clinicAdded = true;
  }

  private clearNewClinic() {
    this.newClinic = {
      cName: '',
      cAddress: '',
      cService: '',
    };
  }

  popSeeMoreDetails(clinic: any): void {
    this.router.navigate(['/new-details', clinic.id]);
  }

  async fetchClinicLogo() {
    for (const clinic of this.clinics) {
      const filename = `${clinic.cName}_clinicLogo`;
      try {
        const { data, error } = await this.supabaseService.getSupabase().storage
          .from('clinicLogo')
          .download(filename);
        // console.log(filename)

        if (error) {
          // console.error('Error fetching profile picture:', error);
          // Fallback to default image
          clinic.profile = 'assets/logo.png';
        } else {
          clinic.profile = URL.createObjectURL(data);
        }
      } catch (error) {
        // console.error('Error fetching profile picture:', error);
        // Fallback to default image
        clinic.profile = 'assets/logo.png';
      }
    }
  }
}
