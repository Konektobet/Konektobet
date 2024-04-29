import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { SupabaseService, User } from 'src/app/service/supabase.service';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ReviewService } from 'src/app/service/review.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { InitialRecommendService } from 'src/app/service/initial-recommend.service';
import { EditClinicComponent } from '../../crud/edit-clinic/edit-clinic.component';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Observable } from 'rxjs';

export interface Review {
  user: string;
  timestamp: Date | string;
  content: string;
  serviceRating?: number;
  facilityRating?: number;
  priceRating?: number;
}

export interface RecommendedClinics {
  name: string;
  address: string;
  image: string;
}

interface Clinic {
  id: any;
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

interface UserPrefs {
  favService: string;
  favSchedule: string;
}
@Component({
  selector: 'app-clinic-details',
  templateUrl: './clinic-details.component.html',
  styleUrls: ['./clinic-details.component.scss'],
})
export class ClinicDetailsComponent {
  images: string[] = []; // Array to store image filenames
  currentImageIndex = 0; // Index to display the current image
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

  clinicDays: string[] = [];
  serviceControl = new FormControl();
  filteredServices: Observable<string[]> | undefined;

  formChanged = false;
  initialFormValues: any;
  showForm = true;
  clinicId = this.route.snapshot.params['id'];

  days = new FormControl(['']);
  dayList: string[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  service = new FormControl('');
  services: string[] = [
    'Confinement',
    'Boarding',
    'Grooming',
    'Clinic Supply',
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
  ];

  profile = '';
  cover = '';

  constructor(
    private supabaseService: SupabaseService,
    private dialog: MatDialog,
    private reviewService: ReviewService,
    private route: ActivatedRoute,
    private initialRecommendService: InitialRecommendService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder
  ) {
    // this.clinic = data.clinic;
  }

  ngOnInit(): void {
    this.loadClinicDetails();

    this.clinicForm = this.formBuilder.group({
      cName: ['', Validators.required],
      cAddress: ['', Validators.required],
      cNumber: ['', Validators.required],
      cEmail: ['', Validators.required],
      cSchedule: [[]], // Ensure initialized as an array
      cSTime: ['', Validators.required],
      cETime: ['', Validators.required],
      cService: [[]],
      cGrmPrice: ['', Validators.required],
      cLabPrice: ['', Validators.required],
      cSrgPrice: ['', Validators.required],
      cLink: ['', Validators.required],
    });

    // Subscribe to form value changes
    this.clinicForm.valueChanges.subscribe(() => {
      // Set formChanged flag to true when the form values change
      this.formChanged = true;
    });

    this.getBusinessPermit();
    this.getHealthSafety();
    this.getVetPractice();
    this.getPermApps();
    this.displayClinicCover();
    this.displayClinicProfile();
  }

  backToClinics() {
    this.router.navigate(['clinic/clinic-list']);
  }

  async loadClinicDetails() {
    try {
      const clinicId = this.route.snapshot.params['id'];

      const { data: clinicData, error } = await this.supabaseService
        .getSupabase()
        .from('clinic_tbl')
        .select('*')
        .eq('id', clinicId)
        .single();

      if (error) {
        console.error('Error fetching clinic details:', error);
      } else {
        this.clinic = clinicData || [];

        const cScheduleValue = clinicData.cSchedule;
        const cScheduleArray = Array.isArray(cScheduleValue)
          ? cScheduleValue
          : cScheduleValue
          ? cScheduleValue.split(',')
          : [];

        const cServiceValue = clinicData.cService;
        const cServiceArray = Array.isArray(cServiceValue)
          ? cServiceValue
          : cServiceValue
          ? cServiceValue.split(',')
          : [];

          console.log(cScheduleArray)
          console.log(cServiceArray)

        this.clinicForm.patchValue({
          cName: clinicData.cName || '',
          cAddress: clinicData.cAddress || '',
          cNumber: clinicData.cNumber || '',
          cEmail: clinicData.cEmail || '',
          cLink: clinicData.cLink || '',
          cGrmPrice: clinicData.cGrmPrice || '',
          cLabPrice: clinicData.cLabPrice || '',
          cSrgPrice: clinicData.cSrgPrice || '',
          cSTime: clinicData.cSTime || '',
          cETime: clinicData.cETime || '',
          cSchedule: cScheduleArray.map((day: string) => day.trim()) || [], // Ensure it's an array
          cService: cServiceArray.map((service: string) => service.trim()) || [],
        });

        this.initialFormValues = {
          ...this.clinicForm.value,
        };
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async editClinic() {
    try {
      const currentUser = this.supabaseService.getClinicAuthStateSnapshot();

      if (currentUser) {
        const { data: userData, error: userError } = await this.supabaseService
          .getSupabase()
          .from('clinic_users_tbl')
          .select('id')
          .eq('email', currentUser.email)
          .single();

        if (userError) {
          console.error('Error fetching user data:', userError);
          return;
        }

        if (!userData) {
          console.error('No user data found for the logged-in user.');
          return;
        }

        const clinicId = this.route.snapshot.params['id'];

        // Retrieve the current clinic details from the database
        const { data: clinicData, error: clinicError } = await this.supabaseService
          .getSupabase()
          .from('clinic_tbl')
          .select('*')
          .eq('id', clinicId)
          .single();

        if (clinicError) {
          console.error('Error fetching clinic data:', clinicError);
          return;
        }

        if (!clinicData) {
          console.error('clinic data not found.');
          return;
        }
        const startHour = parseInt(this.clinicForm.value.cSTime.split(':')[0]);
        const startMinute = this.clinicForm.value.cSTime.split(':')[1];
        const endHour = parseInt(this.clinicForm.value.cETime.split(':')[0]);
        const endMinute = this.clinicForm.value.cETime.split(':')[1];

        // Format start and end times into 12-hour format
        const combinedTime = `${this.formatHour(startHour)}:${startMinute} ${startHour >= 12 ? 'pm' : 'am'} to ${this.formatHour(endHour)}:${endMinute} ${endHour >= 12 ? 'pm' : 'am'}`;

        // Update the clinic object with the form values
        this.clinic = {
          ...this.clinicForm.value,
          cTime: combinedTime,
          cSchedule: this.clinicForm.value.cSchedule.join(', '),
          cService: this.clinicForm.value.cService.join(', '),
        };

        // Perform the update operation
        const { data: updateData, error: updateError } =
          await this.supabaseService
            .getSupabase()
            .from('clinic_tbl')
            .update(this.clinic)
            .eq('id', clinicId);

        if (updateError) {
          console.error('Error updating clinic details:', updateError);
          // Handle error appropriately, e.g., show a message to the user
          return;
        }

        this.formChanged = false;

        // Show success message using SweetAlert
        Swal.fire({
          icon: 'success',
          title: 'Clinic details updated successfully!',
          showConfirmButton: false,
          timer: 1500, // Close the alert after 1.5 seconds
        });

        console.log('Clinic details updated successfully:', updateData);
      } else {
        console.error('No logged-in user found.');
      }
    } catch (error) {
      console.error('Error:', error);
      // Handle error appropriately, e.g., show a message to the user
    }
  }

  private formatHour(hour: number): string {
    if (hour === 0) {
      return '12';
    } else if (hour > 12) {
      return (hour - 12).toString();
    } else {
      return hour.toString();
    }
  }

  dayOpen(event: any): void {
    if (event && event.panelOpen) {
      const cScheduleControl = this.clinicForm.get('cSchedule');
      if (cScheduleControl) {
        const currentValue = cScheduleControl.value || [];
        cScheduleControl.patchValue(currentValue);
      }
    }
  }

  isDaySelected(day: string): boolean {
    const cScheduleOptions: string[] =
      this.clinicForm.get('cSchedule')?.value || [];
    return cScheduleOptions.includes(day);
  }

  serviceOpen(event: any): void {
    if (event && event.panelOpen) {
      const cServiceControl = this.clinicForm.get('cService');
      if (cServiceControl) {
        const currentValue = cServiceControl.value || [];
        cServiceControl.patchValue(currentValue);
      }
    }
  }

  isServiceSelected(service: string): boolean {
    const cServiceOptions: string[] =
      this.clinicForm.get('cService')?.value || [];
    return cServiceOptions.includes(service);
  }

  // reset form
  resetForm() {
    this.clinicForm.patchValue(this.initialFormValues);
    this.formChanged = false;
  }

  deleteClinic(clinic: any): void {
    // Use SweetAlert to confirm deletion
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3f51b5',
      confirmButtonText: 'Yes, delete it!',
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
        .from('clinic_tbl')
        .delete()
        .eq('id', clinicId);

      if (deleteError) {
        console.error('Error deleting clinic:', deleteError);
        // Handle error appropriately
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Clinic Successfully Deleted!',
          text: 'The clinic has been deleted.',
        });
        this.router.navigate(['clinic/clinic-list']);
        console.log('Clinic deleted successfully from the database.');
      }
    } catch (error) {
      console.error('Error:', error);
      // Handle error appropriately
    }
  }

  // clinic cover
  async onSelectCover(e: any) {
    if (e.target.files) {
      this.file = e.target.files[0];

      const currentUser = this.supabaseService.getClinicAuthStateSnapshot();
      if (currentUser) {
        try {
          const { data: userData, error: userError } =
            await this.supabaseService
              .getSupabase()
              .from('clinic_users_tbl')
              .select('id')
              .eq('email', currentUser.email)
              .single();

          if (userError) {
            throw new Error('Error fetching user data');
          }

          if (!userData) {
            throw new Error('User data not found');
          }

          const userId = userData.id;
          const clinicId = this.route.snapshot.params['id'];
          const filename = `${userId}_${clinicId}_clinicCover`;

          // Fetch the current image filename
          const { data: currentImage, error: currentImageError } =
            await this.supabaseService
              .getSupabase()
              .storage.from('clinicCover')
              .list();

          if (currentImageError) {
            throw new Error('Error fetching current cover');
          }

          const existingImage = currentImage.find(
            (image) => image.name === filename
          );

          // Delete the existing image if found
          if (existingImage) {
            const { error: deleteError } = await this.supabaseService
              .getSupabase()
              .storage.from('clinicCover')
              .remove([existingImage.id]);

            if (deleteError) {
              throw new Error('Error deleting existing cover');
            }
          }

          // Upload the new image
          const { data: uploadData, error: uploadError } =
            await this.supabaseService
              .getSupabase()
              .storage.from('clinicCover')
              .upload(filename, this.file as File, {
                cacheControl: '3600',
                upsert: true,
              });

          if (uploadError) {
            throw new Error('Error uploading new cover');
          }

          console.log('clinic cover uploaded successfully:', uploadData);

          // Display the current image
          await this.displayClinicCover();
        } catch (error) {
          console.error('Error uploading clinic cover:', error);
        }
      }
    }
  }

  async fetchCover(filename: string) {
    console.log('Fetching cover:', filename);

    try {
      const { data, error } = await this.supabaseService
        .getSupabase()
        .storage.from('clinicCover')
        .download(filename);

      if (error) {
        throw new Error('Error fetching cover');
      }

      if (data) {
        this.cover = URL.createObjectURL(data);
      } else {
        console.error('Cover not found:', filename);
        this.cover = 'assets/defaultCover.png'; // Fallback to default image
      }
    } catch (error) {
      // console.error('Error fetching cover:', error);
      this.cover = 'assets/defaultCover.png'; // Fallback to default image
    }
  }

  async displayClinicCover() {
    const currentUser = this.supabaseService.getClinicAuthStateSnapshot();
    if (currentUser) {
      try {
        const { data: userData, error: userError } = await this.supabaseService
          .getSupabase()
          .from('clinic_users_tbl')
          .select('id')
          .eq('email', currentUser.email)
          .single();

        if (userError) {
          throw new Error('Error fetching user data');
        }

        if (!userData) {
          throw new Error('User data not found');
        }

        const userId = userData.id;
        const clinicId = this.route.snapshot.params['id'];
        const filename = `${userId}_${clinicId}_clinicCover`;

        try {
          // Attempt to fetch the image
          await this.fetchCover(filename);
        } catch (error) {
          // console.error('Error fetching cover picture:', error);
          this.cover = 'assets/defaultCover.png'; // Fallback to default image
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
  }

  // clinicLogo
  async onSelectProfile(e: any) {
    if (e.target.files) {
      this.file = e.target.files[0];

      const currentUser = this.supabaseService.getClinicAuthStateSnapshot();
      if (currentUser) {
        try {
          const { data: userData, error: userError } =
            await this.supabaseService
              .getSupabase()
              .from('clinic_users_tbl')
              .select('id')
              .eq('email', currentUser.email)
              .single();

          if (userError) {
            throw new Error('Error fetching user data');
          }

          if (!userData) {
            throw new Error('User data not found');
          }

          const userId = userData.id;
          const clinicId = this.route.snapshot.params['id'];

          // Fetch the clinic name from the database
          const { data: clinicData, error: clinicError } = await this.supabaseService
            .getSupabase()
            .from('clinic_tbl')
            .select('cName')
            .eq('id', clinicId)
            .single();

          if (clinicError) {
            throw new Error('Error fetching clinic data');
          }

          if (!clinicData) {
            throw new Error('clinic data not found');
          }

          const cName = clinicData.cName;
          const filename = `${cName}_clinicLogo`;

          // Fetch the current image filename
          const { data: currentImage, error: currentImageError } =
            await this.supabaseService
              .getSupabase()
              .storage.from('clinicLogo')
              .list();

          if (currentImageError) {
            throw new Error('Error fetching current profile');
          }

          const existingImage = currentImage.find(
            (image) => image.name === filename
          );

          // Delete the existing image if found
          if (existingImage) {
            const { error: deleteError } = await this.supabaseService
              .getSupabase()
              .storage.from('clinicLogo')
              .remove([existingImage.id]);

            if (deleteError) {
              throw new Error('Error deleting existing profile');
            }
          }

          // Upload the new image
          const { data: uploadData, error: uploadError } =
            await this.supabaseService
              .getSupabase()
              .storage.from('clinicLogo')
              .upload(filename, this.file as File, {
                cacheControl: '3600',
                upsert: true,
              });

          if (uploadError) {
            throw new Error('Error uploading new image');
          }

          console.log('clinic profile uploaded successfully:', uploadData);

          // Display the current image
          await this.displayClinicProfile();
        } catch (error) {
          console.error('Error uploading clinic profile picture:', error);
        }
      }
    }
  }

  async fetchProfile(filename: string) {
    console.log('Fetching profile:', filename);

    try {
      const { data, error } = await this.supabaseService
        .getSupabase()
        .storage.from('clinicLogo')
        .download(filename);

      if (error) {
        throw new Error('Error fetching profile');
      }

      if (data) {
        this.profile = URL.createObjectURL(data);
      } else {
        console.error('profile not found:', filename);
        this.profile = 'assets/defaultprofile.png'; // Fallback to default image
      }
    } catch (error) {
      // console.error('Error fetching profile:', error);
      this.profile = 'assets/defaultprofile.png'; // Fallback to default image
    }
  }

  async displayClinicProfile() {
    const currentUser = this.supabaseService.getClinicAuthStateSnapshot();
    if (currentUser) {
      try {
        const { data: userData, error: userError } = await this.supabaseService
          .getSupabase()
          .from('clinic_users_tbl')
          .select('id')
          .eq('email', currentUser.email)
          .single();

        if (userError) {
          throw new Error('Error fetching user data');
        }

        if (!userData) {
          throw new Error('User data not found');
        }

        const userId = userData.id;
        const clinicId = this.route.snapshot.params['id'];

        // Fetch the clinic name from the database
        const { data: clinicData, error: clinicError } = await this.supabaseService
          .getSupabase()
          .from('clinic_tbl')
          .select('cName')
          .eq('id', clinicId)
          .single();

        if (clinicError) {
          throw new Error('Error fetching clinic data');
        }

        if (!clinicData) {
          throw new Error('clinic data not found');
        }

        const cName = clinicData.cName;
        const filename = `${cName}_clinicLogo`;

        try {
          // Attempt to fetch the image
          await this.fetchProfile(filename);
        } catch (error) {
          // console.error('Error fetching profile picture:', error);
          this.profile = 'assets/defaultprofile.png'; // Fallback to default image
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
  }

  async getBusinessPermit() {
    try {
      const currentUser = this.supabaseService.getClinicAuthStateSnapshot();
      const clinicId = this.route.snapshot.params['id'];

      if (currentUser) {
        // Fetch clinic data including the necessary fields (e.g., id, cName)
        const { data: clinicData, error: clinicError } =
          await this.supabaseService
            .getSupabase()
            .from('clinic_tbl')
            .select('cName')
            .eq('id', clinicId)
            .single();
        // console.log('clinic name:',clinicData)

        if (clinicError) {
          console.error('Error fetching clinic data:', clinicError);
          return;
        }

        if (!clinicData) {
          console.error('Clinic data not found for the current user.');
          return;
        }

        // Construct the filename using clinic data
        const filename = `${clinicData.cName}_businessPermit`;
        console.log('filename:', filename);
        // Fetch the business permit image
        const { data: fetchData, error: fetchError } =
          await this.supabaseService
            .getSupabase()
            .storage.from('documents')
            .download(filename);

        if (fetchError) {
          console.error('Error fetching business permit:', fetchError);
          return;
        }

        if (fetchData) {
          // Set the URL for the image
          this.businessPermit = URL.createObjectURL(fetchData);
          // console.log(this.businessPermit)
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
        // Fetch clinic data including the necessary fields (e.g., id, cName)
        const { data: clinicData, error: clinicError } =
          await this.supabaseService
            .getSupabase()
            .from('clinic_tbl')
            .select('cName')
            .eq('id', clinicId)
            .single();
        // console.log('clinic name:',clinicData)

        if (clinicError) {
          console.error('Error fetching clinic data:', clinicError);
          return;
        }

        if (!clinicData) {
          console.error('Clinic data not found for the current user.');
          return;
        }

        // Construct the filename using clinic data
        const filename = `${clinicData.cName}_healthSafety`;
        console.log('filename:', filename);
        // Fetch the business permit image
        const { data: fetchData, error: fetchError } =
          await this.supabaseService
            .getSupabase()
            .storage.from('documents')
            .download(filename);

        if (fetchError) {
          console.error('Error fetching business permit:', fetchError);
          return;
        }

        if (fetchData) {
          // Set the URL for the image
          this.healthSafety = URL.createObjectURL(fetchData);
          // console.log(this.healthSafety)
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
        // Fetch clinic data including the necessary fields (e.g., id, cName)
        const { data: clinicData, error: clinicError } =
          await this.supabaseService
            .getSupabase()
            .from('clinic_tbl')
            .select('cName')
            .eq('id', clinicId)
            .single();
        // console.log('clinic name:',clinicData)

        if (clinicError) {
          console.error('Error fetching clinic data:', clinicError);
          return;
        }

        if (!clinicData) {
          console.error('Clinic data not found for the current user.');
          return;
        }

        // Construct the filename using clinic data
        const filename = `${clinicData.cName}_vetPractice`;
        console.log('filename:', filename);
        // Fetch the business permit image
        const { data: fetchData, error: fetchError } =
          await this.supabaseService
            .getSupabase()
            .storage.from('documents')
            .download(filename);

        if (fetchError) {
          console.error('Error fetching business permit:', fetchError);
          return;
        }

        if (fetchData) {
          // Set the URL for the image
          this.vetPractice = URL.createObjectURL(fetchData);
          // console.log(this.vetPractice)
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
        // Fetch clinic data including the necessary fields (e.g., id, cName)
        const { data: clinicData, error: clinicError } =
          await this.supabaseService
            .getSupabase()
            .from('clinic_tbl')
            .select('cName')
            .eq('id', clinicId)
            .single();
        // console.log('clinic name:',clinicData)

        if (clinicError) {
          console.error('Error fetching clinic data:', clinicError);
          return;
        }

        if (!clinicData) {
          console.error('Clinic data not found for the current user.');
          return;
        }

        // Construct the filename using clinic data
        const filename = `${clinicData.cName}_perApps`;
        console.log('filename:', filename);
        // Fetch the business permit image
        const { data: fetchData, error: fetchError } =
          await this.supabaseService
            .getSupabase()
            .storage.from('documents')
            .download(filename);

        if (fetchError) {
          console.error('Error fetching business permit:', fetchError);
          return;
        }

        if (fetchData) {
          // Set the URL for the image
          this.permApps = URL.createObjectURL(fetchData);
          console.log(this.permApps);
        } else {
          console.error('Business permit not found:', filename);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
}
