import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SupabaseService } from 'src/app/service/supabase.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-appointment-update',
  templateUrl: './appointment-update.component.html',
  styleUrls: ['./appointment-update.component.scss']
})
export class AppointmentUpdateComponent {
  clinic: any;
  selectedServices: string[] = [];
  selectedSchedules: string[] = [];
  isFormValid: boolean = false;
  appointments: any[] = [];
  appointmentDate!: Date;
  timeSlots: string[] = [];
  selectedTimeSlot: string = '';

  constructor(
    private router: Router,
    private supabaseService: SupabaseService,
    public dialogRef: MatDialogRef<AppointmentUpdateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.fetchClinicDetails(data.appointmentId);
  }

  onClose(): void {
    this.dialogRef.close();
  }

  async fetchClinicDetails(appointmentId: string) {
    try {
      const { data: appointmentData, error: appointmentError } =
        await this.supabaseService
          .getSupabase()
          .from('appointment_tbl')
          .select('*')
          .eq('id', appointmentId)
          .single();
  
      if (appointmentError) {
        console.error('Error fetching appointment details:', appointmentError);
      } else {
        if (appointmentData) {
          if (appointmentData.aService) {
            // Split pre-selected services and schedules into arrays
            this.selectedServices = appointmentData.aService.split(',').map((service: string) => service.trim());
          }
  
          if (appointmentData.aSchedule) {
            // Split pre-selected schedules into arrays
            this.selectedSchedules = appointmentData.aSchedule.split(',').map((schedule: string) => schedule.trim());
          }
  
          const clinicId = appointmentData.aClinic_id;
  
          const { data: clinicData, error: clinicError } =
            await this.supabaseService
              .getSupabase()
              .from('clinic_tbl')
              .select('*')
              .eq('id', clinicId)
              .single();
  
          if (clinicError) {
            console.error('Error fetching clinic details:', clinicError);
          } else {
            if (clinicData) {
              console.log('Fetched clinic data:', clinicData); // Debug statement
              this.clinic = clinicData;
  
              // Fetch appointment date
              this.appointmentDate = new Date(appointmentData.aDate);
  
              // Generate time slots
              this.generateTimeSlots();
            } else {
              console.error('No clinic data found for the appointment ID:', appointmentId);
            }
          }
        } else {
          console.error('No appointment data found for the ID:', appointmentId);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
  

  // Function to generate time slots with 1-hour intervals
  generateTimeSlots(): void {
    const startTime = this.clinic.cSTime; // Start time from clinic details
    const endTime = this.clinic.cETime; // End time from clinic details

    // Extract hours and minutes from start and end times
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    // Create start and end dates to facilitate time calculations
    const startDate = new Date();
    startDate.setHours(startHour, startMinute, 0, 0);

    const endDate = new Date();
    endDate.setHours(endHour, endMinute, 0, 0);

    // Initialize current time to start time
    let currentTime = new Date(startDate);

    // Loop through the time range and generate time slots with 1-hour intervals
    while (currentTime <= endDate) {
      const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      this.timeSlots.push(timeString);
      
      // Increment current time by 1 hour
      currentTime.setHours(currentTime.getHours() + 1);
    }

    // Pre-select the appointment time slot
    const appointmentTime = new Date(this.appointmentDate);
    this.selectedTimeSlot = appointmentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  onUpdateAppointment() {
    // Show a confirmation dialog before updating the appointment
    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to update the appointment.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, update it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.updateAppointmentInDatabase();
      }
    });
  }

  async updateAppointmentInDatabase() {
    try {
      // Update the appointment in the database with the new selected services and schedules
      const updatedAppointmentData = {
        aService: this.selectedServices.join(', '), // Convert array to comma-separated string
        aSchedule: this.selectedSchedules.join(', '), // Convert array to comma-separated string
        aTime: this.selectedTimeSlot // Update the appointment time
      };

      // Update the appointment in the database
      const { error: updateError } = await this.supabaseService
        .getSupabase()
        .from('appointment_tbl')
        .update(updatedAppointmentData)
        .eq('id', this.data.appointmentId); // Filter by appointment ID

      if (updateError) {
        console.error('Error updating appointment:', updateError);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Failed to update the appointment. Please try again later.'
        });
      } else {
        // Display success message
        Swal.fire({
          icon: 'success',
          title: 'Appointment Updated',
          text: 'The appointment has been successfully updated.'
        });

        // Close the dialog
        this.dialogRef.close();

        // Fetch appointments again to refresh the data
        this.fetchAppointments();
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'An unexpected error occurred. Please try again later.'
      });
    }
  }

  async fetchAppointments() {
    try {
      // Fetch appointments from the server using your Supabase service
      const { data, error } = await this.supabaseService.getSupabase().from('appointment_tbl').select('*');

      if (error) {
        console.error('Error fetching appointments:', error);
      } else {
        // Update the appointments array with the fetched data
        this.appointments = data || [];
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  toggleSelectService(service: string): void {
    const index = this.selectedServices.indexOf(service);
    if (index !== -1) {
      // If the service is already selected, remove it
      this.selectedServices.splice(index, 1);
    } else {
      // If the service is not selected, add it
      this.selectedServices.push(service);
    }
    this.updateFormValidity();
  }

  toggleSelectSchedule(schedule: string): void {
    const index = this.selectedSchedules.indexOf(schedule);
    if (index !== -1) {
      // If the schedule is already selected, remove it
      this.selectedSchedules.splice(index, 1);
    } else {
      // If the schedule is not selected, add it
      this.selectedSchedules.push(schedule);
    }
    this.updateFormValidity();
  }

  updateFormValidity(): void {
    // Update the form validity based on the selected services, schedules, and time slot
    this.isFormValid = !!(this.selectedServices.length > 0 && this.selectedTimeSlot !== '');
  }
  
}
