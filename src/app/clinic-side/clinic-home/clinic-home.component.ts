import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { InitialRecommendService } from 'src/app/service/initial-recommend.service';
import { SupabaseService } from 'src/app/service/supabase.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-clinic-home',
  templateUrl: './clinic-home.component.html',
  styleUrls: ['./clinic-home.component.scss']
})
export class ClinicHomeComponent implements OnInit{
  redirectionPerformed: boolean = false;

  constructor(
    private supabaseService: SupabaseService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private initialRecommendService: InitialRecommendService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadAcceptedClinic();
  }

  async loadAcceptedClinic() {
    try {
      if (!this.redirectionPerformed) {
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
      
              if (!adminClinicError && adminClinicData && adminClinicData.length === 0 &&
                  !clinicError && clinicData && clinicData.length === 0) {
                // No record found in admin_clinic_tbl and clinic_tbl, redirect to onboarding page
                this.router.navigate(['/clinic/onboarding']);
                console.log('Clinic data found:', clinicData)
                console.log('Admin data found:', adminClinicData)
              } else {
                // Redirect to clinic-home page
                // this.router.navigate(['/clinic/clinic-home']);
                console.log('Clinic data found:', clinicData)
                console.log('Admin data found:', adminClinicData)
              }
    
              // Set the redirection flag to true to prevent further redirections
              this.redirectionPerformed = true;
            } else {
              console.error('No user data found for the logged-in user.');
            }
          }
        } else {
          console.error('No logged-in user found.');
        }
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
}
