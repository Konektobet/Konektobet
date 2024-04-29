import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from '../../service/supabase.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Session } from '@supabase/supabase-js';
import Swal from 'sweetalert2';
import { LoginDialogService } from 'src/app/service/login-dialog.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  passwordControl: FormControl = new FormControl('', Validators.required);

  loginForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  });

  user: Session | null = null;

  // Password eye
  hide: boolean = true;

  // Loading flag
  loading: boolean = false;

  constructor(
    private router: Router,
    private supabaseService: SupabaseService,
    private snackBar: MatSnackBar,
    private loginDialog: LoginDialogService,
  ) {}

  togglePasswordVisibility() {
    this.hide = !this.hide;
  }

  redirectToSignup() {
    this.router.navigate(['/signup']);
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
  
          Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: 'Incorrect email or password',
          });
        } else {
          // Sign-in successful
          console.log('Login success:', data);
  
          const userResponse = await this.supabaseService
            .getSupabase()
            .from('users_tbl')
            .select('firstname, lastname')
            .eq('email', data.user?.email);
          // Check if userResponse.data is an array and get the first item
          const userData = Array.isArray(userResponse.data)
            ? userResponse.data[0]
            : null;
  
          // Use user data to get the first name
          const userFirstname = userData ? userData.firstname : 'User';
          const userLastname = userData ? userData.lastname : 'User';
  
          // Trigger login success event
          await this.loginDialog.login();
  
          // Show welcome toast with user's first name
          this.showWelcomeToast(`${userFirstname} ${userLastname}`);
  
          // Navigate to home after successful login
          this.router.navigate(['/']);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        // Reset loading to false
        this.loading = false;
      }
    }
  }

  async  signInWithGoogle() {
    const { data, error } = await this.supabaseService.getSupabase().auth.signInWithOAuth({
        provider: 'google',
        // options: {
        //     // redirectTo: getURL() // function to get your URL
        // }
    })
    if (error) {
      console.error('Google sign up error:', error.message);
      // Handle sign up error
    } else {
      // You can access the user data from the response object
      console.log('Google sign up success:', data);
      // Handle successful sign up
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
}
