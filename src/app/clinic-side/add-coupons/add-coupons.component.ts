import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SupabaseService } from '../../service/supabase.service';
import Swal from 'sweetalert2';

interface Clinic {
  id: number;
  cName: string;
}
@Component({
  selector: 'app-add-coupons',
  templateUrl: './add-coupons.component.html',
  styleUrls: ['./add-coupons.component.scss']
})
export class AddCouponsComponent {
  clinics: Clinic[] = [];
  selectedClinic: string = '';
  couponDetails: string = '';
  userId: number | null = null;

  constructor(
    private supabaseService: SupabaseService,
    private dialogRef: MatDialogRef<AddCouponsComponent>
  ) {}

  ngOnInit(): void {
    this.loadClinics();
  }

  async loadClinics() {
    try {
      const currentUser = await this.supabaseService.getClinicAuthStateSnapshot();

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
            this.userId = userData[0].id;

            const { data: clinicsData, error: clinicsError } = await this.supabaseService
              .getSupabase()
              .from('clinic_tbl')
              .select('id, cName')
              .eq('cUsers_id', this.userId);

            if (clinicsError) {
              console.error('Error fetching clinics:', clinicsError);
            } else {
              this.clinics = clinicsData || [];
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
    }
  }

  async addCoupon() {
    if (this.selectedClinic && this.couponDetails && this.userId !== null) {
      const selectedClinic = this.clinics.find(clinic => clinic.cName === this.selectedClinic);
      if (!selectedClinic) {
        console.error('Selected clinic not found.');
        return;
      }

      try {
        const { error } = await this.supabaseService.getSupabase().from('clinic_coupons_tbl').insert({
          cClinic_id: selectedClinic.id,
          cClinic_name: this.selectedClinic,
          cDetails: this.couponDetails,
          cUser: this.userId
        });

        if (error) {
          console.error('Error adding coupon:', error);
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong! Please try again later.'
          });
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Coupon added successfully!'
          });
          this.dialogRef.close(true);
        }
      } catch (error) {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong! Please try again later.'
        });
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Form',
        text: 'Please fill out all fields before submitting.'
      });
    }
  }
}
