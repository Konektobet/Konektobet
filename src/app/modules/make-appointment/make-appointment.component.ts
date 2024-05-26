import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SupabaseService } from 'src/app/service/supabase.service';
import Swal from 'sweetalert2';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

@Component({
  selector: 'app-make-appointment',
  templateUrl: './make-appointment.component.html',
  styleUrls: ['./make-appointment.component.scss'],
})
export class MakeAppointmentComponent {
  clinic: any;
  selectedServices: string[] = [];
  isFormValid: boolean = false;
  selectedDate: Date = new Date();
  existingAppointments: any[] = [];
  timeSlots: string[] = [];
  selectedTimeSlot: string = '';
  minSelectableDate: Date = new Date();

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    public dialogRef: MatDialogRef<MakeAppointmentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.clinic = data.clinic;
    // Generate time slots
    this.generateTimeSlots();
    this.minSelectableDate.setHours(0, 0, 0, 0);
    this.updateMinSelectableDate();
  }

  onClose(): void {
    this.dialogRef.close();
  }

  async onMakeAppointment() {
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
            const { data: clinicData, error: clinicError } =
              await this.supabaseService
                .getSupabase()
                .from('clinic_tbl')
                .select('*')
                .eq('id', this.clinic.id);

            if (clinicError) {
              console.error('Error fetching clinic details:', clinicError);
              return;
            }

            // Check if the selected date is in the clinic schedule
            const scheduleDays = this.clinic.cSchedule
              .split(',')
              .map((day: string) => day.trim().toLowerCase());
            const selectedDay = this.getDayName(
              this.selectedDate.getDay()
            ).toLowerCase();

            if (!scheduleDays.includes(selectedDay)) {
              // If the selected date is not in the clinic schedule, show an error message
              Swal.fire({
                icon: 'error',
                title: 'No Schedule Available',
                text: 'There is no schedule available for the selected date.',
              });
              return; // Exit the function to prevent further execution
            }

            // Appointment details
            const appointmentDetails = {
              aUsers_id: userData[0].id,
              aClinic_id: clinicData[0].id,
              aName: clinicData[0].cName,
              aAddress: clinicData[0].cAddress,
              aService: this.selectedServices.join(', '),
              aTime: this.selectedTimeSlot,
              aDate: this.selectedDate.toISOString(),
              status: 'Your appointment status is pending',
            };

            // Insert the appointment details into the appointment table
            const { data: insertData, error: insertError } =
              await this.supabaseService
                .getSupabase()
                .from('appointment_tbl')
                .insert([appointmentDetails]);

            if (insertError) {
              console.error('Error inserting appointment:', insertError);
            } else {
              console.log('Appointment added successfully:', insertData);
              Swal.fire({
                icon: 'success',
                title: 'Appointment Success!',
                text: 'Kindly wait for 2 to 3 days approval of your appointment.',
              });
              this.dialogRef.close();
            }
          } else {
            console.error('No user data found for the logged-in user.');
          }
        }
      } else {
        this.router.navigate(['/login']);
        this.dialogRef.close();
        console.error('No logged-in user found.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
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
    this.updateFormValidity();
  }

  generateTimeSlots(): void {
    const startTime = this.clinic.cSTime; // Start time from clinic details
    const endTime = this.clinic.cETime; // End time from clinic details
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);

    for (let hour = startHour; hour <= endHour; hour++) {
      const ampm = hour >= 12 ? 'PM' : 'AM'; // Determine if it's AM or PM
      const hour12 = hour % 12 || 12; // Convert 24-hour format to 12-hour format
      const timeSlot = `${hour12}:00 ${ampm}`; // Construct the time slot string
      this.timeSlots.push(timeSlot);
    }
  }

  onDateChange(event: MatDatepickerInputEvent<Date>): void {
    // Update the selected date when the user selects a date in the datepicker
    this.selectedDate = event.value || new Date();
    // Check if the selected date matches the clinic schedule
    if (!this.isDateInSchedule(this.selectedDate)) {
      Swal.fire({
        icon: 'error',
        title: 'No Schedule Available',
        text: 'There is no schedule available for the selected date.',
      });
    }
  }

  isDateInSchedule(date: Date): boolean {
    const dayIndex = date.getDay(); // Get the day index (0 for Sunday, 1 for Monday, etc.)
    const scheduleDays = this.clinic.cSchedule
      .split(',')
      .map((day: string) => day.trim().toLowerCase());

    const selectedDay = this.getDayName(dayIndex).toLowerCase();
    return scheduleDays.includes(selectedDay);
  }

  updateFormValidity(): void {
    // Update form validity based on the presence of selected services
    this.isFormValid = this.selectedServices.length > 0;
  }

  updateMinSelectableDate(): void {
    const currentDay = this.selectedDate.getDay(); // Get the current day (0 for Sunday, 1 for Monday, ...)
    const scheduleDays = this.clinic.cSchedule
      .split(',')
      .map((day: string) => day.trim().toLowerCase());

    let daysToAdd = 3; // Start with a week ahead
    for (let i = 1; i <= 3; i++) {
      const nextDayIndex = (currentDay + i) % 3;
      if (scheduleDays.includes(this.getDayName(nextDayIndex))) {
        // Found the next available day in the schedule
        daysToAdd = i;
        break;
      }
    }

    // Set the minimum selectable date as the current date plus the days to add
    this.minSelectableDate.setDate(this.selectedDate.getDate() + daysToAdd);
  }

  getDayName(index: number): string {
    // Get the name of the day based on the index (0 for Sunday, 1 for Monday, ...)
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    return days[index];
  }
}
