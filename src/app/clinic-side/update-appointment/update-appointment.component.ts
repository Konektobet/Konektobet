import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SupabaseService } from 'src/app/service/supabase.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-update-appointment',
  templateUrl: './update-appointment.component.html',
  styleUrls: ['./update-appointment.component.scss']
})
export class UpdateAppointmentComponent implements OnInit {
  clinic: any;
  petDetails: any;

  constructor(
    public dialogRef: MatDialogRef<UpdateAppointmentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    // Fetch clinic and pet details based on the received ID
    this.fetchClinicDetails(data.clinic);
  }

  ngOnInit(): void {
    this.fetchAppointmentDetails();
  }

  onClose(): void {
    this.dialogRef.close();
  }

  async fetchClinicDetails(clinicId: string) {
    try {
      // Fetch clinic details based on the clinicId from appointment_tbl
      const { data: clinicData, error: clinicError } =
        await this.supabaseService
          .getSupabase()
          .from('appointment_tbl')
          .select('*')
          .eq('id', clinicId)
          .single();

      if (clinicError) {
        console.error('Error fetching clinic details:', clinicError);
      } else {
        this.clinic = clinicData;

        // Fetch pet details based on aPet_id
        const { data: petData, error: petError } =
          await this.supabaseService
            .getSupabase()
            .from('pets_tbl')
            .select('*')
            .eq('id', this.clinic.aPet_id)
            .single();

        if (petError) {
          console.error('Error fetching pet details:', petError);
        } else {
          this.petDetails = petData;
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  updateAppointment() {
    // Implement update appointment logic here
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


  async rejectAppointment() {
    const confirmation = await Swal.fire({
      icon: 'warning',
      title: 'Reject Appointment',
      text: 'Are you sure you want to reject this appointment?',
      showCancelButton: true,
      confirmButtonColor: '#ff4081',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Reject',
      cancelButtonText: 'Cancel'
    });
  
    if (confirmation.isConfirmed) {
      try {
        // Update the appointment status in appointment_tbl
        await this.supabaseService
          .getSupabase()
          .from('appointment_tbl')
          .update({ status: 'Your appointment has been Rejected' })
          .eq('id', this.clinic.id);
  
        // Show success alert
        Swal.fire({
          icon: 'success',
          title: 'Appointment Rejected',
          text: 'The appointment has been rejected!',
          showConfirmButton: false,
          timer: 1500
        });
  
        // Reload the page and navigate to clinic-find
        window.location.reload();
        this.router.navigateByUrl('clinic/clinic-find');
      } catch (error) {
        console.error('Error rejecting appointment:', error);
        // Show error alert
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'An error occurred while rejecting the appointment. Please try again later.',
        });
      }
    }
  }
  
  async acceptAppointment() {
    const confirmation = await Swal.fire({
      icon: 'warning',
      title: 'Accept Appointment',
      text: 'Are you sure you want to accept this appointment?',
      showCancelButton: true,
      confirmButtonColor: '#3f51b5',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Accept',
      cancelButtonText: 'Cancel'
    });
  
    if (confirmation.isConfirmed) {
      try {
        // Update the appointment status in appointment_tbl
        await this.supabaseService
          .getSupabase()
          .from('appointment_tbl')
          .update({ status: 'Your Appointment has been Approved' })
          .eq('id', this.clinic.id);
  
        Swal.fire({
          icon: 'success',
          title: 'Appointment Accepted',
          text: 'The appointment has been accepted!',
          showConfirmButton: false,
          timer: 1500
        });
  
        window.location.reload();
        this.router.navigateByUrl('clinic/clinic-find');
      } catch (error) {
        console.error('Error accepting appointment:', error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'An error occurred while accepting the appointment. Please try again later.',
        });
      }
    }
  }

  async concludeAppointment() {
    const confirmation = await Swal.fire({
      icon: 'warning',
      title: 'Conclude Appointment',
      text: 'Are you sure you want to conclude this appointment?',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Conclude',
      cancelButtonText: 'Cancel'
    });

    if (confirmation.isConfirmed) {
      try {
        await this.supabaseService
          .getSupabase()
          .from('appointment_tbl')
          .update({ status: 'Appointment is Concluded' })
          .eq('id', this.clinic.id);
  

        Swal.fire({
          icon: 'success',
          title: 'Appointment Concluded',
          text: 'The appointment has been concluded!',
          showConfirmButton: false,
          timer: 1500
        });
  
        window.location.reload();
        this.router.navigateByUrl('clinic/clinic-find');
      } catch (error) {
        console.error('Error concluding appointment:', error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'An error occurred while concluding the appointment. Please try again later.',
        });
      }
    }
  }

  isAppointmentAcceptedOrRejected(): boolean {
    return this.clinic && (this.clinic.status === 'Your Appointment has been Approved' || this.clinic.status === 'Your appointment has been Rejected');
  }

  isAppointmentApproved(): boolean {
    return this.clinic && this.clinic.status === 'Your Appointment has been Approved';
  }

  isConcluded(): boolean {
    return this.clinic && this.clinic.status === 'Appointment is Concluded';
  }

  async fetchAppointmentDetails() {
    try {
      // Fetch user's firstname
      const { data: userFirstNameData, error: userFirstNameError } =
        await this.supabaseService
          .getSupabase()
          .from('users_tbl')
          .select('firstname')
          .eq('id', this.clinic.aUsers_id);

      // Fetch user's lastname
      const { data: userLastNameData, error: userLastNameError } =
        await this.supabaseService
          .getSupabase()
          .from('users_tbl')
          .select('lastname')
          .eq('id', this.clinic.aUsers_id);

      if (userFirstNameError || userLastNameError) {
        console.error('Error fetching user data:', userFirstNameError || userLastNameError);
      } else {
        // Update the clinic with user's firstname and lastname
        this.clinic.firstname = userFirstNameData[0]?.firstname;
        this.clinic.lastname = userLastNameData[0]?.lastname;
      }
    } catch (error) {
      console.error('Error fetching appointment details:', error);
    }
  }

}
