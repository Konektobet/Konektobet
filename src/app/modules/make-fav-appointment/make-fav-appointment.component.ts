import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SupabaseService } from 'src/app/service/supabase.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-make-fav-appointment',
  templateUrl: './make-fav-appointment.component.html',
  styleUrls: ['./make-fav-appointment.component.scss']
})
export class MakeFavAppointmentComponent {
  clinic: any;
  selectedServices: string[] = [];
  selectedSchedules: string[] = [];
  isFormValid: boolean = false;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    public dialogRef: MatDialogRef<MakeFavAppointmentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.clinic = data.clinic;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  async onMakeAppointment() {
    try {
      // Getting the current user
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
                .from('favMatched_tbl')
                .select('*')
                .eq('id', this.clinic.id);

                console.log(this.clinic.id)
  
            if (clinicError) {
              console.error('Error fetching clinic details:', clinicError);
              // Display user-friendly message here
              return;
            }
  
            // Extract necessary clinic details
            const clinicDetails = {
              aUsers_id: userData[0].id,
              aClinic_id: clinicData[0].id,
              aName: clinicData[0].fvmName,
              aService: this.selectedServices.join(', '), // Join selected services into a string
              aSchedule: this.selectedSchedules.join(', '), // Join selected schedules into a string
              status: 'Your appointment status is pending', // Set default status
            };

            // Insert the clinic info into the appointment table
            const { data: insertData, error: insertError } =
              await this.supabaseService
                .getSupabase()
                .from('appointment_tbl')
                .insert([clinicDetails]);
  
            if (insertError) {
              console.error('Error inserting appointment:', insertError);
              // Display user-friendly message here
            } else {
              console.log('Appointment added successfully:', insertData);
              // Display user-friendly success message with instructions if needed
              Swal.fire({
                icon: 'success',
                title: 'Appointment Success!',
                text: 'Kindly wait for the approval of your appointment.',
              });
              // Close the dialog
              this.dialogRef.close();
            }
          } else {
            console.error('No user data found for the logged-in user.');
          }
        }
      } else {
        // Handle the case where no user is logged in
        this.router.navigate(['/login']);
        this.dialogRef.close();
        console.error('No logged-in user found.');
      }
    } catch (error) {
      console.error('Error:', error);
      // Handle the error appropriately, display user-friendly message if needed
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
    this.updateFormValidity();
  }

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
    this.updateFormValidity();
  }

  updateFormValidity(): void {
    // Update form validity based on the presence of selected services and schedules
    this.isFormValid = !!(this.selectedServices.length > 0 && this.selectedSchedules.length > 0);
  }
}
