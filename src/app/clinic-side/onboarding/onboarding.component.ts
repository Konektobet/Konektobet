import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from 'src/app/service/supabase.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
})
export class OnboardingComponent implements OnInit{
  days = new FormControl('');
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
  ];
  isEditable = false;

  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  selectedBP: File | null = null;
  selectedHS: File | null = null;
  selectedVP: File | null = null;
  selectedPA: File | null = null;
  imageUrl: string | null = null;

  file!: File;

  constructor(
    private formBuilder: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router,
  ) {}
  ngOnInit(): void {
    this.firstFormGroup = this.formBuilder.group({
      // firstCtrl: ['', Validators.required],
      adName: ['', Validators.required],
      adAddress: ['', Validators.required],
      adNumber: ['', Validators.required],
      adEmail: ['', Validators.required],
      adLink: ['', Validators.required],
      adSTime: ['', Validators.required],
      adETime: ['', Validators.required],
      adGrmPrice: ['', Validators.required],
      adLabPrice: ['', Validators.required],
      adSrgPrice: ['', Validators.required],
      adSchedule: ['', Validators.required],
      adService: ['', Validators.required],
      adCoordinates: ['', Validators.required],
    });
    this.secondFormGroup = this.formBuilder.group({
      // secondCtrl: ['', Validators.required],
      businessPermit: ['', Validators.required],
      healthSafety: ['', Validators.required],
      vetPractice: ['', Validators.required],
      permApps: ['', Validators.required],
    });

    // this.loadAcceptedClinic();
  }

  async loadAcceptedClinic() {
    try {
      const currentUser = this.supabaseService.getClinicAuthStateSnapshot();
  
      if (currentUser) {
        const { data: userData, error: userError } = await this.supabaseService
          .getSupabase()
          .from('clinic_users_tbl')
          .select('*')
          .eq('email', currentUser.email);
  
        if (userError) {
          console.error('Error fetching user data:', userError);
        } else {
          if (userData && userData.length > 0) {
            const acUsers_id = userData[0].id;
  
            const { data: adminClinicData, error: adminClinicError } =
              await this.supabaseService
                .getSupabase()
                .from('admin_clinic_tbl')
                .select('*')
                .eq('adUsers_id', acUsers_id);
  
            const { data: clinicData, error: clinicError } =
              await this.supabaseService
                .getSupabase()
                .from('clinic_tbl')
                .select('*')
                .eq('cUsers_id', acUsers_id);
  
            if (!adminClinicError && adminClinicData && adminClinicData.length === 0 ||
                !clinicError && clinicData && clinicData.length === 0) {
              // No record found in admin_clinic_tbl and clinic_tbl, redirect to onboarding page
              this.router.navigate(['/clinic/onboarding']);
              console.log('Clinic data found:', clinicData)
              console.log('Admin data found:', adminClinicData)
            } else {
              // Redirect to clinic-home page
              this.router.navigate(['/clinic/clinic-home']);
              console.log('Clinic data found:', clinicData)
              console.log('Admin data found:', adminClinicData)
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
        text: 'An error occurred while loading the clinic. Please try again.',
      });
    }
  }

  async submitForm1() {
    const formData = {
      ...this.firstFormGroup.value,
    };

    console.log(formData);
  }

  async submitForm2() {
    const formData2 = {
      ...this.secondFormGroup.value,
    };

    console.log(formData2);
  }

  async addClinic() {
    try {
      const currentUser = this.supabaseService.getClinicAuthStateSnapshot();
  
      if (currentUser) {
        const { data: userData, error: userError } = await this.supabaseService
          .getSupabase()
          .from('clinic_users_tbl')
          .select('id')
          .eq('email', currentUser.email);
  
        if (userError) {
          console.error('Error fetching user data:', userError);
        } else {
          if (userData && userData.length > 0) {
            const startHour = parseInt(this.firstFormGroup.value.adSTime.split(':')[0]);
            const startMinute = this.firstFormGroup.value.adSTime.split(':')[1];
            const endHour = parseInt(this.firstFormGroup.value.adETime.split(':')[0]);
            const endMinute = this.firstFormGroup.value.adETime.split(':')[1];
  
            // Format start and end times into 12-hour format
            const combinedTime = `${this.formatHour(startHour)}:${startMinute} ${startHour >= 12 ? 'pm' : 'am'} to ${this.formatHour(endHour)}:${endMinute} ${endHour >= 12 ? 'pm' : 'am'}`;
  
            // Check if userData[0] exists before accessing its properties
            if (userData[0]) {
              // Extract latitude and longitude from adCoordinates
              const coordinates = this.firstFormGroup.value.adCoordinates.split(',');
              const adLatitude = coordinates[0].trim();
              const adLongitude = coordinates[1].trim();
  
              const clinicData = {
                ...this.firstFormGroup.value,
                adUsers_id: userData[0].id,
                adTime: combinedTime,
                adSchedule: this.dayList.join(', '),
                adService: this.services.join(', '),
                adLatitude: adLatitude,
                adLongitude: adLongitude,
              }
  
              const { data: insertData, error: insertError } = await this.supabaseService
                .getSupabase()
                .from('admin_clinic_tbl')
                .insert([clinicData])
  
              if (insertError) {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'An error occurred while adding the clinic. Please try again.',
                });
  
                console.error('Error inserting clinic:', insertError);
                // Handle error appropriately
              } else {
                console.log('Clinic added successfully:', insertData);
                 this.router.navigate(['/clinic/clinic-home']); 
  
                Swal.fire({
                  icon: 'success',
                  title: 'Onboarding Done!',
                  text: 'Kindly wait for the verification and approval of your clinic within 1 to 3 working days.',
                });
              }
            } else {
              console.error('No user data found for the logged-in user.');
            }
          }
        }
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

  async addDocs(e: any){
    if(e.target.files) {
      this.file = e.target.files[0];

      // change this to userId_docName
      const filename = `upload_${this.file.name}`;

      // Insert the docs to db
      const { data: uploadData, error: uploadError } = await this.supabaseService
      .getSupabase()
      .storage
      .from('documents')
      .upload(filename, this.file as File, {
        cacheControl: '3600',
        upsert: true
      });
      
      if(uploadError){
        console.error('Error uploading docs:', uploadError)
        return;
      }

      console.log('Docs has been uploaded successfully', uploadData);
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

  async businessPermitSelected(event: any) {
    const currentUser = this.supabaseService.getClinicAuthStateSnapshot();
    if (currentUser) {
      const userId = currentUser.id;
      const clinicName = this.firstFormGroup.value.adName;
      const file: File = event.target.files[0];
      if (file) {
        this.selectedBP = file;
        // Optionally, you can preview the image
        // this.previewImage(file);
        const filename = `${clinicName}_businessPermit`;
        const { data: uploadData, error: uploadError } = await this.supabaseService
          .getSupabase()
          .storage
          .from('documents')
          .upload(filename, file as File, {
            cacheControl: '3600',
            upsert: true
          });
        if(uploadError){
          console.error('Error uploading docs:', uploadError)
          return;
        }
        console.log('Business Permit has been uploaded successfully', uploadData);
      }
    }
  }

  async healthSafetySelected(event: any) {
    const currentUser = this.supabaseService.getClinicAuthStateSnapshot();
    if (currentUser) {
      const userId = currentUser.id;
      const clinicName = this.firstFormGroup.value.adName;
      const file: File = event.target.files[0];
      if (file) {
        this.selectedHS = file;
  
        const filename = `${clinicName}_healthSafety`;
  
        const { data: uploadData, error: uploadError } = await this.supabaseService
          .getSupabase()
          .storage
          .from('documents')
          .upload(filename, file as File, {
            cacheControl: '3600',
            upsert: true
          });
        
        if(uploadError){
          console.error('Error uploading docs:', uploadError)
          return;
        }
  
        console.log('Health and Safety Cert has been uploaded successfully', uploadData);
      }
    }
  }
  
  async vetPracticeSelected(event: any) {
    const currentUser = this.supabaseService.getClinicAuthStateSnapshot();
    if (currentUser) {
      const userId = currentUser.id;
      const clinicName = this.firstFormGroup.value.adName;
      const file: File = event.target.files[0];
      if (file) {
        this.selectedVP = file;
  
        const filename = `${clinicName}_vetPractice`;
  
        const { data: uploadData, error: uploadError } = await this.supabaseService
          .getSupabase()
          .storage
          .from('documents')
          .upload(filename, file as File, {
            cacheControl: '3600',
            upsert: true
          });
        
        if(uploadError){
          console.error('Error uploading docs:', uploadError)
          return;
        }
  
        console.log('Vet Practice Cert has been uploaded successfully', uploadData);
      }
    }
  }
  
  async permissionApplicationsSelected(event: any) {
    const currentUser = this.supabaseService.getClinicAuthStateSnapshot();
    if (currentUser) {
      const userId = currentUser.id;
      const clinicName = this.firstFormGroup.value.adName;
      const file: File = event.target.files[0];
      if (file) {
        this.selectedPA = file;
  
        const filename = `${clinicName}_permApps`;
  
        const { data: uploadData, error: uploadError } = await this.supabaseService
          .getSupabase()
          .storage
          .from('documents')
          .upload(filename, file as File, {
            cacheControl: '3600',
            upsert: true
          });
        
        if(uploadError){
          console.error('Error uploading docs:', uploadError)
          return;
        }
  
        console.log('Permission Applications has been uploaded successfully', uploadData);
      }
    }
  }

  previewImage(file: File) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.imageUrl = reader.result as string;
    };
  }
}