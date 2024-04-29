import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { UpdateAppointmentComponent } from '../update-appointment/update-appointment.component';
import { SupabaseService } from 'src/app/service/supabase.service';

@Component({
  selector: 'app-clinic-appointment',
  templateUrl: './clinic-appointment.component.html',
  styleUrls: ['./clinic-appointment.component.scss']
})
export class ClinicAppointmentComponent {
  appointments: any[] = [];

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    await this.fetchAppointments();
  }

  async fetchAppointments() {
    try {
      // Check if there is a logged-in clinic user
      const clinicUser = this.supabaseService.getClinicAuthStateSnapshot();

      if (clinicUser) {
        // Fetch clinic user's ID based on authentication information
        const { data: clinicUserData, error: clinicUserError } =
          await this.supabaseService
            .getSupabase()
            .from('clinic_users_tbl')
            .select('id')
            .eq('email', clinicUser.email);

        if (clinicUserError) {
          console.error('Error fetching clinic user data:', clinicUserError);
        } else if (clinicUserData && clinicUserData.length > 0) {
          const clinicUserId = clinicUserData[0].id;

          // Fetch all clinics associated with the clinic user
          const { data: clinicsData, error: clinicsError } =
            await this.supabaseService
              .getSupabase()
              .from('clinic_tbl')
              .select('id')
              .eq('cUsers_id', clinicUserId);

          if (clinicsError) {
            console.error('Error fetching clinics data:', clinicsError);
          } else {
            // Loop through each clinic and fetch appointments
            for (const clinic of clinicsData) {
              const clinicId = clinic.id;

              // Fetch appointments based on the clinic's ID
              const { data: appointmentsData, error: appointmentsError } =
                await this.supabaseService
                  .getSupabase()
                  .from('appointment_tbl')
                  .select('*')
                  .eq('aClinic_id', clinicId);

              if (appointmentsError) {
                console.error('Error fetching clinic appointments:', appointmentsError);
              } else {
                // Loop through each appointment
                for (const appointment of appointmentsData || []) {
                  const userId = appointment.aUsers_id;

                  // Fetch the user's firstname
                  const { data: userFirstNameData, error: userFirstNameError } =
                    await this.supabaseService
                      .getSupabase()
                      .from('users_tbl')
                      .select('firstname')
                      .eq('id', userId);

                  // Fetch the user's lastname
                  const { data: userLastNameData, error: userLastNameError } =
                    await this.supabaseService
                      .getSupabase()
                      .from('users_tbl')
                      .select('lastname')
                      .eq('id', userId);

                  if (userFirstNameError || userLastNameError) {
                    console.error('Error fetching user data:', userFirstNameError || userLastNameError);
                  } else {
                    // Update the appointment with the user's firstname and lastname
                    appointment.firstname = userFirstNameData[0]?.firstname;
                    appointment.lastname = userLastNameData[0]?.lastname;
                  }
                }

                // Merge appointmentsData into this.appointments
                this.appointments = this.appointments.concat(appointmentsData || []);
              }
            }
          }
        } else {
          console.error('No clinic user data found for the logged-in clinic user.');
        }
      } else {
        console.warn('No logged-in clinic user found.');
      }
    } catch (error) {
      console.error('Error:', error);
      // Handle error appropriately, display user-friendly message if needed
    }
  }

  getStatusColorClass(status: string): string {
    switch (status) {
      case 'Your appointment status is pending':
        return 'yellow-status';
      case 'Your Appointment has been approved':
        return 'green-status';
      case 'Your Appointment is Cancelled':
        return 'red-status';
      default:
        return '';
    }
  }

  // Function to open the Clinic Details dialog
  popSeeMoreDetails(clinic: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = window.innerWidth > 768 ? '55%' : '90%';
    dialogConfig.height = window.innerHeight > 768 ? 'auto' : '90%';
    dialogConfig.data = { clinic: clinic };

    const dialogRef = this.dialog.open(UpdateAppointmentComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      // Check if the result is defined and contains an appointmentId
      if (result && result.appointmentId) {
        // Navigate to the update-appointment page with the provided appointmentId
        this.router.navigate(['clinic/update-appointment', result.appointmentId]);
      }
      // Handle any other actions after the dialog is closed, if needed
    });
  }
}

