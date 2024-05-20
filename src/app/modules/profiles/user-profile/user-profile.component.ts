import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, map, startWith } from 'rxjs';
import { SupabaseService } from '../../../service/supabase.service';
import { InitialRecommendService } from '../../../service/initial-recommend.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ClinicDetailsComponent } from '../../details/clinic-details/clinic-details.component';

interface UserPreferences {
  iService: string;
  // iHealthcare: string;
  iSchedule: string;
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
selector: 'app-user-profile',
templateUrl: './user-profile.component.html',
styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {
@Input() vertical!: boolean;

firstname!: string;
lastname!: string;
email!: string;
phoneNumber!: string;

mName!: string;
mAddress!: string;
mEmail!: string;
mNumber!: string;
mVet!: string;
mLink!: string;

clinics: any[] = [];
clinicFeatures: Clinic[] = [];
lastTwoClinics: any[] = [];

serviceControl = new FormControl('');
scheduleControl = new FormControl('');
healthcareControl = new FormControl('');

isEmailEditable = false;
services: string[] = [
  'Confinement',
  'Boarding',
  'Grooming',
  'Pet Supply',
  'Home Service',
  'Deworming',

  'CBC',
  'Blood Chemistry',
  'PCR Test',
  'Treatment',
  'Vaccination',
  'Surgery',
  'Teeth Cleaning',
  'Lab Tests',
  'Ultrasound',
  'Digital Xray',
  'Kapon',
  'Spay',
];
filteredServices!: Observable<string[]>;
selectedServices: string[] = [];

// healthcares: string[] = [
//   'CBC',
//   'Blood Chemistry',
//   'PCR Test',
//   'Treatment',
//   'Vaccination',
//   'Surgery',
//   'Teeth Cleaning',
//   'Lab Tests',
//   'Ultrasound',
//   'Digital Xray',
// ];
// filteredHealthcares!: Observable<string[]>;
// selectedHealthcares: string[] = [];

schedules: string[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
filteredSchedules!: Observable<string[]>;
selectedSchedules: string[] = [];

loading = false;
clinicsFound = false;

// profile picture
images: string[] = [];  // Array to store image filenames
currentImageIndex = 0;  // Index to display the current image
url = '';
file!: File;
showChooseFile = false;

ngOnInit(): void {
  this.loadUser();

  // this.loadClinics();
  this.loadClinicFeatures();
  this.loadMatchedClinics();
  // this.loadMatchedClinicFeatures();
  // Set up filtered observables for chips
  this.filteredServices = this.serviceControl.valueChanges.pipe(
    startWith(''),
    map((value) => this.filterService(value || ''))
  );

  // this.filteredHealthcares = this.healthcareControl.valueChanges.pipe(
  //   startWith(''),
  //   map((value) => this.filterHealthcare(value || ''))
  // );

  this.filteredSchedules = this.scheduleControl.valueChanges.pipe(
    startWith(''),
    map((value) => this.filterSchedule(value || ''))
  );

  // profile picture
  this.fetchAllImages();

}

constructor(
  private supabaseService: SupabaseService,
  private router: Router,
  private cdr: ChangeDetectorRef,
  private dialog: MatDialog,
  private initialRecommendService: InitialRecommendService,

) {}

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

async editUserDetails(): Promise<void> {
  try {
    const currentUser = this.supabaseService.getAuthStateSnapshot();

    if (currentUser) {
      // Fetch the user data to get the user ID
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

          // Update the user details in the database
          const { data: updateData, error: updateError } =
            await this.supabaseService
              .getSupabase()
              .from('users_tbl')
              .update({
                firstname: this.firstname,
                lastname: this.lastname,
                phoneNumber: this.phoneNumber,
              })
              .eq('id', userId);

          if (updateError) {
            console.error('Error updating user details:', updateError);
          } else {
            console.log('User details updated successfully:', updateData);
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

async editClinic() {
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
            iService: this.selectedServices.join(', '),
            // iHealthcare: this.selectedHealthcares.join(', '),
            iSchedule: this.selectedSchedules.join(', '),
          };

          console.log('Updated User Preferences:', userPreferences);

          // delete the user preference
          const { data: deleteData, error: deleteError } = await this.supabaseService
            .getSupabase()
            .from('interests_tbl')
            .delete()
            .eq('iUsers_id', userPreferences.iUsers_id);

          if (deleteError) {
            console.error('Error deleting user preferences:', deleteError);
            return; // Stop execution if delete operation fails
          }

          console.log('User interest deleted successfully');

          // insert new user preferences
          const { data: insertData, error: insertError } =
              await this.supabaseService
                .getSupabase()
                .from('interests_tbl')
                .insert([userPreferences]);

            console.log(userPreferences)
            if (insertError) {
              console.error('Error inserting user preferences:', insertError);
            } else {
              console.log('User preferences added successfully:', insertData);
              // Now you can use userPreferences in the matching algorithm
              // Update: Fetch user preferences before matching
              const { data: userPrefsData, error: userPrefsError } =
                await this.supabaseService
                  .getSupabase()
                  .from('interests_tbl')
                  .select('*')
                  .eq('iUsers_id', userPreferences.iUsers_id);

              if (userPrefsError) {
                console.error(
                  'Error fetching user preferences:',
                  userPrefsError
                );
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

                // save to matched_clinics_tbl
                await this.saveMatchedClinics(matchedClinics);
              }
            }
          } else {
            console.error('No user data found for the logged-in user.');
          }
        }
      } else {
        this.router.navigate(['/login']);
        console.error(
          'No logged-in user found. Redirecting to the login page.'
        );
      }
    } catch (error) {
      this.loading = false;
      console.error('Error:', error);
    }
}

async saveMatchedClinics(matchedClinics: Clinic[]) {
  try {
    const currentUser = this.supabaseService.getAuthStateSnapshot();
    this.loading = true;

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
          const userId = userData[0].id;

          // Delete existing matched clinics for the user
          const { data: deleteUserData, error: deleteUserError } = await this.supabaseService
            .getSupabase()
            .from('matched_clinics_tbl')
            .delete()
            .eq('mUsers_id', userId);

          if (deleteUserError) {
            console.error('Error deleting existing matched clinics:', deleteUserError);
            return;
          }

          // Map the matched clinics to the structure of matched_clinics_tbl
          const matchedClinicsData = [];

          for (const clinic of matchedClinics) {
            const { data: clinicData, error: clinicError } = await this.supabaseService
              .getSupabase()
              .from('clinic_tbl')
              .select('id')
              .eq('cName', clinic.cName); // Assuming cName is a unique identifier for clinics

            if (clinicError) {
              console.error('Error fetching clinic data:', clinicError);
              continue; // Skip to the next iteration if an error occurs
            }

            if (clinicData && clinicData.length > 0) {
              const clinicId = clinicData[0].id;

              matchedClinicsData.push({
                mUsers_id: userId,
                mClinic_id: clinicId,
                mName: clinic.cName,
                mAddress: clinic.cAddress,
                mEmail: clinic.cEmail,
                mNumber: clinic.cNumber,
                mVet: clinic.cVet,
                mLink: clinic.cLink,
                mService: clinic.cService,
                mSchedule: clinic.cSchedule,
                // mHealthcare: clinic.cHealthcare,
                mPrice: clinic.cPrice,
                mTime: clinic.cTime,
              });
            } else {
              console.error(`No clinic data found for clinic: ${clinic.cName}`);
            }
          }

          // Insert the new matched clinics
          const { data: insertData, error: insertError } =
            await this.supabaseService
              .getSupabase()
              .from('matched_clinics_tbl')
              .insert(matchedClinicsData);

          if (insertError) {
            console.error('Error inserting matched clinics:', insertError);
          } else {
            console.log('Matched clinics added successfully:', insertData);
          }
        } else {
          console.error('No user data found for the logged-in user.');
        }
      }
    }
  } catch (error) {
    console.error('Error saving matched clinics:', error);
  } finally {
    this.loading = false;
  }
}

matchClinicsContentBased(userPreferences: UserPreferences): Clinic[] {
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

countMatches(clinic: Clinic, userPreferences: UserPreferences): number {
  let matchCount = 0;

  // Ensure values are defined before splitting
  const services = clinic.cService.split(', ');
  // const healthcares = clinic.cHealthcare.split(', ');
  const schedules = clinic.cSchedule.split(', ');

  // Count matches for services
  matchCount += services.filter((service) => userPreferences.iService.includes(service)).length;

  // Count matches for schedules
  // matchCount += healthcares.filter((healthcare) => userPreferences.iHealthcare.includes(healthcare)).length;

  // Count matches for schedules
  matchCount += schedules.filter((schedule) => userPreferences.iSchedule.includes(schedule)).length;

  return matchCount;
}

calculateSimilarity(
  clinic: Clinic,
  userPreferences: UserPreferences
): number {
  const serviceIntersection = this.calculateIntersection(
    clinic.cService,
    userPreferences.iService
  );
  // const healthcareIntersection = this.calculateIntersection(
  //   clinic.cHealthcare,
  //   userPreferences.iHealthcare
  // );
  const scheduleIntersection = this.calculateIntersection(
    clinic.cSchedule,
    userPreferences.iSchedule
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

recommendClinics(matchedClinics: Clinic[]): Clinic[] {
  const recommendedClinics = this.clinicFeatures
    .filter(
      (clinic) =>
        !matchedClinics.some(
          (matchedClinic) => matchedClinic.cService === clinic.cService
          //  && matchedClinic.cHealthcare === clinic.cHealthcare
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

loadClinics() {
  this.supabaseService
    .getSupabase()
    .from('clinic_tbl')
    .select('*')
    .then(({ data, error }) => {
      if (error) {
        console.error('Error fetching clinics:', error);
      } else {
        this.clinics = data;
      }
    });
}

async loadMatchedClinicFeatures() {
  try {
    const clinicsData = await this.supabaseService
      .getSupabase()
      .from('clinic_tbl')
      .select('*');

    if (!clinicsData.error) {
      this.clinicFeatures = clinicsData.data;
    } else {
      console.error('Error fetching clinic features:', clinicsData.error);
    }
  } catch (error) {
    console.error('Error fetching clinic features:', error);
  }
}

toggleSelectService(service: string): void {
  const index = this.selectedServices.indexOf(service);

  if (index !== -1) {
    // If the service is already selected, unselect it
    this.selectedServices.splice(index, 1);
    console.log(`Service "${service}" is unselected`);
  } else {
    // If the service is not selected, select it
    this.selectedServices.push(service);
    console.log(`Service "${service}" is selected`);
  }
}

// toggleSelectHealthcare(healthcare: string): void {
//   const index = this.selectedHealthcares.indexOf(healthcare);

//   if (index !== -1) {
//     // If the Healthcare is already selected, unselect it
//     this.selectedHealthcares.splice(index, 1);
//     console.log(`Healthcare "${healthcare}" is unselected`);
//   } else {
//     // If the Healthcare is not selected, select it
//     this.selectedHealthcares.push(healthcare);
//     console.log(`Healthcare "${healthcare}" is selected`);
//   }
// }

toggleSelectSchedule(schedule: string): void {
  const index = this.selectedSchedules.indexOf(schedule);

  if (index !== -1) {
    // If the schedule is already selected, unselect it
    this.selectedSchedules.splice(index, 1);
    console.log(`Schedule "${schedule}" is unselected`);
  } else {
    // If the schedule is not selected, select it
    this.selectedSchedules.push(schedule);
    console.log(`Schedule "${schedule}" is selected`);
  }
}

private filterService(value: string): string[] {
  const filterValueService = this.normalizeValue(value);
  return this.services.filter((service) =>
    this.normalizeValue(service).includes(filterValueService)
  );
}

// private filterHealthcare(value: string): string[] {
//   const filterValueHealthcare = this.normalizeValue(value);
//   return this.healthcares.filter((healthcare) =>
//     this.normalizeValue(healthcare).includes(filterValueHealthcare)
//   );
// }

private filterSchedule(value: string): string[] {
  const filterValueSchedule = this.normalizeValue(value);
  return this.schedules.filter((schedule) =>
    this.normalizeValue(schedule).includes(filterValueSchedule)
  );
}

private normalizeValue(value: string): string {
  return value.toLowerCase().replace(/\s/g, '');
}

private resetControl(control: FormControl): void {
  if (control.value !== '') {
    control.reset('');
  }
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
}
