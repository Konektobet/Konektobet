import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { PostgrestResponse, Session } from '@supabase/supabase-js';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import Swal from 'sweetalert2';
import { SupabaseService } from '../../../service/supabase.service';
import { BehaviorSubject, Observable, map, startWith } from 'rxjs';

@Component({
  selector: 'app-add-clinic',
  templateUrl: './add-clinic.component.html',
  styleUrls: ['./add-clinic.component.scss'],
})
export class AddClinicComponent implements OnInit {
  serviceControl = new FormControl();
  // healthcareControl = new FormControl();
  scheduleControl = new FormControl();

  user: Session | null = null;
  clinicForm!: FormGroup;

  separatorKeysCodes: number[] = [ENTER, COMMA];
  selectedServices: string[] = [];
  // selectedHealthcares: string[] = [];
  selectedSchedules: string[] = [];

  private servicesSubject = new BehaviorSubject<string[]>([
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
  ]);

  // private healthcaresSubject = new BehaviorSubject<string[]>([
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
  // ]);

  private schedulesSubject = new BehaviorSubject<string[]>([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ]);

  filteredServices: Observable<string[]> | undefined;
  // filteredHealthcares: Observable<string[]> | undefined;
  filteredSchedules: Observable<string[]> | undefined;

  services$: Observable<string[]> = this.servicesSubject.asObservable();
  // healthcare$: Observable<string[]> = this.healthcaresSubject.asObservable();
  schedule$: Observable<string[]> = this.schedulesSubject.asObservable();

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
  schedules: string[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  @Output() clinicAdded = new EventEmitter<any>();

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AddClinicComponent>,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit(): void {
    this.clinicForm = this.formBuilder.group({
      adName: ['', Validators.required],
      adAddress: ['', Validators.required],
      adNumber: ['', Validators.required],
      adEmail: ['', Validators.required],
      adLink: ['', Validators.required],
      adGrmPrice: ['', Validators.required],
      adLabPrice: ['', Validators.required],
      adSrgPrice: ['', Validators.required],
      adSTime: ['', Validators.required],
      adETime: ['', Validators.required],
      adService: [''],
      // cHealthcare: [''],
      adSchedule: [''],
    });

    this.filteredServices = this.serviceControl.valueChanges.pipe(
      startWith(''),
      map((value) => this.filterServices(value || ''))
    );

    // this.filteredHealthcares = this.healthcareControl.valueChanges.pipe(
    //   startWith(''),
    //   map((value) => this.filterHealthcares(value || ''))
    // );

    this.filteredSchedules = this.scheduleControl.valueChanges.pipe(
      startWith(''),
      map((value) => this.filterSchedules(value || ''))
    );
  }
  async addClinic() {
    if (this.clinicForm.valid) {
      try {
        // Get the currently logged-in user's information
        const currentUser = this.supabaseService.getClinicAuthStateSnapshot();

        // Check if there is a logged-in user
        if (currentUser) {
          // Fetch the user ID from clinic_users_tbl based on the email
          const { data: userData, error: userError } =
            await this.supabaseService
              .getSupabase()
              .from('clinic_users_tbl')
              .select('id')
              .eq('email', currentUser.email); // Use optional chaining here
          console.log('session id: ', currentUser.id);

          if (userError) {
            console.error('Error fetching user data:', userError);
            // Handle error appropriately
          } else {
            if (userData && userData.length > 0) {
              // Extract hours and minutes from start and end times
              const startHour = parseInt(this.clinicForm.value.adSTime.split(':')[0]);
              const startMinute = this.clinicForm.value.adSTime.split(':')[1];
              const endHour = parseInt(this.clinicForm.value.adETime.split(':')[0]);
              const endMinute = this.clinicForm.value.adETime.split(':')[1];
  
              // Format start and end times into 12-hour format
              const combinedTime = `${this.formatHour(startHour)}:${startMinute} ${startHour >= 12 ? 'pm' : 'am'} to ${this.formatHour(endHour)}:${endMinute} ${endHour >= 12 ? 'pm' : 'am'}`;

              // Use the user ID when inserting data into clinic_tbl
              const clinicData = {
                ...this.clinicForm.value,
                adUsers_id: userData[0].id,
                adService: this.selectedServices.join(', '),
                adTime: combinedTime, // Set the combined time to cTime field
                adSchedule: this.selectedSchedules.join(', '),
              };
              console.log(this.clinicForm.value)
              // Insert data into 'clinic_tbl' table
              const { data: insertData, error: insertError } =
                await this.supabaseService
                  .getSupabase()
                  .from('admin_clinic_tbl')
                  .insert([clinicData]);
              console.log(clinicData)
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

                Swal.fire({
                  icon: 'success',
                  title: 'Clinic Added!',
                  text: 'Kindly wait for the verification and approval of your clinic.',
                });

                this.clearNewClinic();
                this.dialogRef.close(clinicData);
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
    } else {
      // Handle validation error if needed
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

  addService(event: MatAutocompleteSelectedEvent): void {
    const selectedService = event.option.viewValue;
    this.selectedServices.push(selectedService);
    this.serviceControl.setValue('');

    // Update the available services in real-time
    this.servicesSubject.next(this.servicesSubject.value.filter((service) => service !== selectedService));
  }

  removeService(service: string): void {
    const index = this.selectedServices.indexOf(service);

    if (index >= 0) {
      // Add the removed service back to the list of available services
      this.servicesSubject.next([...this.servicesSubject.value, service]);

      // Remove the service from the selected services
      this.selectedServices.splice(index, 1);
    }
  }

  filterServices(value: string): string[] {
    const filterValue = this.normalizeValue(value);
    return this.servicesSubject.value.filter((service) =>
      this.normalizeValue(service).includes(filterValue)
    );
  }

  // addHealthcare(event: MatAutocompleteSelectedEvent): void {
  //   const selectedHealthcare = event.option.viewValue;
  //   this.selectedHealthcares.push(selectedHealthcare);
  //   this.healthcareControl.setValue('');

  //    // Update the available services in real-time
  //    this.healthcaresSubject.next(this.healthcaresSubject.value.filter((healthcare) => healthcare !== selectedHealthcare));
  // }

  // removeHealthcare(healthcare: string): void {
  //   const index = this.selectedHealthcares.indexOf(healthcare);

  //   if (index >= 0) {
  //     // Add the removed service back to the list of available services
  //     this.healthcaresSubject.next([...this.healthcaresSubject.value, healthcare]);

  //     this.selectedHealthcares.splice(index, 1);
  //   }
  // }

  // filterHealthcares(value: string): string[] {
  //   const filterValue = this.normalizeValue(value);
  //   return this.healthcaresSubject.value.filter((healthcare) =>
  //     this.normalizeValue(healthcare).includes(filterValue)
  //   );
  // }

  addSchedule(event: MatAutocompleteSelectedEvent): void {
    const selectedSchedule = event.option.viewValue;
    this.selectedSchedules.push(selectedSchedule);
    this.scheduleControl.setValue('');

     // Update the available services in real-time
     this.schedulesSubject.next(this.schedulesSubject.value.filter((schedule) => schedule !== selectedSchedule));
  }

  removeSchedule(schedule: string): void {
    const index = this.selectedSchedules.indexOf(schedule);

    if (index >= 0) {
      // Add the removed service back to the list of available services
      this.schedulesSubject.next([...this.schedulesSubject.value, schedule]);

      this.selectedSchedules.splice(index, 1);
    }
  }

  filterSchedules(value: string): string[] {
    const filterValue = this.normalizeValue(value);
    return this.schedulesSubject.value.filter((schedule) =>
      this.normalizeValue(schedule).includes(filterValue)
    );
  }

  private normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }

  private clearNewClinic() {
    this.clinicForm.reset();
    this.selectedServices = [];
    // this.selectedHealthcares = [];
    this.selectedSchedules = [];

    this.services = [
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

    // this.healthcares = [
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

    this.schedules = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
  }
}




