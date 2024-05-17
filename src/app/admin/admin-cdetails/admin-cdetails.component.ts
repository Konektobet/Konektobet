import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from 'src/app/service/supabase.service';

export interface Review {
  user: string;
  timestamp: Date | string;
  content: string;
  serviceRating?: number,
  facilityRating?: number,
  priceRating?: number,
}

export interface RecommendedClinics {
  name: string;
  address: string;
  image: string;
}

interface Clinic {
  id: any
  matchCount: any;
  adService: string;
  adSchedule: string;
  // cHealthcare: string;
  similarity?: number;
  rank?: number;
  adName: string;
  adAddress: string;
  adEmail: string;
  adNumber: string;
  adVet: string;
  adLink: string;
  adGrmPrice: string;
  adLabPrice: string;
  adSrgPrice: string;
  adTime: string;
}

interface UserPrefs{
  favService: string;
  favSchedule: string;
}


@Component({
  selector: 'app-admin-cdetails',
  templateUrl: './admin-cdetails.component.html',
  styleUrls: ['./admin-cdetails.component.scss']
})
export class AdminCdetailsComponent implements OnInit{
  images: string[] = [];  // Array to store image filenames
  currentImageIndex = 0;  // Index to display the current image
  businessPermit = '';
  healthSafety = '';
  vetPractice = '';
  permApps = '';

  file!: File;
  showChooseFile = false;

  firstname!: string;
  lastname!: string;
  email!: string;
  phoneNumber!: string;
  
  selectedServices: string[] = [];
  selectedSchedules: string[] = [];

  reviews: Review[] = [];
  recommendedClinics: RecommendedClinics[] = [];
  newReview: Review | string = '';
  newRating: number | undefined;
  showAllReviews: boolean = false;

  // clinic
  clinics: any[] = [];
  clinicFeatures: Clinic[] = [];
  clinic: any;

  // favorites
  isFavorite: boolean = false;
  addedToFavorites: boolean = false;

  last: boolean = false;
  loading: boolean = false;
  clinicsFound: boolean = false;
  lastTwoClinics: any[] = [];

  overallRating: number = 0;
  overallServiceRating: number = 0;
  overallFacilityRating: number = 0;
  overallPriceRating: number = 0;

  clinicForm!: FormGroup;
  isEditable = false;

  constructor(
    private supabaseService: SupabaseService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
  ){
    // this.clinic = data.clinic;
  }

  ngOnInit(): void {
    this.loadUser();
    this.loadClinicDetails();

    this.clinicForm = this.formBuilder.group({
      adName: ['', Validators.required],
      adAddress: ['', Validators.required],
      adNumber: ['', Validators.required],
      adEmail: ['', Validators.required],
      adLink: ['', Validators.required],
      adGrmPrice: ['', Validators.required],
      adLabPrice: ['', Validators.required],
      adSrgPrice: ['', Validators.required],
      adTime: ['', Validators.required],
      adService: ['', Validators.required],
      adSchedule: ['', Validators.required],
      adCoordinates: ['', Validators.required],
      adLongitude: ['', Validators.required],
      adLatitude: ['', Validators.required],
    });

    this.getBusinessPermit();
    this.getHealthSafety();
    this.getVetPractice();
    this.getPermApps();
  }

  backToClinics(){
    this.router.navigate(['/admin/admin-home'])
  }
  
  // accept clinic
  async acceptClinic() {
    try {
      // Get the currently logged-in user's information
      const currentUser = this.supabaseService.getClinicAuthStateSnapshot();
  
      // Check if there is a logged-in user
      if (currentUser) {
        // Fetch the user ID from clinic_users_tbl based on the email
        const { data: userData, error: userError } =
          await this.supabaseService
            .getSupabase()
            .from('admin_users_tbl')
            .select('id')
            .eq('email', currentUser.email);
  
        if (userError) {
          console.error('Error fetching user data:', userError);
          // Handle error appropriately
        } else {
          if (userData && userData.length > 0) {
            // Fetch the details of the clinic to be approved from admin_clinic_tbl
            const { data: clinicData, error: clinicError } =
              await this.supabaseService
                .getSupabase()
                .from('admin_clinic_tbl')
                .select('*')
                .eq('id', this.clinic.id);
  
            if (clinicError) {
              console.error('Error fetching clinic details:', clinicError);
              return; // Exit the function if there's an error fetching clinic details
            }
  
            // Extract necessary clinic details
            const clinicDetails = {
              // cUsers_id: this.clinic.adUsers_id,
              // cService: clinicData[0].adService,
              // cSchedule: clinicData[0].adSchedule,
              // cName: clinicData[0].adName,
              // cAddress: clinicData[0].adAddress,
              // cNumber: clinicData[0].adNumber,
              // cEmail: clinicData[0].adEmail,
              // cLink: clinicData[0].adLink,
              // cGrmPrice: clinicData[0].adGrmPrice,
              // cLabPrice: clinicData[0].adLabPrice,
              // cSrgPrice: clinicData[0].adSrgPrice,
              // cTime: clinicData[0].adTime,
              // cSTime: clinicData[0].adSTime,
              // cETime: clinicData[0].adETime,
              ...this.clinic.clinicForm.value,
              cUsers_id: this.clinic.adUsers_id,
            };
  
            // Insert data into 'clinic_tbl' table
            const { data: insertData, error: insertError } =
              await this.supabaseService
                .getSupabase()
                .from('clinic_tbl')
                .insert([clinicDetails]);
            
            if (insertError) {
              console.error('Error inserting clinic:', insertError);
              // Handle error appropriately
            } else {
              console.log('Clinic added successfully:', insertData);

              const { data: insertNewData, error: insertNewError } =
              await this.supabaseService
                .getSupabase()
                .from('admin_clinic_tbl')
                .select('*')
                .eq('id', this.clinic.id);

                if (insertNewError) {
                  console.error('Error fetching clinic details:', insertNewError);
                  return; // Exit the function if there's an error fetching clinic details
                }

                // Extract necessary clinic details
                const clinicDetails = {
                  acUsers_id: this.clinic.adUsers_id,
                  acService: insertNewData[0].adService,
                  acSchedule: insertNewData[0].adSchedule,
                  acName: insertNewData[0].adName,
                  acAddress: insertNewData[0].adAddress,
                  acNumber: insertNewData[0].adNumber,
                  acEmail: insertNewData[0].adEmail,
                  acLink: insertNewData[0].adLink,
                  acGrmPrice: insertNewData[0].adGrmPrice,
                  acLabPrice: insertNewData[0].adLabPrice,
                  acSrgPrice: insertNewData[0].adSrgPrice,
                  acTime: insertNewData[0].adTime,
                  acSTime: insertNewData[0].adSTime,
                  acETime: insertNewData[0].adETime,
                  acCoordinates: insertNewData[0].adCoordinates,
                  acLongitude: insertNewData[0].adLongitude,
                  acLatitude: insertNewData[0].adLatitude,
                };

              // Insert the clinic details into 'admin_accepted_tbl'
              const { data: acceptData, error: acceptError } =
                await this.supabaseService
                  .getSupabase()
                  .from('admin_accepted_tbl')
                  .insert([clinicDetails]);
  
              if (acceptError) {
                console.error('Error inserting into admin_accepted_tbl:', acceptError);
                // Handle error appropriately
              } else {
                console.log('Clinic details inserted into admin_accepted_tbl:', acceptData);
                Swal.fire({
                  icon: 'success',
                  title: 'Clinic Approved!',
                  text: 'The clinic has been approved successfully!',
                });

                const { data: deleteData, error: deleteError } = await this.supabaseService.getSupabase()
                .from('admin_clinic_tbl')
                .delete()
                .eq('id', this.clinic.id)

                if(deleteError){
                  console.log('Deleting error', deleteError)
                } else{
                  console.log('Deleted successfully')
                }

                this.router.navigate(['admin/admin-home']);
              }
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
        text: 'An error occurred while adding the clinic. Please try again.',
      });
    }
  }

  // reject cllinic
  async rejectClinic() {
    try {
      // Show a confirmation dialog using SweetAlert
      const confirmation = await Swal.fire({
        title: 'Are you sure?',
        text: 'You are about to reject this clinic. This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Reject',
        cancelButtonText: 'Cancel'
      });

      // Proceed with rejection if the user confirms
      if (confirmation.isConfirmed) {
        // Get the currently logged-in user's information
        const currentUser = this.supabaseService.getClinicAuthStateSnapshot();

        // Check if there is a logged-in user
        if (currentUser) {
          // Fetch the user ID from admin_users_tbl based on the email
          const { data: userData, error: userError } = await this.supabaseService
            .getSupabase()
            .from('admin_users_tbl')
            .select('id')
            .eq('email', currentUser.email);

          if (userError) {
            console.error('Error fetching user data:', userError);
            // Handle error appropriately
          } else {
            if (userData && userData.length > 0) {
              // Fetch the details of the clinic to be approved from admin_clinic_tbl
              const { data: clinicData, error: clinicError } = await this.supabaseService
                .getSupabase()
                .from('admin_clinic_tbl')
                .select('*')
                .eq('id', this.clinic.id);

              if (clinicError) {
                console.error('Error fetching clinic details:', clinicError);
                return; // Exit the function if there's an error fetching clinic details
              }

              // Extract necessary clinic details
              const clinicDetails = {
                arUsers_id: this.clinic.adUsers_id,
                arService: clinicData[0].adService,
                arSchedule: clinicData[0].adSchedule,
                arName: clinicData[0].adName,
                arAddress: clinicData[0].adAddress,
                arNumber: clinicData[0].adNumber,
                arEmail: clinicData[0].adEmail,
                arLink: clinicData[0].adLink,
                arPrice: clinicData[0].adPrice,
                arTime: clinicData[0].adTime,
                arCoordinates: clinicData[0].adCoordinates,
                arStatus: 'Clinic Rejected',
              };

              // Insert data into 'admin_rejected_tbl' table
              const { data: insertData, error: insertError } = await this.supabaseService
                .getSupabase()
                .from('admin_rejected_tbl')
                .insert([clinicDetails]);

              if (insertError) {
                console.error('Error inserting clinic:', insertError);
                // Handle error appropriately
              } else {
                console.log('Clinic added successfully:', insertData);

                console.log('Clinic details inserted into rejected');
                Swal.fire({
                  icon: 'success',
                  title: 'Clinic Rejected!',
                  text: 'The clinic has been rejected successfully!',
                });

                // Delete the rejected clinic from 'admin_clinic_tbl'
                const { data: deleteData, error: deleteError } = await this.supabaseService.getSupabase()
                  .from('admin_clinic_tbl')
                  .delete()
                  .eq('id', this.clinic.id);

                if (deleteError) {
                  console.log('Deleting error', deleteError);
                } else {
                  console.log('Deleted successfully');
                }

                this.router.navigate(['admin/admin-home']);
              }
            } else {
              console.error('No user data found for the logged-in user.');
            }
          }
        } else {
          console.error('No logged-in user found.');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while rejecting the clinic. Please try again.'
      });
    }
  }

  // user
  async loadUser() {
    try {
      const currentUser = this.supabaseService.getAuthStateSnapshot();
  
      if (currentUser) {
        const { data: userData, error: userError } = await this.supabaseService
          .getSupabase()
          .from('admin_users_tbl')
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

  async loadClinicDetails() {
    try {
      const clinicId = this.route.snapshot.params['id'];
  
      // Fetch clinic details from Supabase based on the clinic ID
      const { data: clinicData, error } = await this.supabaseService
        .getSupabase()
        .from('admin_clinic_tbl')
        .select('*')
        .eq('id', clinicId)
        .single();
  
      if (error) {
        console.error('Error fetching clinic details:', error);
      } else {
        // Update the clinic property with the fetched clinic data
        this.clinic = clinicData || [];

        this.clinicForm.patchValue({
          adName: this.clinic.adName || '',
          adAddress: this.clinic.adAddress || '',
          adNumber: this.clinic.adNumber || '',
          adEmail: this.clinic.adEmail || '',
          adLink: this.clinic.adLink || '',
          adGrmPrice: this.clinic.adGrmPrice || '',
          adLabPrice: this.clinic.adLabPrice || '',
          adSrgPrice: this.clinic.adSrgPrice || '',
          adTime: this.clinic.adTime || '',
          adService: this.clinic.adService || '',
          adSchedule: this.clinic.adSchedule || '',
          adCoordinates: this.clinic.adCoordinates || '',
          adLongitude: this.clinic.adLongitude || '',
          adLatitude: this.clinic.adLatitude || '',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      // Handle error appropriately
    }
  }

  async getBusinessPermit() {
    try {
      const currentUser = this.supabaseService.getClinicAuthStateSnapshot();
      const clinicId = this.route.snapshot.params['id'];
  
      if (currentUser) {
        // Fetch clinic data including the necessary fields (e.g., id, adName)
        const { data: clinicData, error: clinicError } = await this.supabaseService
          .getSupabase()
          .from('admin_clinic_tbl')
          .select('adName')
          .eq('id', clinicId)
          .single();
          console.log('clinic name:',clinicData)
  
        if (clinicError) {
          console.error('Error fetching clinic data:', clinicError);
          return;
        }
  
        if (!clinicData) {
          console.error('Clinic data not found for the current user.');
          return;
        }
  
        // Construct the filename using clinic data
        const filename = `${clinicData.adName}_businessPermit`;
        console.log('filename:', filename)
        // Fetch the business permit image
        const { data: fetchData, error: fetchError } = await this.supabaseService
          .getSupabase()
          .storage
          .from('documents')
          .download(filename);
  
        if (fetchError) {
          console.error('Error fetching business permit:', fetchError);
          return;
        }
  
        if (fetchData) {
          // Set the URL for the image
          this.businessPermit = URL.createObjectURL(fetchData);
          console.log(this.businessPermit)
        } else {
          console.error('Business permit not found:', filename);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async getHealthSafety() {
    try {
      const currentUser = this.supabaseService.getClinicAuthStateSnapshot();
      const clinicId = this.route.snapshot.params['id'];
  
      if (currentUser) {
        // Fetch clinic data including the necessary fields (e.g., id, adName)
        const { data: clinicData, error: clinicError } = await this.supabaseService
          .getSupabase()
          .from('admin_clinic_tbl')
          .select('adName')
          .eq('id', clinicId)
          .single();
          console.log('clinic name:',clinicData)
  
        if (clinicError) {
          console.error('Error fetching clinic data:', clinicError);
          return;
        }
  
        if (!clinicData) {
          console.error('Clinic data not found for the current user.');
          return;
        }
  
        // Construct the filename using clinic data
        const filename = `${clinicData.adName}_healthSafety`;
        console.log('filename:', filename)
        // Fetch the business permit image
        const { data: fetchData, error: fetchError } = await this.supabaseService
          .getSupabase()
          .storage
          .from('documents')
          .download(filename);
  
        if (fetchError) {
          console.error('Error fetching business permit:', fetchError);
          return;
        }
  
        if (fetchData) {
          // Set the URL for the image
          this.healthSafety = URL.createObjectURL(fetchData);
          console.log(this.healthSafety)
        } else {
          console.error('Business permit not found:', filename);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async getVetPractice() {
    try {
      const currentUser = this.supabaseService.getClinicAuthStateSnapshot();
      const clinicId = this.route.snapshot.params['id'];
  
      if (currentUser) {
        // Fetch clinic data including the necessary fields (e.g., id, adName)
        const { data: clinicData, error: clinicError } = await this.supabaseService
          .getSupabase()
          .from('admin_clinic_tbl')
          .select('adName')
          .eq('id', clinicId)
          .single();
          console.log('clinic name:',clinicData)
  
        if (clinicError) {
          console.error('Error fetching clinic data:', clinicError);
          return;
        }
  
        if (!clinicData) {
          console.error('Clinic data not found for the current user.');
          return;
        }
  
        // Construct the filename using clinic data
        const filename = `${clinicData.adName}_vetPractice`;
        console.log('filename:', filename)
        // Fetch the business permit image
        const { data: fetchData, error: fetchError } = await this.supabaseService
          .getSupabase()
          .storage
          .from('documents')
          .download(filename);
  
        if (fetchError) {
          console.error('Error fetching business permit:', fetchError);
          return;
        }
  
        if (fetchData) {
          // Set the URL for the image
          this.vetPractice = URL.createObjectURL(fetchData);
          console.log(this.vetPractice)
        } else {
          console.error('Business permit not found:', filename);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async getPermApps() {
    try {
      const currentUser = this.supabaseService.getClinicAuthStateSnapshot();
      const clinicId = this.route.snapshot.params['id'];
  
      if (currentUser) {
        // Fetch clinic data including the necessary fields (e.g., id, adName)
        const { data: clinicData, error: clinicError } = await this.supabaseService
          .getSupabase()
          .from('admin_clinic_tbl')
          .select('adName')
          .eq('id', clinicId)
          .single();
          console.log('clinic name:',clinicData)
  
        if (clinicError) {
          console.error('Error fetching clinic data:', clinicError);
          return;
        }
  
        if (!clinicData) {
          console.error('Clinic data not found for the current user.');
          return;
        }
  
        // Construct the filename using clinic data
        const filename = `${clinicData.adName}_perApps`;
        console.log('filename:', filename)
        // Fetch the business permit image
        const { data: fetchData, error: fetchError } = await this.supabaseService
          .getSupabase()
          .storage
          .from('documents')
          .download(filename);
  
        if (fetchError) {
          console.error('Error fetching business permit:', fetchError);
          return;
        }
  
        if (fetchData) {
          // Set the URL for the image
          this.permApps = URL.createObjectURL(fetchData);
          console.log(this.permApps)
        } else {
          console.error('Business permit not found:', filename);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
}


