import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, UrlTree } from '@angular/router';
import { Subscription } from 'rxjs';
import { Session } from '@supabase/supabase-js';
import { SupabaseService } from '../../service/supabase.service';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-menubar',
  templateUrl: './menubar.component.html',
  styleUrls: ['./menubar.component.scss'],
})
export class MenubarComponent implements OnInit {
  activeLink: string | null = null;
  user: Session | null = null;
  private authSubscription!: Subscription;

  userFirstname: string = '';
  userLastname: string = '';

  loadingUserData: boolean = false; // Flag to indicate whether user data is being loaded

  // profile picture
  images: string[] = [];  // Array to store image filenames
  currentImageIndex = 0;  // Index to display the current image
  url = '';
  file!: File;
  showChooseFile = false;

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

    this.authSubscription = this.supabaseService
      .getAuthState()
      .subscribe(async (session: Session | null) => {
        this.user = session;
        this.setActiveLink();

        // Show loader while loading user data
        this.loadingUserData = true;

        // Call getFullname to get the first name and last name
        const fullNameData = await this.getFullname();
        if (fullNameData.length > 0) {
          this.userFirstname = fullNameData[0].firstname;
          this.userLastname = fullNameData[0].lastname;
        }

        // Hide loader after user data is loaded
        this.loadingUserData = false;

        // profile picture
        this.fetchAllImages();
      });
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
  }

  private setActiveLink() {
    const currentUrlTree: UrlTree = this.router.createUrlTree([], {
      fragment: '',
    });

    const routes = ['/', '/clinic', '/find', '/appointment', '/concluded'];

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
      .from('users_tbl')
      .select('firstname, lastname')
      .eq('email', this.user?.user.email); // use the session email to find the corresponding firstname and lastname from db

    if (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
    return data || [];
  }

  isActiveLink(link: string): boolean {
    return this.activeLink === link;
  }

// profile picture
async fetchAllImages() {
  const currentUser = this.supabaseService.getAuthStateSnapshot();
  if (currentUser) {
    try {
      const { data, error } = await this.supabaseService.getSupabase().storage
        .from('userProfile')
        .list();

      if (data) {
        // Sort the images based on the creation timestamp in descending order
        this.images = data
          .sort((a, b) => b.created_at.localeCompare(a.created_at))
          .map((file) => file.name);

        // Fetch the latest image
        await this.displayCurrentImage();
      } else {
        console.error('Error fetching images:', error);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  }
}
async fetchImage(filename: string) {

  const { data, error } = await this.supabaseService.getSupabase().storage
    .from('userProfile')
    .download(filename);

  if (data) {
    this.url = URL.createObjectURL(data);
  } else {
    console.error('Error fetching image:', error);
  }
}

async displayCurrentImage() {
  // Display the user's uploaded image based on their user ID
  if (this.images.length > 0) {
    const currentUser = this.supabaseService.getAuthStateSnapshot();
    if (currentUser) {
      const { data: userData, error: userError } = await this.supabaseService
        .getSupabase()
        .from('users_tbl')
        .select('id')
        .eq('email', currentUser.email)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
      } else {
        if (userData) {
          const userId = userData.id;

          // Extract timestamps from filenames and sort in descending order
          const sortedUserImages = this.images
            .filter((filename) => filename.startsWith(`${userId}_`))
            .sort((a, b) => this.extractTimestamp(b) - this.extractTimestamp(a));

          if (sortedUserImages.length > 0) {
            // Fetch and display the latest image
            await this.fetchImage(sortedUserImages[0]);
          } else {
            console.error('No user images found.');
          }
        }
      }
    }
  }
}

extractTimestamp(filename: string): number {
  const matches = filename.match(/_(\d+)_/);
  return matches ? parseInt(matches[1], 10) : 0;
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
    this.router.navigate(['/']);

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
}
