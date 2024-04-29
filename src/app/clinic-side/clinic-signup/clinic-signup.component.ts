import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import Swal from 'sweetalert2';
import { SupabaseService } from '../../service/supabase.service';

@Component({
  selector: 'app-clinic-signup',
  templateUrl: './clinic-signup.component.html',
  styleUrls: ['./clinic-signup.component.scss'],
})
export class ClinicSignupComponent implements OnInit {
  // password eye
  hide: boolean = true;
  confirmHide: boolean = true;
  hideConfirmPassword: boolean = true;
  signupForm: any;
  user: any;

  ngOnInit() {
    this.signupForm = this.formBuilder.group({
      // firstname: ['', [Validators.required]],
      // lastname: ['', [Validators.required]],
      // phoneNumber: ['', [Validators.required]],
      // email: ['', [
      //   Validators.required,
      //   Validators.email,
      //   // Validators.pattern("[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"),
      // ]],
      // password: ['', [
      //   Validators.required,
      //   // Validators.pattern("(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"),
      // ]],
      // confirmPassword: ['', [
      //   Validators.required,
      //   // Validators.pattern("(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"),
      //   ]],
      fname: ['', Validators.required],
      lname: ['', Validators.required],
      num: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });
  }

  constructor(
    private router: Router,
    private supabaseService: SupabaseService,
    private formBuilder: FormBuilder
  ) {}

  togglePasswordVisibility() {
    this.hide = !this.hide;
  }

  toggleConfirmPasswordVisibility() {
    this.confirmHide = !this.confirmHide;
  }

  redirectToLogin() {
    this.router.navigate(['clinic/clinic-login']);
  }

  get errorCOntrol() {
    return this.signupForm?.controls;
  }

  async signup() {
    // Check if passwords match
    if (
      this.signupForm.get('password').value !==
      this.signupForm.get('confirmPassword').value
    ) {
      // Handle password mismatch
      console.error('Passwords do not match');
      // Show SweetAlert error notification
      Swal.fire({
        icon: 'error',
        title: 'Password Mismatch',
        text: 'Passwords do not match',
      });
      return;
    }

    try {
      // Use Supabase client to sign up the user
      const { data, error } = await this.supabaseService
        .getSupabase()
        .auth.signUp({
          email: this.signupForm.get('email').value,
          password: this.signupForm.get('password').value,
        });

      if (error) {
        console.error('Error signing up:', error.message);
        // Show SweetAlert error notification
        Swal.fire({
          icon: 'error',
          title: 'Signup Failed',
          text: error.message,
        });
      } else {
        // Sign-up successful
        const { data, error: insertError } = await this.supabaseService
          .getSupabase()
          .from('clinic_users_tbl')
          .insert([
            {
              fname: this.signupForm.get('fname').value,
              lname: this.signupForm.get('lname').value,
              num: this.signupForm.get('num').value,
              email: this.signupForm.get('email').value,
              password: this.signupForm.get('password').value,
            },
          ]);

        if (insertError) {
          console.error('Error inserting user data:', insertError.message);
          // Show SweetAlert error notification
          Swal.fire({
            icon: 'error',
            title: 'Signup Failed',
            text: insertError.message,
          });
        } else {
          console.log('User signed up successfully:', data);
          // Show SweetAlert success notification
          Swal.fire({
            icon: 'success',
            title: 'Signup Successful',
            text: 'You have successfully signed up! Email Verification is sent to your Email account.',
          });

          // Clear the form
          this.signupForm.reset();

          // Redirect to login page
          this.router.navigate(['/clinic-login']);
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      // Show SweetAlert unexpected error notification
      Swal.fire({
        icon: 'error',
        title: 'Unexpected Error',
        text: 'An unexpected error occurred. Please try again later.',
      });
    }
  }
}
