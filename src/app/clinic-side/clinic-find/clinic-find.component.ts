import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { UpdateAppointmentComponent } from '../update-appointment/update-appointment.component';
import { SupabaseService } from 'src/app/service/supabase.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-clinic-find',
  templateUrl: './clinic-find.component.html',
  styleUrls: ['./clinic-find.component.scss']
})
export class ClinicFindComponent implements OnInit {
  appointments: any[] = [];
  filteredAppointments: any[] = [];
  selectedStatus: string = 'all';
  selectedMonth: string = 'all';
  selectedDay: string = 'all';
  selectedYear: string = 'all';
  uniqueMonths: string[] = [];
  uniqueDays: string[] = [];
  uniqueYears: string[] = [];

  redirectionPerformed: boolean = false;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    await this.fetchAppointments();
    this.initializeDates();
    this.filterAppointments();
    this.loadAcceptedClinic();
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
  
            if (!adminClinicError && adminClinicData && adminClinicData.length === 0 &&
                !clinicError && clinicData && clinicData.length === 0) {
              // No record found in admin_clinic_tbl and clinic_tbl, redirect to onboarding page
              this.router.navigate(['/clinic/onboarding']);
              console.log('Clinic data found:', clinicData)
              console.log('Admin data found:', adminClinicData)
            } else {
              // Redirect to clinic-home page
              // this.router.navigate(['/clinic/clinic-find']);
              console.log('Clinic data found:', clinicData)
              console.log('Admin data found:', adminClinicData)
            }

            this.redirectionPerformed = true;
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

  initializeDates() {
    // Populate months array (January to December)
    this.uniqueMonths = Array.from({ length: 12 }, (_, i) => {
      const monthIndex = i + 1;
      return new Date(2022, monthIndex - 1, 1).toLocaleString('en-US', { month: 'long' });
    });

    // Populate days array (1 to 31)
    this.uniqueDays = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

    // Populate years array (2023 to 2050)
    this.uniqueYears = Array.from({ length: 28 }, (_, i) => (2023 + i).toString());
  }

  filterAppointments() {
    console.log('Selected Status:', this.selectedStatus);
    console.log('Selected Date:', this.selectedMonth, this.selectedDay, this.selectedYear);
    
    // Filter by status and date simultaneously
    this.filteredAppointments = this.appointments.filter(appointment => {
      let statusMatch = true;
      let dateMatch = true;
  
      // Check status match
      if (this.selectedStatus !== 'all') {
        switch (this.selectedStatus) {
          case 'pending':
            statusMatch = appointment.status === 'Your appointment status is pending';
            break;
          case 'accepted':
            statusMatch = appointment.status === 'Your Appointment has been Approved';
            break;
          case 'rejected':
            statusMatch = appointment.status === 'Your appointment has been Rejected';
            break;
          default:
            statusMatch = true; // Default to true if 'all' is selected
            break;
        }
      }
  
      // Check date match
      if (this.selectedMonth !== 'all' || this.selectedDay !== 'all' || this.selectedYear !== 'all') {
        const appointmentDate = new Date(appointment.aDate);
        const selectedMonth = this.selectedMonth !== 'all' ? new Date(this.selectedMonth + ' 1, 2000').getMonth() : undefined;
        const selectedDay = this.selectedDay !== 'all' ? parseInt(this.selectedDay) : undefined;
        const selectedYear = this.selectedYear !== 'all' ? parseInt(this.selectedYear) : undefined;
  
        if (selectedMonth !== undefined && appointmentDate.getMonth() !== selectedMonth) {
          dateMatch = false;
        }
  
        if (selectedDay !== undefined && appointmentDate.getDate() !== selectedDay) {
          dateMatch = false;
        }
  
        if (selectedYear !== undefined && appointmentDate.getFullYear() !== selectedYear) {
          dateMatch = false;
        }
      }
  
      // Return true if both status and date match
      return statusMatch && dateMatch;
    });
  }

  getStatusColorClass(status: string): string {
    // Return CSS class based on appointment status
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

  popSeeMoreDetails(clinic: any): void {
    // Open dialog to show more details about the appointment
    const dialogRef = this.dialog.open(UpdateAppointmentComponent, {
      width: '500px',
      height: 'auto',
      data: { clinic }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Handle dialog close event
    });
  }

  formatDate(dateString: string): string {
    // Convert date string to Date object
    const date = new Date(dateString);
  
    // Extract date components
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Adding leading zero if necessary
    const day = ('0' + date.getDate()).slice(-2); // Adding leading zero if necessary
  
    // Return formatted date string (YYYY-MM-DD format)
    return `${year}-${month}-${day}`;
  }
  
}
