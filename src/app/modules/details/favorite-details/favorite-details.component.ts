import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { SupabaseService } from '../../../service/supabase.service';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { InitialRecommendService } from 'src/app/service/initial-recommend.service';
import { MakeAppointmentComponent } from '../../make-appointment/make-appointment.component';
import { RatingsComponent } from '../../ratings/ratings.component';

interface UserPreferences {
  fService: string;
  // fHealthcare: string;
  fSchedule: string;
  // Add other properties as needed
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

export interface Review {
  user: string;
  timestamp: Date | string;
  content: string;
  serviceRating?: number,
  facilityRating?: number,
  priceRating?: number,
}

interface UserPrefs{
  favService: string;
  favSchedule: string;
}

@Component({
  selector: 'app-favorite-details',
  templateUrl: './favorite-details.component.html',
  styleUrls: ['./favorite-details.component.scss']
})
export class FavoriteDetailsComponent implements OnInit{
  clinics: any[] = [];
  clinicFeatures: Clinic[] = [];
  clinic: any;

  selectedServices: string[] = [];
  selectedSchedules: string[] = [];
  // selectedHealthcares: string[] = [];

  recommendedClinics: Clinic[] = [];

  matchedClinics: any[] = [];
  loading: boolean = false;
  clinicsFound: boolean = false;
  stepper: any;

  lastTwoClinics: any[] = [];
  favoriteClinics: any;
  isFavorite: boolean = false;
  isDeleted: boolean = false;

  reviews: Review[] = [];
  newReview: Review | string = '';
  newRating: number | undefined;

  // user
  firstname!: string;
  lastname!: string;
  email!: string;
  phoneNumber!: string;

  images: string[] = [];  
  currentImageIndex = 0;  
  url = '';
  file!: File;
  showChooseFile = false;

  last: boolean = false;
  overallRating: number = 0;
  overallServiceRating: number = 0;
  overallFacilityRating: number = 0;
  overallPriceRating: number = 0;
  constructor(
    private supabaseService: SupabaseService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private initialRecommendService: InitialRecommendService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ){
    // this.clinic = data.clinic;
  }

  ngOnInit(): void {
    this.loadUser();

    // profile picture
    this.fetchAllImages();
    this.loadReviews()
    this.loadClinicFeatures();
    this.loadClinicDetails();

    this.route.params.subscribe((params) => {
      const clinicId = params['id'];
      // console.log('Clinic ID:', clinicId);
      this.loadAdditionalClinicDetails(clinicId);
    });
  }

  backToFavorites(){
    this.router.navigate(['/favorites'])
  }

  shouldDisplayBreak(index: number, services: string): boolean {
    const serviceArray = services.split(';');
    return index >= 3 && serviceArray.length > 3;
  }

  // user
  async loadUser() {
    try {
      const currentUser = this.supabaseService.getAuthStateSnapshot();
  
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
            this.firstname = userData.firstname;
            this.lastname = userData.lastname;
            this.phoneNumber = userData.phoneNumber;
            this.email = userData.email;
  
            // Fetch user preferences from the interest_tbl
            const { data: userPrefsData, error: userPrefsError } =
              await this.supabaseService
                .getSupabase()
                .from('interests_tbl')
                .select('*')
                .eq('iUsers_id', userData.id)
                .single();
  
            if (userPrefsError) {
              console.error('Error fetching user preferences:', userPrefsError);
            } else {
              if (userPrefsData) {
                // Update component properties with user preferences
                this.selectedServices = userPrefsData.iService.split(', ');
                // this.selectedHealthcares = userPrefsData.iHealthcare.split(', ');
                this.selectedSchedules = userPrefsData.iSchedule.split(', ');
              }
            }
          } else {
            console.error('No user data found for the logged-in user.');
          }
        }
      } else {
        console.log('No logged-in user');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // clinics
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

  async loadAdditionalClinicDetails(clinicId: any) {
    try {
      // Continue only if clinicId is defined
      if (clinicId) {
        // Fetch additional details from Supabase
        const { data: additionalDetails, error } = await this.supabaseService
          .getSupabase()
          .from('clinic_tbl') // Update with the correct table name
          .select('*')
          .eq('id', clinicId); // Update with the correct identifier
  
          console.log('load add enw', additionalDetails)

        if (error) {
          console.error('Error fetching additional clinic details:', error);
        } else {
          // Merge the additional details with the existing clinic data
          this.clinic = { ...this.clinic, ...additionalDetails };
        }
      }
    } catch (error) {
      console.error('Error:', error);
      // Handle error appropriately
    }
  }

  async loadClinicDetails() {
    try {
      const clinicId = this.route.snapshot.params['id'];
  
      // Fetch clinic details from Supabase based on the clinic ID
      const { data: clinicData, error } = await this.supabaseService
        .getSupabase()
        .from('clinic_tbl')
        .select('*')
        .eq('id', clinicId)
        .single();
  
      if (error) {
        console.error('Error fetching clinic details:', error);
      } else {
        // Update the clinic property with the fetched clinic data
        this.clinic = clinicData;
  
        // Check if the clinic is in favorites
        await this.checkIfInFavorites(clinicId);
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
  
            // Extract necessary clinic details
            const clinicDetails = {
              fvUsers_id: userData[0].id,
              fvClinic_id: clinicData[0].id,
              fvService: clinicData[0].cService,
              fvSchedule: clinicData[0].cSchedule,
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
  
            // Check if the clinic is already in favorites
            const { data: existingData, error: existingError } =
              await this.supabaseService
                .getSupabase()
                .from('favorites_tbl')
                .select('*')
                .eq('fvUsers_id', userData[0].id)
                .eq('fvClinic_id', clinicData[0].id);
  
            if (existingError) {
              console.error('Error checking existing favorites:', existingError);
              return;
            }
  
            if (existingData && existingData.length > 0) {
              // The clinic is already in favorites, so remove it
              const { data: removeData, error: removeError } =
                await this.supabaseService
                  .getSupabase()
                  .from('favorites_tbl')
                  .delete()
                  .eq('fvUsers_id', userData[0].id)
                  .eq('fvClinic_id', clinicData[0].id);
  
              if (removeError) {
                console.error('Error removing from favorites:', removeError);
              } else {
                console.log('Removed from favorites successfully:', removeData);
                Swal.fire({
                  icon: 'success',
                  title: 'Successfully removed from favorites!',
                  text: 'The clinic has been removed from favorites.',
                });
  
                // Set isFavorite to false to show the "Add to favorites" button
                this.isFavorite = false;
              }
            } else {
              // The clinic is not in favorites, so add it
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
  
                // Set isFavorite to true to hide the "Add to favorites" button
                this.isFavorite = true;

                await this.generateRecommendations();
              }
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

  async checkIfInFavorites(clinicId: any): Promise<void> {
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
  
            const { data, error } = await this.supabaseService
              .getSupabase()
              .from('favorites_tbl')
              .select('*')
              .eq('fvUsers_id', userId)
              .eq('fvClinic_id', clinicId);
  
            if (error) {
              console.error('Error checking favorites:', error);
            } else {
              // Update isFavorite based on whether the clinic is in favorites or not
              this.isFavorite = data && data.length > 0; // Check if data is not empty
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking favorites:', error);
    }
  }

  // delete to favorites
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
        .eq('fvClinic_id', clinicId);
        console.log(clinicId)

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

  // appointment
  makeAppointment() {
    const currentUser = this.supabaseService.getAuthStateSnapshot();

    if (!currentUser) {
      // User is not logged in, redirect to the login page
      this.router.navigate(['/login']);
      return;
    }

    const dialogRef = this.dialog.open(MakeAppointmentComponent, {
      width: 'auto', // Adjust width as needed
      height: 'auto', // Adjust height as needed
      data: { clinic: this.clinic },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      // Handle any actions after the dialog is closed, if needed
    });
  }

  // reviews
  async loadReviews() {
    try {
      await this.loadUser();
      const clinicId = this.route.snapshot.params['id'];
      console.log("load reviews id",clinicId) 
      // Fetch reviews from Supabase based on the clinic ID
      const { data: reviewsData, error } = await this.supabaseService
        .getSupabase()
        .from('ratesReviews_tbl')
        .select('*')
        .eq('rrClinic_id', clinicId)
        .order('timestamp', { ascending: false });

        console.log(reviewsData)

      if (error) {
        console.error('Error fetching reviews:', error);
      } else {
        // Update the reviews property with the fetched reviews data
        this.reviews = reviewsData || [];
         // Calculate overall rating
        this.calculateOverallRating();
      }
    } catch (error) {
      console.error('Error:', error);
      // Handle error appropriately
    }
  }

  calculateOverallRating() {
    let totalServiceRating = 0;
    let totalFacilityRating = 0;
    let totalPriceRating = 0;
    let totalReviews = this.reviews.length;
  
    // Check if there are reviews to avoid division by zero
    if (totalReviews > 0) {
      // Sum up all the ratings for service, facility, and price
      for (let review of this.reviews) {
        if (
          review.serviceRating !== undefined &&
          review.facilityRating !== undefined &&
          review.priceRating !== undefined
        ) {
          totalServiceRating += review.serviceRating;
          totalFacilityRating += review.facilityRating;
          totalPriceRating += review.priceRating;
        }
      }
  
      // Calculate average ratings for service, facility, and price
      let overallServiceRating = totalServiceRating / totalReviews;
      let overallFacilityRating = totalFacilityRating / totalReviews;
      let overallPriceRating = totalPriceRating / totalReviews;
  
      // Round to 1 decimal place
      overallServiceRating = parseFloat(overallServiceRating.toFixed(1));
      overallFacilityRating = parseFloat(overallFacilityRating.toFixed(1));
      overallPriceRating = parseFloat(overallPriceRating.toFixed(1));
  
      // Update overallRating properties
      this.overallServiceRating = overallServiceRating;
      this.overallFacilityRating = overallFacilityRating;
      this.overallPriceRating = overallPriceRating;
  
      console.log('Overall Service Rating:', this.overallServiceRating);
      console.log('Overall Facility Rating:', this.overallFacilityRating);
      console.log('Overall Price Rating:', this.overallPriceRating);
    } else {
      // If there are no reviews, set overall ratings to 0
      this.overallServiceRating = 0;
      this.overallFacilityRating = 0;
      this.overallPriceRating = 0;
    }
  }
  
  getStarArray(numStars: number): number[] {
    return Array.from({ length: numStars }, (_, index) => index + 1);
  }
  
  getMappedStars(rating: number): number {
    // Map the ratings accordingly
    const starMapping: { [key: number]: number } = {
      5: 1,
      4: 2,
      3: 3,
      2: 4,
      1: 5,
    };
    
    return starMapping[rating] || 0;
  }


  // generate clinic recommendation based on favorites
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
    console.log('Fetching image:', filename);

    const { data, error } = await this.supabaseService.getSupabase().storage
      .from('userProfile')
      .download(filename);

    console.log('Fetch result:', data, error);

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

  async onSelectFile(e: any) {
    if (e.target.files) {
      this.file = e.target.files[0];

      // Use a timestamp as a dynamic filename to make it unique
      const filename = `upload_${Date.now()}_${this.file.name}`;

      // Include the user's ID in the filename to make it unique to the user
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
            const uniqueFilename = `${userId}_${filename}`;

            // Fetch the current image filename
            const { data: currentImage, error: currentImageError } = await this.supabaseService.getSupabase().storage
              .from('userProfile')
              .list();

            if (currentImageError) {
              console.error('Error fetching current image:', currentImageError);
              return;
            }

            // Insert the new image
            const { data: uploadData, error: uploadError } = await this.supabaseService.getSupabase().storage
              .from('userProfile')
              .upload(uniqueFilename, this.file as File, {
                cacheControl: '3600',
                upsert: false
              });

            if (uploadError) {
              console.error('Error uploading new image:', uploadError);
              return;
            }

            console.log('New image uploaded successfully:', uploadData);

            // After uploading, fetch all images again to update the displayed images
            this.fetchAllImages();
          }
        }
      }
    }
  }

  changeImage(direction: 'prev' | 'next') {
    // Change the current image index based on the direction
    if (direction === 'prev') {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.images.length) % this.images.length;
    } else if (direction === 'next') {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
    }

    // Display the new current image
    this.displayCurrentImage();
  }

  // ratings
  rateClinic(clinicId: any) {
    const currentUser = this.supabaseService.getAuthStateSnapshot();

    if (!currentUser) {
      // User is not logged in, redirect to the login page
      this.router.navigate(['/login']);
      return;
    }

    const dialogRef = this.dialog.open(RatingsComponent, {
      width: 'auto',
      height: 'auto',
      data: { clinicId: clinicId }, 
    });
  
    dialogRef.componentInstance.ratingSubmitted.subscribe((result: Review) => {
      // Add the new review to the existing reviews array
      this.reviews.push(result);
    });
  
    dialogRef.afterClosed().subscribe(() => {
      // Clear the newReview property after the dialog is closed
      this.newReview = '';
    });
  }
}
