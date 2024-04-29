import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ENTER, COMMA } from '@angular/cdk/keycodes';

import { SupabaseService } from '../../../service/supabase.service';
import Swal from 'sweetalert2';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';


@Component({
  selector: 'app-edit-clinic',
  templateUrl: './edit-clinic.component.html',
  styleUrls: ['./edit-clinic.component.scss'],
})
export class EditClinicComponent implements OnInit {
  serviceControl = new FormControl();
  // healthcareControl = new FormControl();
  scheduleControl = new FormControl();

  clinicForm!: FormGroup;

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

  separatorKeysCodes: number[] = [ENTER, COMMA];
  selectedServices: string[] = [];
  // selectedHealthcares: string[] = [];
  selectedSchedules: string[] = [];

  filteredServices: Observable<string[]> | undefined;
  // filteredHealthcares: Observable<string[]> | undefined;
  filteredSchedules: Observable<string[]> | undefined;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<EditClinicComponent>,
    private supabaseService: SupabaseService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any // Inject the data passed to the dialog
  ) {}

  ngOnInit(): void {
    this.clinicForm = this.formBuilder.group({
      cName: [this.data.clinic.cName, Validators.required],
      cAddress: [this.data.clinic.cAddress, Validators.required],
      cNumber: [this.data.clinic.cNumber, Validators.required],
      cEmail: [this.data.clinic.cEmail, Validators.required],
      cLink: [this.data.clinic.cLink, Validators.required],
      cGrmPrice: [this.data.clinic.cGrmPrice, Validators.required],
      cLabPrice: [this.data.clinic.cLabPrice, Validators.required],
      cSrgPrice: [this.data.clinic.cSrgPrice, Validators.required],
      cSTime: [this.data.clinic.cSTime, Validators.required],
      cETime: [this.data.clinic.cETime, Validators.required],
      cService: [this.data.clinic.cService || []],
      // cHealthcare: [this.data.clinic.cHealthcare || []],
      cSchedule: [this.data.clinic.cSchedule || []],
    });

    this.selectedServices = Array.isArray(this.data.clinic.cService)
      ? this.data.clinic.cService.map((service: string) =>
          service.split(',')
        )
      : typeof this.data.clinic.cService === 'string'
      ? this.data.clinic.cService.split(',')
      : [];
    console.log(this.selectedServices);

    // this.selectedHealthcares = Array.isArray(this.data.clinic.cHealthcare)
    // ? this.data.clinic.cHealthcare.flatMap((healthcare: string) => 
    //   healthcare.split(',')
    //   )
    //   : typeof this.data.clinic.cHealthcare === 'string'
    //   ? this.data.clinic.cHealthcare.split(',')
    //   : [];
    // console.log(this.selectedHealthcares);

    this.selectedSchedules = Array.isArray(this.data.clinic.cSchedule)
      ? this.data.clinic.cSchedule.flatMap((schedule: string) =>
          schedule.split(',')
        )
      : typeof this.data.clinic.cSchedule === 'string'
      ? this.data.clinic.cSchedule.split(',')
      : [];
    console.log(this.selectedSchedules);

    this.filteredServices = this.serviceControl.valueChanges.pipe(
      startWith(''),
      map((value) => this.filterServices(value || ''))
    );

    // this.filteredHealthcares = this.healthcareControl.valueChanges.pipe(
    //   startWith(''),
    //   debounceTime(300),
    //   distinctUntilChanged(),
    //   switchMap(value => of(this.filterHealthcares(value)))
    // );

    this.filteredSchedules = this.scheduleControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => of(this.filterSchedules(value)))
    );
  }

  async updateClinic() {
    if (this.clinicForm.valid) {
      try {
        const startHour = parseInt(this.clinicForm.value.cSTime.split(':')[0]);
        const startMinute = this.clinicForm.value.cSTime.split(':')[1];
        const endHour = parseInt(this.clinicForm.value.cETime.split(':')[0]);
        const endMinute = this.clinicForm.value.cETime.split(':')[1];
  
        // Format start and end times into 12-hour format
        const combinedTime = `${this.formatHour(startHour)}:${startMinute} ${startHour >= 12 ? 'pm' : 'am'} to ${this.formatHour(endHour)}:${endMinute} ${endHour >= 12 ? 'pm' : 'am'}`;

        const clinicData = {
          ...this.clinicForm.value,
          cService: this.cleanUpArray(this.selectedServices).join(', '),
          cSchedule: this.cleanUpArray(this.selectedSchedules).join(', '),
          cTime: combinedTime,
        };

        const currentUser = this.supabaseService.getClinicAuthStateSnapshot();

        if (currentUser) {
          // Fetch the clinic ID based on the user's email
          const { data: clinicUserData, error: clinicUserError } =
            await this.supabaseService
              .getSupabase()
              .from('clinic_tbl')
              .select('id')
              .eq('id', this.data.clinic.id);
          console.log('session id: ', this.data.clinic.id);

          if (clinicUserError) {
            console.error('Error fetching clinic user data:', clinicUserError);
            // Handle error appropriately
          } else {
            if (clinicUserData && clinicUserData.length > 0) {
              const clinicId = clinicUserData[0].id;
              console.log(clinicUserData);
              // Update data in 'clinic_tbl' table based on clinic's ID
              const { data: updateData, error: updateError } =
                await this.supabaseService
                  .getSupabase()
                  .from('clinic_tbl')
                  .update([clinicData])
                  .eq('id', clinicId);

              console.log('Updating clinic with data:', clinicData);
              console.log('Clinic ID:', clinicId);

              if (updateError) {
                console.error('Error updating clinic:', updateError);
                // Handle error appropriately
              } else {
                this.router.navigate(['clinic/clinic-list'])
                this.dialogRef.close(clinicData);
                // location.reload();
              }
            } else {
              console.error(
                'No clinic user data found for the logged-in user.'
              );
            }
          }
        }
      } catch (error) {
        console.error('Error:', error);
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while updating the clinic. Please try again.',
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

  cleanUpArray(array: string[]): string[] {
    return array.map((item) => item.replace(/['"\[\]]+/g, ''));
  }

  addService(value: string): void {
    if (!this.selectedServices.includes(value)) {
      this.selectedServices.push(value);
      this.serviceControl.setValue('');
    }
  }

  removeService(service: string): void {
    const index = this.selectedServices.indexOf(service);
  
    if (index >= 0) {
      this.selectedServices.splice(index, 1);
      // Emit a change in the serviceControl value to trigger filtering
      this.serviceControl.setValue(this.serviceControl.value);
    }
  }

  // addHealthcare(value: string): void {
  //   this.selectedHealthcares.push(value);
  //   this.healthcareControl.setValue('');
  // }

  // removeHealthcare(healthcare: string): void {
  //   const index = this.selectedHealthcares.indexOf(healthcare);

  //   if (index >= 0) {
  //     this.selectedHealthcares.splice(index, 1);
  //   }
  // }

  addSchedule(value: string): void {
    this.selectedSchedules.push(value);
    this.scheduleControl.setValue('');
  }

  removeSchedule(schedule: string): void {
    const index = this.selectedSchedules.indexOf(schedule);

    if (index >= 0) {
      this.selectedSchedules.splice(index, 1);
    }
  }

  filterServices(value: string): string[] {
    const filterValue = this.normalizeValue(value);
    const availableServices = this.services.filter(service =>
      !this.selectedServices.includes(service)
    );
    return availableServices.filter(service =>
      this.normalizeValue(service).includes(filterValue)
    );
}
  
  // filterHealthcares(value: string): string[] {
  //   const filterValue = this.normalizeValue(value);
  //   const availableHealthcares = this.healthcares.filter(healthcare =>
  //     !this.selectedHealthcares.includes(healthcare)
  //   );
  //   return availableHealthcares.filter(healthcare =>
  //     this.normalizeValue(healthcare).includes(filterValue)
  //   );
  // }
  
  filterSchedules(value: string): string[] {
    const filterValue = this.normalizeValue(value);
    const availableSchedules = this.schedules.filter(schedule =>
      !this.selectedSchedules.includes(schedule)
    );
    return availableSchedules.filter(schedule =>
      this.normalizeValue(schedule).includes(filterValue)
    );
  }

  private normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }

  saveChanges(): void {
    if (this.clinicForm.valid) {
      Swal.fire({
        icon: 'success',
        title: 'Changes Saved',
        text: 'Your changes have been saved successfully!',
      });

      this.dialogRef.close(this.clinicForm.value);
    }
  }
}
