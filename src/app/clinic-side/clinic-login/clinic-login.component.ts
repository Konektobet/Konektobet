import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from '../../service/supabase.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Session } from '@supabase/supabase-js';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-clinic-login',
  templateUrl: './clinic-login.component.html',
  styleUrls: ['./clinic-login.component.scss'],
})
export class ClinicLoginComponent implements OnInit{
  passwordControl: FormControl = new FormControl('', Validators.required);

  loginForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  });

  clinicUser: Session | null = null;

  // Password eye
  hide: boolean = true;

  // Loading flag
  loading: boolean = false;

  constructor(
    private router: Router,
    private supabaseService: SupabaseService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAcceptedClinic();
  }

  togglePasswordVisibility() {
    this.hide = !this.hide;
  }

  redirectToSignup() {
    this.router.navigate(['clinic/clinic-signup']);
  }

  async login() {
    if (this.loginForm.valid && !this.loading) {
      const userData = this.loginForm.value;

      // Set loading to true
      this.loading = true;

      try {
        // Use Supabase client to sign in the user
        const { data, error } = await this.supabaseService
          .getSupabase()
          .auth.signInWithPassword({
            email: userData.email,
            password: userData.password,
          });

        if (error) {
          console.error('Error signing in:', error.message);
        } else {
          // Sign-in successful
          console.log('Login success:', data);

          const userResponse = await this.supabaseService
            .getSupabase()
            .from('clinic_users_tbl')
            .select('fname, lname')
            .eq('email', data.user?.email);
          // Check if userResponse.data is an array and get the first item
          const userData = Array.isArray(userResponse.data)
            ? userResponse.data[0]
            : null;

          // Use user data to get the first name
          const userFirstname = userData ? userData.fname : 'User';
          const userLastname = userData ? userData.lname : 'User';

          // Show welcome toast with user's first name
          this.showWelcomeToast(`${userFirstname} ${userLastname}`);
          this.loadAcceptedClinic();
          this.router.navigate(['clinic/clinic-home']);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        // Reset loading to false
        this.loading = false;
      }
    }
  }

  showWelcomeToast(userName: string) {
    this.snackBar.open(`Welcome, ${userName}!`, '', {
      duration: 3000, // Duration in milliseconds
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['centered-toast'],
    });
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
  
            if (!adminClinicError && adminClinicData && adminClinicData.length === 0 &&
                !clinicError && clinicData && clinicData.length === 0) {
              // No record found in admin_clinic_tbl and clinic_tbl, redirect to onboarding page
              this.router.navigate(['/clinic/onboarding']);
              console.log('Clinic data found:', clinicData)
              console.log('Admin data found:', adminClinicData)
            } else {
              // Redirect to clinic-home page
              this.router.navigate(['/clinic/clinic-home']);
              console.log('Clinic data found:', clinicData)
              console.log('Admin data found:', adminClinicData)
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
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while loading the clinic. Please try again.',
      });
    }
  }
}
