import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { LoginDialogService } from 'src/app/service/login-dialog.service';
import { InitialPreferenceComponent } from '../initial-preference/initial-preference.component';
import { SupabaseService } from 'src/app/service/supabase.service';
import { MakeAppointmentComponent } from '../make-appointment/make-appointment.component';
import { MatchedDetailsComponent } from '../details/matched-details/matched-details.component';
import { ClinicDetailsComponent } from '../details/clinic-details/clinic-details.component';
import { InitialRecommendService } from 'src/app/service/initial-recommend.service';
import { FavDetailsComponent } from '../details/fav-details/fav-details.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Session } from '@supabase/supabase-js';
import { Subscription } from 'rxjs';

interface UserPreferences {
  fvService: string;
  // iHealthcare: string;
  fvSchedule: string;
  // Add other properties as needed
}

interface UserPrefs{
  favService: string;
  favSchedule: string;
}

interface Clinic {
  id: number;
  matchCount: any;
  cService: string;
  cSchedule: string;
  // cHealthcare: string;
  similarity?: number;
  rank?: number;
  // Add other properties as needed
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit{
  user: Session | null = null;
  private authSubscription!: Subscription;

  clinics: any[] = [];
  favClinics: any[] = [];
  initialClinics: any[] = [];
  clinicFeatures: Clinic[] = [];
  lastTwoClinics: any[] = [];

  clinic: any;

  addedToFavorites: boolean = false;
  isFavorite: boolean = false;

  loading = false;
  clinicsFound = false;
  isHovered: boolean = false;

  isLoggedIn: boolean = false;
  constructor(
    private dialog: MatDialog,
    private loginDialog: LoginDialogService,
    private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef,
    private initialRecommendService: InitialRecommendService,
    private router: Router,
  ) {}

  async ngOnInit() {
    // this.generateRecommendations();
    this.loadDialog();
    this.loadClinicFeatures();
    this.loadMatchedClinics();

    this.authSubscription = this.supabaseService
      .getAuthState()
      .subscribe(async (session: Session | null) => {
        this.user = session;

        this.loadFavMatchedClinics();
        this.loadMatchedAndFavClinicFeatures();
      });
  }

  onMouseEnter() {
    this.isHovered = true;
  }

  onMouseLeave() {
    this.isHovered = false;
  }

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
            .from('matched_clinics_tbl')
            .select('*')
            .eq('mUsers_id', userId)
    
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

  async loadMatchedClinics() {
    try {
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
  
            // Fetch clinics from the matched_clinics_tbl based on the user ID
            const { data: clinicsData, error: clinicsError } =
              await this.supabaseService
                .getSupabase()
                .from('matched_clinics_tbl')
                .select('*')
                .eq('mUsers_id', userId);
  
            if (clinicsError) {
              console.error('Error fetching matched clinics:', clinicsError);
            } else {
              this.initialClinics = clinicsData.slice(0, 6) || [];
            }
          } else {
            console.error('No user data found for the logged-in user.');
          }
        }
      } else {
        console.error('No logged-in user found. Redirecting to the login page.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async loadDialog() {
    try {
      const currentUser = this.supabaseService.getAuthStateSnapshot();
  
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
              iUsers_id: userData[0].id,
            };
  
            // Check if there is no data in interests_tbl
            const userDataInInterests = await this.supabaseService.getSupabase()
              .from('interests_tbl')
              .select('id')
              .eq('iUsers_id', userPreferences.iUsers_id);
  
            if (!userDataInInterests.data || userDataInInterests.data.length === 0) {
              // Open the dialog only if there is no data in interests_tbl
              if (await this.loginDialog.login()) {
                this.openDialog();
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  openDialog(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = window.innerWidth > 768 ? '55%' : '90%';
    dialogConfig.height = window.innerHeight > 768 ? 'auto' : '90%';

    const dialogRef = this.dialog.open(InitialPreferenceComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => {
      // Dialog closed
    });
  }

  openMakeAppointmentPopup() {
    const dialogRef = this.dialog.open(MakeAppointmentComponent, {
      width: '50%', // Adjust width as needed
      height: 'auto', // Adjust height as needed
      data: { clinic: this.clinic },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      // Handle any actions after the dialog is closed, if needed
    });
        // Close the current Clinic Details popup
        // this.dialogRef.close();
    }

  popSeeMoreDetails(clinic: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = window.innerWidth > 768 ? '55%' : '90%';
    dialogConfig.height = window.innerHeight > 768 ? 'auto' : '90%';
    dialogConfig.data = { clinic: clinic };

    const dialogRef = this.dialog.open(ClinicDetailsComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      // Handle any actions after the dialog is closed, if needed
    });
  }

  popMatchedSeeMoreDetails(clinic: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = window.innerWidth > 768 ? '55%' : '90%';
    dialogConfig.height = window.innerHeight > 768 ? 'auto' : '90%';
    dialogConfig.data = { clinic: clinic };

    const dialogRef = this.dialog.open(MatchedDetailsComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      // Handle any actions after the dialog is closed, if needed
    });
  }

  popFavSeeMoreDetails(clinic: any): void {
    this.router.navigate(['/new-details', clinic.id]);
  }

  // recommend for favorites
  async loadFavMatchedClinics() {
    try {
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

            // Fetch clinics from the matched_clinics_tbl based on the user ID
            const { data: clinicsData, error: clinicsError } =
              await this.supabaseService
                .getSupabase()
                .from('favMatched_tbl')
                .select('*')
                .eq('fvmUsers_id', userId);

            if (clinicsError) {
              console.error('Error fetching favorite matched clinics:', clinicsError);
            } else {
              this.clinics = clinicsData.slice(0, 6) || [];
            }
          } else {
            console.error('No user data found for the logged-in user.');
          }
        }
      } else {
        console.error('No logged-in user found. Redirecting to the login page.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // Load features from both matched clinics and favorite clinics
  async loadMatchedAndFavClinicFeatures() {
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
  
            // Fetch features from the matched_clinics_tbl based on the user ID
            const { data: matchedClinicsData, error: matchedClinicsError } =
              await this.supabaseService
                .getSupabase()
                .from('matched_clinics_tbl')
                .select('*')
                .eq('mUsers_id', userId);
  
            if (!matchedClinicsError) {
              // Filter out clinics that are already in favorites
              const filteredMatchedClinics = await Promise.all(
                matchedClinicsData.map(async (clinic) => {
                  const isInFavorites = await this.isInFavorites(clinic);
                  return isInFavorites ? null : clinic;
                })
              );
  
              this.clinicFeatures = this.clinicFeatures.concat(
                filteredMatchedClinics.filter((clinic) => clinic !== null) || []
              );
            } else {
              console.error('Error fetching matched clinic features:', matchedClinicsError);
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

  // add to favorites using fav-details
    async addToFavorites() {
      try {
        const currentUser = this.supabaseService.getAuthStateSnapshot();
  
        // Check if a user is logged in
        if (currentUser) {
          // Get the user ID based on the logged-in email
          const { data: userData, error: userError } = await this.supabaseService
            .getSupabase()
            .from('users_tbl')
            .select('id')
            .eq('email', currentUser.email);
  
          if (userError) {
            console.error('Error fetching user data:', userError);
          } else {
            if (userData && userData.length > 0) {
              // Retrieve all necessary clinic details from the database
              const { data: clinicData, error: clinicError } =
                await this.supabaseService
                  .getSupabase()
                  .from('favMatched_tbl')
                  .select('*')
                  .eq('id', this.clinic.id);
  
              if (clinicError) {
                console.error('Error fetching clinic details:', clinicError);
                return; // Exit the function if there's an error fetching clinic details
              }
  
              const { data: cData, error: cError } = await this.supabaseService
              .getSupabase()
              .from('favMatched_tbl')
              .select('*')
              .eq('fvmClinic_id', this.clinic.fvmClinic_id)
              // .eq('cName', this.clinic.cName);
              console.log(this.clinic.fvmClinic_id)
  
              if(cData && cData.length > 0){
                const clinicId = this.clinic.fvmClinic_id;
                // Extract necessary clinic details
                const clinicDetails = {
                  fvmUsers_id: userData[0].id,
                  fvmClinic_id: clinicId,
                  fvmService: clinicData[0].fvmService,
                  fvmSchedule: clinicData[0].fvmSchedule,
                  // fvHealthcare: clinicData[0].cHealthcare,
                  fvmName: clinicData[0].fvmName,
                  fvmAddress: clinicData[0].fvmAddress,
                  fvmNumber: clinicData[0].fvmNumber,
                  fvmEmail: clinicData[0].fvmEmail,
                  fvmVet: clinicData[0].fvmVet,
                  fvmLink: clinicData[0].fvmLink,
                  fvmPrice: clinicData[0].fvmPrice,
                  fvmTime: clinicData[0].fvmTime,
                };
  
                // Insert the clinic into the favorites table
                const { data: insertData, error: insertError } =
                  await this.supabaseService
                    .getSupabase()
                    .from('favorites_tbl')
                    .insert([clinicDetails]);
  
                if (insertError) {
                  console.error('Error inserting into favorites:', insertError);
                } else {
                  console.log('Added to favorites successfully:', insertData);
                  Swal.fire({
                    icon: 'success',
                    title: 'Successfully added to favorites!',
                    text: 'The clinic has been added as favorite.',
                  });
  
                  this.addedToFavorites = true;
  
                  this.disableAddToFavoritesButton();
                  
                  this.cdr.detectChanges();
                }
              } else{
                console.error(cError);
              }
            } else {
              console.error('No user data found for the logged-in user.');
            }
          }
        } else {
          // Handle the case where no user is logged in
          this.router.navigate(['/login']);
          console.error('No logged-in user found.');
        }
      } catch (error) {
        console.error('Error:', error);
        // Handle the error appropriately
      }
    }
  
    async isInFavorites(clinic: Clinic) {
      const currentUser = await this.supabaseService.getAuthStateSnapshot();
    
      if (currentUser) {
        const { data: userData, error: userError } = await this.supabaseService
          .getSupabase()
          .from('users_tbl')
          .select('id')
          .eq('email', currentUser.email)
          .single();
    
        if (userError) {
          console.error('Error fetching user data:', userError);
          return false;
        } else {
          if (userData) {
            const userId = userData.id;
    
            const { data: favoritesData, error: favoritesError } =
              await this.supabaseService
                .getSupabase()
                .from('favorites_tbl')
                .select('*')
                .eq('fvUsers_id', userId)
                .eq('fvClinic_id', clinic.id);

            if (favoritesError) {
              console.error('Error fetching favorites data:', favoritesError);
              return false;
            } else {
              return favoritesData && favoritesData.length > 0;
            }
          } else {
            console.error('No user data found for the logged-in user.');
            return false;
          }
        }
      } else {
        console.error('No logged-in user found.');
        return false;
      }
    }
  
    disableAddToFavoritesButton() {
      const addToFavoritesButton = document.getElementById('addToFavoritesButton');
    
      if (addToFavoritesButton) {
        addToFavoritesButton.setAttribute('disabled', 'true');
      }
    }
  
    clinicDetailsClickedInFavoritesTab() {
      this.isFavorite = true;
    }


  navigateToHome(){
    this.router.navigate(['/'])
  }

  navigateToClinic(){
    this.router.navigate(['/clinic'])
  }

  navigateToFind(){
    this.router.navigate(['/find'])
  }

  navigateToAppointment(){
    this.router.navigate(['/appointment'])
  }

}
