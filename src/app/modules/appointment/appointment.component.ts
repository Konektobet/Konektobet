import { Component, OnInit } from '@angular/core';
import { SupabaseService } from 'src/app/service/supabase.service';
import { MatDialog } from '@angular/material/dialog';
import { AppointmentUpdateComponent } from '../appointment-update/appointment-update.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.scss']
})
export class AppointmentComponent implements OnInit {
  appointments: any[] = [];
  appointment: any;
  filteredAppointments: any[] = [];
  selectedStatus: string = 'all';
  selectedMonth: string = 'all';
  selectedDay: string = 'all';
  selectedYear: string = 'all';
  uniqueMonths: string[] = [];
  uniqueDays: string[] = [];
  uniqueYears: string[] = [];

  constructor(
    private supabaseService: SupabaseService,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initializeDates();
    this.fetchAppointments();
  }

  async fetchAppointments() {
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
            const userId = userData[0].id;

            const { data: appointmentsData, error: appointmentsError } =
              await this.supabaseService
                .getSupabase()
                .from('appointment_tbl')
                .select('*')
                .eq('aUsers_id', userId);

            if (appointmentsError) {
              console.error('Error fetching appointments:', appointmentsError);
            } else {
              this.appointments = appointmentsData || [];

              // Filter appointments initially
              this.filterAppointments();
            }
          } else {
            console.error('No user data found for the logged-in user.');
          }
        }
      } else {
        console.warn('No logged-in user found.');
      }
    } catch (error) {
      console.error('Error:', error);
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

  extractUniqueDates() {
    // Extract unique months, days, and years from appointments
    this.uniqueMonths = Array.from(new Set(this.appointments.map(appointment => new Date(appointment.aDate).toLocaleString('en-US', { month: 'long' }))));
    this.uniqueDays = Array.from(new Set(this.appointments.map(appointment => new Date(appointment.aDate).getDate().toString())));
    this.uniqueYears = Array.from(new Set(this.appointments.map(appointment => new Date(appointment.aDate).getFullYear().toString())));
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

  openUpdateAppointment(appointmentId: string): void {
    const dialogRef = this.dialog.open(AppointmentUpdateComponent, {
      width: '500px',
      height: 'auto',
      data: { appointmentId }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The update appointment dialog was closed');
    });
  }
  
  isAppointmentPending(status: string): boolean {
    return status === 'Your appointment status is pending';
  }

  async deleteAppointment(appointmentId: string) {
    try {
      const isConfirmed = await Swal.fire({
        title: 'Are you sure?',
        text: 'You will not be able to recover this appointment!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3f51b5',
        confirmButtonText: 'Yes, delete it!'
      });
  
      if (isConfirmed.isConfirmed) {
        await this.deleteAppointmentFromDatabase(appointmentId);
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      Swal.fire(
        'Error!',
        'An error occurred while deleting the appointment.',
        'error'
      );
    }
  }
  
  private async deleteAppointmentFromDatabase(appointmentId: string): Promise<void> {
    try {
      // Delete appointment from 'appointment_tbl' based on the appointment ID
      await this.supabaseService
        .getSupabase()
        .from('appointment_tbl')
        .delete()
        .eq('id', appointmentId);
  
      // Find the index of the appointment in the local array
      const index = this.appointments.findIndex(appointment => appointment.id === appointmentId);
  
      // If the appointment is found in the local array, remove it using splice
      if (index !== -1) {
        this.appointments.splice(index, 1);
      }
  
      Swal.fire({
        icon: 'success',
        title: 'Appointment Deleted Successfully',
        text: 'Your appointment has been deleted.',
      }).then(() => {
        console.log(appointmentId);
      });
    } catch (error) {
      console.error('Error deleting appointment:', error);
      Swal.fire(
        'Error!',
        'An error occurred while deleting the appointment.',
        'error'
      );
    }
  }

  formatDate(dateString: string): string {
    // Convert date string to Date object
    const date = new Date(dateString);

    // Extract date components
    const year = date.getFullYear();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const day = date.getDate();

    // Return formatted date string
    return `${month} ${day}, ${year}`;
  }
}
