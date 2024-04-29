import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { FindModule } from '../../find/find.module';
import { SupabaseService } from '../../../service/supabase.service';
import { MatDividerModule } from '@angular/material/divider';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { MakeAppointmentComponent } from '../../make-appointment/make-appointment.component';
import { MapsComponent } from '../../maps/maps.component';
import { InitialRecommendService } from 'src/app/service/initial-recommend.service';

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

@Component({
  selector: 'app-clinic-details',
  templateUrl: './clinic-details.component.html',
  styleUrls: ['./clinic-details.component.scss'],
})
export class ClinicDetailsComponent implements OnInit{
  clinics: any[] = [];
  clinicFeatures: Clinic[] = [];
  clinic: any;

  selectedServices: string[] = [];
  selectedSchedules: string[] = [];
  selectedHealthcares: string[] = [];

  recommendedClinics: Clinic[] = [];

  matchedClinics: any[] = [];
  loading: boolean = false;
  clinicsFound: boolean = false;
  stepper: any;

  lastTwoClinics: any[] = [];
  favoriteClinics: any;

  addedToFavorites: boolean = false;
  isFavorite: boolean = false;

  service!: string;
  schedule!: string;
  constructor(
    public dialogRef: MatDialogRef<ClinicDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private supabaseService: SupabaseService,
    private dialog: MatDialog,
    private router: Router,
    private initialRecommendService: InitialRecommendService,
    private cdr: ChangeDetectorRef,
  ) {
    this.clinic = data.clinic;
    this.recommendedClinics = data.recommendedClinics || [];
    this.loadAdditionalClinicDetails();
  }

  async ngOnInit() {
    // this.generateRecommendations();
    this.loadClinicFeatures();
    // this.loadMatchedClinics();
    this.addedToFavorites = await this.isInFavorites(this.clinic);

    if (this.addedToFavorites) {
      this.isFavorite = true;
    }
  }

  onClose(): void {
    this.dialogRef.close();
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
        this.dialogRef.close();
    }

  async loadAdditionalClinicDetails() {
    try {
      // Use the SupabaseService to fetch additional details based on the clinic ID or any other identifier
      const clinicId = this.clinic.id; // Update this based on your clinic object structure
      // Fetch additional details from Supabase
      const { data: additionalDetails, error } = await this.supabaseService
        .getSupabase()
        .from('clinic_tbl') // Update with the correct table name
        .select('*')
        .eq('cUsers_id', clinicId); // Update with the correct identifier
      if (error) {
        console.error('Error fetching additional clinic details:', error);
      } else {
        // Merge the additional details with the existing clinic data
        this.clinic = { ...this.clinic, ...additionalDetails };
      }
    } catch (error) {
      console.error('Error:', error);
      // Handle error appropriately
    }
  }

  // add to favorites
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
                .from('clinic_tbl')
                .select('*')
                .eq('id', this.clinic.id);
  
            console.log(this.clinic.id);
  
            if (clinicError) {
              console.error('Error fetching clinic details:', clinicError);
              return; // Exit the function if there's an error fetching clinic details
            }
  
            // Check if the clinic is already in favorites
            const isInFavorites = await this.isInFavorites(this.clinic);
  
            if (isInFavorites) {
              console.log('Clinic is already in favorites.');
              this.isFavorite = true; // Update the isFavorite property
              return; // Exit the function if the clinic is already in favorites
            }
  
            // Extract necessary clinic details
            const clinicDetails = {
              fvUsers_id: userData[0].id,
              fvClinic_id: clinicData[0].id,
              fvService: clinicData[0].cService,
              fvSchedule: clinicData[0].cSchedule,
              // fvHealthcare: clinicData[0].cHealthcare,
              fvName: clinicData[0].cName,
              fvAddress: clinicData[0].cAddress,
              fvNumber: clinicData[0].cNumber,
              fvEmail: clinicData[0].cEmail,
              fvVet: clinicData[0].cVet,
              fvLink: clinicData[0].cLink,
              fvPrice: clinicData[0].cPrice,
              fvTime: clinicData[0].cTime,
            };
  
            console.log(clinicData[0].id);
  
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
                text: 'The clinic has been added as a favorite.',
              });
  
              this.addedToFavorites = true;
              this.disableAddToFavoritesButton();
  
              // Set the flag to reload all clinics if adding from the Clinic tab
              this.initialRecommendService.setReloadAllClinics(true);
  
              await this.generateRecommendations();
            }
          } else {
            console.error('No user data found for the logged-in user.');
          }
        }
      } else {
        // Handle the case where no user is logged in
        this.router.navigate(['/login']);
        this.dialogRef.close();
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

  async popSeeMoreDetails(clinic: any) {
    const dialogRef = this.dialog.open(ClinicDetailsComponent, {
      width: '50%',
      height: 'auto',
      data: { clinic: clinic },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      // Handle any actions after the dialog is closed, if needed
    });
  }

  openMap(event: Event, address: string) {
    event.preventDefault(); 
    const encodedAddress = encodeURIComponent(address);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`; 
    this.dialog.open(MapsComponent, {
      width: '50%',
      height: 'auto',
      data: { url: url, clinicAddress: address }, // Pass the clinic address
    });
  }

  isServiceSelected(service: string): boolean {
    return this.selectedServices.includes(service);
  }
  
  isScheduleSelected(schedule: string): boolean {
    return this.selectedSchedules.includes(schedule);
  }

  async generateRecommendations() {
    try {
      const currentUser = this.supabaseService.getAuthStateSnapshot();
  
      if (currentUser) {
        const { data: userData, error: userError } = await this.supabaseService
          .getSupabase()
          .from('users_tbl')
          .select('*')
          .eq('email', currentUser.email)
  
        if (userError) {
          console.error('Error fetching user data:', userError);
        } else {
          if (userData) {
            const userId = userData[0].id;
  
            // Fetch all user preferences from favorites_tbl
            const { data: favoritesData, error: favoritesError } = await this.supabaseService
              .getSupabase()
              .from('favorites_tbl')
              .select('fvService, fvSchedule') // Adjust based on your actual data structure
              .eq('fvUsers_id', userId);
  
            if (favoritesError) {
              console.error('Error fetching user preferences from favorites:', favoritesError);
            } else {
              if (favoritesData && favoritesData.length > 0) {
                const userPreferencesList = this.createUniqueServicesAndSchedules(favoritesData);

                const userPreferences = {
                  favUsers_id: userId,
                  favService: userPreferencesList[0].favService,
                  favSchedule: userPreferencesList[0].favSchedule,
                }

                console.log(userPreferences)
                
                const { data: deleteData, error: deleteError } = await this.supabaseService
                .getSupabase()
                .from('favRecommend_tbl')
                .delete()
                .eq('favUsers_id', userId)

                if(deleteError){
                  console.error('Error deleting data', deleteError)
                } else {
                  console.log('Deleted successfully');

                  const { data: insertData, error: insertError } = await this.supabaseService
                  .getSupabase()
                  .from('favRecommend_tbl')
                  .insert([userPreferences])

                  if(insertError){
                    console.error('Error inserting user preferences:', insertError)
                  } else {
                    console.log('User preferences added successfuly', insertData);

                    const { data: userPrefsData, error: userPrefsError } = await this.supabaseService
                    .getSupabase()
                    .from('favRecommend_tbl')
                    .select('*')
                    .eq('favUsers_id', userPreferences.favUsers_id)

                    if(userPrefsError){
                      console.error('Error fetching user preferences:', userPrefsError);
                    } else {
                        const matchedClinics =
                      this.matchClinicsContentBased(userPreferences);
                      this.initialRecommendService.setMatchedClinics(await matchedClinics);

                      // Sort clinics based on the similarity score in descending order
                      (await
                        // Sort clinics based on the similarity score in descending order
                        matchedClinics).sort(
                        (a, b) =>
                          (b.similarity !== undefined ? b.similarity : 0) -
                          (a.similarity !== undefined ? a.similarity : 0)
                      );

                      // Assign final ranks based on the sorted order
                      (await
                        // Assign final ranks based on the sorted order
                        matchedClinics).forEach((clinic, index) => {
                        clinic.rank = index + 1;
                      });

                      const recommendedClinics =
                        this.recommendClinics(await matchedClinics);

                      console.log('Matched Clinics:', matchedClinics);
                      console.log('Recommended Clinics:', recommendedClinics);

                      this.clinics = (await matchedClinics).map((clinic) => ({
                        ...clinic,
                        similarity: undefined,
                      }));
                      this.clinicsFound = (await matchedClinics).length > 0;

                      this.lastTwoClinics = recommendedClinics.map((clinic) => ({
                        ...clinic,
                        similarity: undefined,
                      }));

                      this.loading = false;
                      this.clinicsFound = (await matchedClinics).length > 0;

                      this.cdr.detectChanges();

                      // save to favMatched_tbl
                      await this.saveFavMatchedClinics(await matchedClinics);
                    }
                  }
                }
              } else {
                console.error('No favorites found for the user.');
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
    }
  }

  createUniqueServicesAndSchedules(favoritesData: any[]): UserPrefs[] {
    const uniqueServices: Set<string> = new Set();
    const uniqueSchedules: Set<string> = new Set();
  
    // Loop through each favorite and add services and schedules to the sets
    favoritesData.forEach((favorite) => {
      const services: string[] = favorite.fvService ? favorite.fvService.split(',').map((service: string) => service.trim()) : [];
      const schedules: string[] = favorite.fvSchedule ? favorite.fvSchedule.split(',').map((schedule: string) => schedule.trim()) : [];
  
      // Add services and schedules to the sets
      services.forEach((service: string) => uniqueServices.add(service));
      schedules.forEach((schedule: string) => uniqueSchedules.add(schedule));
    });
  
    // Convert sets to arrays and join into strings
    const userPreferencesList: UserPrefs[] = [{
      favService: Array.from(uniqueServices).join(', '),
      favSchedule: Array.from(uniqueSchedules).join(', '),
    }];
  
    return userPreferencesList;
  }

  async saveFavMatchedClinics(matchedFavClinics: Clinic[]){
    try{
      const currentUser = this.supabaseService.getAuthStateSnapshot();

      if(currentUser){
        const { data: userData, error: userError } = await this.supabaseService
        .getSupabase()
        .from('users_tbl')
        .select('id')
        .eq('email', currentUser.email);

        if(userError){
          console.error('Error fetching user data:', userError);
        } else {
          if(userData && userData.length > 0){
            const userId = userData[0].id;

            // delete exisiting favMatched clinics for the user
            const { data: deleteUserData, error: deleteUserError } = await this.supabaseService
            .getSupabase()
            .from('favMatched_tbl')
            .delete()
            .eq('fvmUsers_id', userId);

            if(deleteUserError){
              console.error('Error deleting exisitng favMatched clinics:', deleteUserError);
              return;
            }

            // map the favmatched clincs to the structure of favMatched_tbl
            const matchedFavClinicData = [];

            for (const clinic of matchedFavClinics) {
              const { data: clinicData, error: clinicError } = await this.supabaseService
              .getSupabase()
              .from('clinic_tbl')
              .select('id')
              .eq('cName', clinic.cName);

              if(clinicError){
                console.error('Error fetching clinic data:', clinicError);
                continue;
              }

              if(clinicData && clinicData.length > 0){
                const clinicId = clinicData[0].id;

                matchedFavClinicData.push({
                  fvmUsers_id: userId,
                  fvmClinic_id: clinicId,
                  fvmService: clinic.cService,
                  fvmSchedule: clinic.cSchedule,
                  fvmName: clinic.cName,
                  fvmAddress: clinic.cAddress,
                  fvmEmail: clinic.cEmail,
                  fvmNumber: clinic.cNumber,
                  fvmVet: clinic.cVet,
                  fvmLink: clinic.cLink,
                  fvmPrice: clinic.cPrice,
                  fvmTime: clinic.cTime,
                });
              } else {
                console.error(`No clinic data found for clinic: ${clinic.cName}`);
              }
            }

            // insert the new favMatched clinics
            const { data: insertData, error: insertError} = await this.supabaseService
            .getSupabase()
            .from('favMatched_tbl')
            .insert(matchedFavClinicData);

            if(insertError){
              console.error('Error inserting favMatched clinics:', insertError);
            } else {
              console.log('FavMatched clinics added successfully:', insertData);
            }
          } else {
            console.error('No user data found for the logged-in user.')
          }
        }
      }
    } catch(error) {
      console.error('Error saving matched clinics:', error);
    } finally {
      this.loading = false;
    }
  }

  calculateSimilarity(
    clinic: Clinic,
    userPreferences: UserPrefs
  ): number {
    const serviceIntersection = this.calculateIntersection(
      clinic.cService,
      userPreferences.favService
    );
    // const healthcareIntersection = this.calculateIntersection(
    //   clinic.cHealthcare,
    //   userPreferences.iHealthcare
    // );
    const scheduleIntersection = this.calculateIntersection(
      clinic.cSchedule,
      userPreferences.favSchedule
    );

    const serviceWeight = 2;
    // const healthcareWeight = 2;
    const scheduleWeight = 1;
    const rankWeight = 3; // Adjust the weight for ranking

    // Check for undefined values before using them in calculations
    const clinicRank = clinic.rank !== undefined ? clinic.rank : 0;
    const clinicSimilarity =
      clinic.similarity !== undefined ? clinic.similarity : 0;

      const weightedSimilarity =
      (serviceIntersection * serviceWeight +
        scheduleIntersection * scheduleWeight +
        // healthcareIntersection * healthcareWeight +
        clinicRank * rankWeight) /
      (serviceWeight + scheduleWeight + rankWeight);

    return weightedSimilarity;
}

  calculateIntersection(str1: string, str2: string): number {
    const set1 = new Set(str1.split(', '));
    const set2 = new Set(str2.split(', '));

    const intersection = new Set([...set1].filter((value) => set2.has(value)));

    return intersection.size;
  }

  countMatches(clinic: Clinic, userPreferences: UserPrefs): number {
    let matchCount = 0;

    const services = clinic.cService.split(', ');
    // const healthcares = clinic.cHealthcare.split(', ');
    const schedules = clinic.cSchedule.split(', ');

    // Count matches for services
    matchCount += services.filter((service) =>
      userPreferences.favService.includes(service)
    ).length;

    // Count matches for healthcares
    // matchCount += healthcares.filter((healthcare) =>
    //   userPreferences.iHealthcare.includes(healthcare)
    // ).length;

    // Count matches for schedules
    matchCount += schedules.filter((schedule) =>
      userPreferences.favSchedule.includes(schedule)
    ).length;

    return matchCount;
  }

  async matchClinicsContentBased(userPreferences: UserPrefs): Promise<Clinic[]> {
    const matchedClinics: Clinic[] = [];
  
    // Fetch the user's favorites
    const currentUser = this.supabaseService.getAuthStateSnapshot();
    if (currentUser) {
      const { data: userData, error: userError } = await this.supabaseService
        .getSupabase()
        .from('users_tbl')
        .select('id')
        .eq('email', currentUser.email)
        .single();
  
      if (!userError && userData) {
        const userId = userData.id;
  
        const { data: favoritesData, error: favoritesError } =
          await this.supabaseService
            .getSupabase()
            .from('favorites_tbl')
            .select('fvClinic_id');
  
        if (favoritesError) {
          console.error('Error fetching user favorites:', favoritesError);
          return matchedClinics;
        }
  
        const favoriteClinicIds = favoritesData.map((favorite: any) => favorite.fvClinic_id);
  
        // Iterate through clinicFeatures and filter out clinics that are in favorites
        this.clinicFeatures.forEach((clinic, index) => {
          if (!favoriteClinicIds.includes(clinic.id)) {
            const matchCount = this.countMatches(clinic, userPreferences);
            if (matchCount > 0) {
              matchedClinics.push({ ...clinic, matchCount, rank: index + 1 });
            }
          }
        });
      }
    }
  
    // Sort clinics based on the number of matches in descending order
    matchedClinics.sort((a, b) => b.matchCount - a.matchCount);
  
    // Assign ranks based on the sorted order
    matchedClinics.forEach((clinic, index) => {
      clinic.rank = index + 1;
    });
  
    return matchedClinics;
  }

  recommendClinics(matchedClinics: Clinic[]): Clinic[] {
    const recommendedClinics = this.clinicFeatures
      .filter(
        (clinic) =>
          !matchedClinics.some(
            (matchedClinic) => matchedClinic.cService === clinic.cService 
            // && matchedClinic.cHealthcare === clinic.cHealthcare
          )
      )
      .slice(0, 2); // Limit the recommended clinics to at most three

    return recommendedClinics;
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
  
            // this.supabaseService
            // .getSupabase()
            // .from('clinic_tbl')
            // .select('*')
            // .then(({ data, error }) => {
            //   if (error) {
            //     console.error('Error fetching clinics:', error);
            //   } else {
            //     this.clinics = data;
            //   }
            // });
  
            const userId = userData.id;
  
            // Fetch clinics from the matched_clinics_tbl based on the user ID
            const { data: clinicsData, error: clinicsError } =
              await this.supabaseService
                .getSupabase()
                .from('clinic_tbl')
                .select('*')
                // .eq('mUsers_id', userId);
  
            if (clinicsError) {
              console.error('Error fetching matched clinics:', clinicsError);
            } else {
              this.clinics = clinicsData || [];
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
            .from('clinic_tbl')
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

}
