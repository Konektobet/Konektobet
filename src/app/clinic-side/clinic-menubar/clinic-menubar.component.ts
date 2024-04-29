import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, UrlTree } from '@angular/router';
import { Subscription } from 'rxjs';
import { Session } from '@supabase/supabase-js';
import { SupabaseService } from '../../service/supabase.service';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-clinic-menubar',
  templateUrl: './clinic-menubar.component.html',
  styleUrls: ['./clinic-menubar.component.scss'],
})
export class ClinicMenubarComponent implements OnInit, OnDestroy {
  activeLink: string | null = null;
  clinicUser: Session | null = null;
  private authSubscription!: Subscription;

  userFirstname: string = '';
  userLastname: string = '';

  loadingUserData: boolean = false; // Flag to indicate whether user data is being loaded

  constructor(
    private router: Router,
    private supabaseService: SupabaseService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.setActiveLink();
      }
    });

    // Retrieve session from local storage on component initialization
    const storedSession = localStorage.getItem('clinicUser');
    if (storedSession) {
      this.clinicUser = JSON.parse(storedSession);
    }

    this.authSubscription = this.supabaseService
      .getAuthState()
      .subscribe(async (session: Session | null) => {
        this.clinicUser = session;
        this.setActiveLink();

        // Store session in local storage
        localStorage.setItem('clinicUser', JSON.stringify(session));

        // Show loader while loading user data
        this.loadingUserData = true;

        // Call getFullname to get the first name and last name
        const fullNameData = await this.getFullname();
        if (fullNameData.length > 0) {
          this.userFirstname = fullNameData[0].fname;
          this.userLastname = fullNameData[0].lname;
        }

        // Hide loader after user data is loaded
        this.loadingUserData = false;
      });
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
  }

  private setActiveLink() {
    const currentUrlTree: UrlTree = this.router.createUrlTree([], {
      fragment: '',
    });

    const routes = ['/clinic/clinic-home', '/clinic/clinic-list', '/clinic/clinic-find', '/clinic/clinic-appointment'];

    for (const route of routes) {
      const isActive = this.router.isActive(
        this.router.createUrlTree([route]),
        true
      );
      if (isActive) {
        this.activeLink = route;
        return;
      }
    }

    this.activeLink = null;
  }

  // Getting the full name from supabase
  async getFullname() {
    const { data, error } = await this.supabaseService
      .getSupabase()
      .from('clinic_users_tbl')
      .select('fname, lname')
      .eq('email', this.clinicUser?.user.email);

    if (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
    return data || [];
  }

  isActiveLink(link: string): boolean {
    return this.activeLink === link;
  }

  logout() {
    // Show SweetAlert confirmation dialog
    Swal.fire({
      title: 'Logout',
      text: 'Are you sure you want to log out?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, log me out',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        // User clicked "Yes, log me out"
        this.performLogout();
      }
    });
  }

  private performLogout() {
    // Actual logout code
    this.supabaseService.getSupabase().auth.signOut();
    this.router.navigate(['/user-selection']);

    this.showLogoutToast();
  }

  private showLogoutToast() {
    this.snackBar.open('Logged out successfully!', '', {
      duration: 3000, // Duration in milliseconds
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['centered-toast'],
    });
  }

  private isClinicUser(session: Session | null): boolean {
    // Check if the user is a clinic user based on your criteria
    // For example, you might have a role property in user_metadata
    return session?.user.user_metadata?.['role'] === 'clinic';
  }
}
