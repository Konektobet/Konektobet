import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SupabaseService } from '../../service/supabase.service';
import Swal from 'sweetalert2';

interface Clinic {
  id: number;
  cName: string;
}

@Component({
  selector: 'app-update-coupons',
  templateUrl: './update-coupons.component.html',
  styleUrls: ['./update-coupons.component.scss'],
})
export class UpdateCouponsComponent implements OnInit {
  clinics: Clinic[] = [];
  selectedClinic: string = '';
  couponDetails: string = '';

  constructor(
    private supabaseService: SupabaseService,
    private dialogRef: MatDialogRef<UpdateCouponsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { couponId: number; clinicName: string; details: string }
  ) {}

  ngOnInit(): void {
    this.loadClinics();
    this.selectedClinic = this.data.clinicName;
    this.couponDetails = this.data.details;
  }

  async loadClinics() {
    try {
      const { data: clinicsData, error: clinicsError } =
        await this.supabaseService
          .getSupabase()
          .from('clinic_tbl')
          .select('id, cName');

      if (clinicsError) {
        console.error('Error fetching clinics:', clinicsError);
      } else {
        this.clinics = clinicsData || [];
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async updateCoupon() {
    if (this.selectedClinic && this.couponDetails) {
      try {
        const { error } = await this.supabaseService
          .getSupabase()
          .from('clinic_coupons_tbl')
          .update({
            cClinic_name: this.selectedClinic,
            cDetails: this.couponDetails,
          })
          .eq('id', this.data.couponId);

        if (error) {
          console.error('Error updating coupon:', error);
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong! Please try again later.',
          });
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Coupon updated successfully!',
          });
          this.dialogRef.close(true);
        }
      } catch (error) {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong! Please try again later.',
        });
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Form',
        text: 'Please fill out all fields before submitting.',
      });
    }
  }
}
