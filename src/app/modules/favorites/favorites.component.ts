import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../service/supabase.service';
import { ClinicDetailsComponent } from '../details/clinic-details/clinic-details.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { FavoriteDetailsComponent } from '../details/favorite-details/favorite-details.component';
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
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss'],
})
export class FavoritesComponent implements OnInit {
  clinics: any[] = [];
  favoriteClinics: any[] = [];
  displayedClinics: any[] = [];
  lastTwoClinics: any[] = [];
  clinicFeatures: Clinic[] = [];
  clinic: any;
  loading: boolean = false;
  clinicsFound: boolean = false;
  isHovered: boolean = false;

  constructor(
    private supabaseService: SupabaseService,
    private dialog: MatDialog,
    private initialRecommendService: InitialRecommendService,
    private cdr: ChangeDetectorRef,
  ) {
  }

  ngOnInit(): void {
    // Fetch and display user's favorite clinics when the component initializes
    this.loadClinics();
    // this.loadClinicFeatures();
    // this.loadAdditionalClinicDetails();

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
      const currentUser = await this.supabaseService.getAuthStateSnapshot();

      // Check if there is a logged-in user
      if (currentUser) {
        // Fetch the user ID from users_tbl based on the email
        const { data: userData, error: userError } = await this.supabaseService
          .getSupabase()
          .from('users_tbl')
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
                .from('favorites_tbl')
                .select('*')
                .eq('fvUsers_id', userId);

            if (clinicsError) {
              console.error('Error fetching clinics:', clinicsError);
            } else {
              this.clinics = clinicsData || [];
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

  deleteClinic(clinic: any): void {
    // Use SweetAlert to confirm deletion
    Swal.fire({
      title: 'Remove this to your Favorites?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3f51b5',
      confirmButtonText: 'Yes, remove it!',
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
        .from('favorites_tbl')
        .delete()
        .eq('id', clinicId);

      if (deleteError) {
        console.error('Error deleting clinic:', deleteError);
        // Handle error appropriately
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Clinic Removed Successfully',
          text: 'The clinic has been removed from favorites.',
        });

        // await this.generateRecommendations();
      }
    } catch (error) {
      console.error('Error:', error);
      // Handle error appropriately
    }
  }

  popSeeMoreDetails(clinic: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = window.innerWidth > 768 ? '55%' : '90%';
    dialogConfig.height = window.innerHeight > 768 ? 'auto' : '90%';
    dialogConfig.data = { clinic: clinic };

    const dialogRef = this.dialog.open(FavoriteDetailsComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      // Handle any actions after the dialog is closed, if needed
    });
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
                      this.initialRecommendService.setMatchedClinics(matchedClinics);

                      // Sort clinics based on the similarity score in descending order
                      matchedClinics.sort(
                        (a, b) =>
                          (b.similarity !== undefined ? b.similarity : 0) -
                          (a.similarity !== undefined ? a.similarity : 0)
                      );

                      // Assign final ranks based on the sorted order
                      matchedClinics.forEach((clinic, index) => {
                        clinic.rank = index + 1;
                      });

                      const recommendedClinics =
                        this.recommendClinics(matchedClinics);

                      console.log('Matched Clinics:', matchedClinics);
                      console.log('Recommended Clinics:', recommendedClinics);

                      this.clinics = matchedClinics.map((clinic) => ({
                        ...clinic,
                        similarity: undefined,
                      }));
                      this.clinicsFound = matchedClinics.length > 0;

                      this.lastTwoClinics = recommendedClinics.map((clinic) => ({
                        ...clinic,
                        similarity: undefined,
                      }));

                      this.loading = false;
                      this.clinicsFound = matchedClinics.length > 0;

                      this.cdr.detectChanges();

                      // save to favMatched_tbl
                      await this.saveFavMatchedClinics(matchedClinics);
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

  matchClinicsContentBased(userPreferences: UserPrefs): Clinic[] {
    const matchedClinics: Clinic[] = [];

    this.clinicFeatures.forEach((clinic, index) => {
      const matchCount = this.countMatches(clinic, userPreferences);
      if (matchCount > 0) {
        matchedClinics.push({ ...clinic, matchCount, rank: index + 1 });
      }
    });

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
            // .eq('fvUsers_id', userId);
    
            if (!clinicsData.error) {
              const { data: clinicsData, error: clinicsError } =
              await this.supabaseService
                .getSupabase()
                .from('favorites_tbl')
                .select('*')
                .eq('fvUsers_id', userId);
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
