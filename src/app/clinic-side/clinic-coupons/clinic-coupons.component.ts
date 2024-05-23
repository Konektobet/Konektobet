import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SupabaseService } from '../../service/supabase.service';
import Swal from 'sweetalert2';
import { AddCouponsComponent } from '../add-coupons/add-coupons.component';
import { UpdateCouponsComponent } from '../update-coupons/update-coupons.component';

interface Coupon {
  id: number;
  cClinic_name: string;
  cDetails: string;
  cUser: number;
}

@Component({
  selector: 'app-clinic-coupons',
  templateUrl: './clinic-coupons.component.html',
  styleUrls: ['./clinic-coupons.component.scss']
})
export class ClinicCouponsComponent implements OnInit{
  coupons: Coupon[] = [];

  constructor(
    private supabaseService: SupabaseService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCoupons();
  }

  async loadCoupons() {
    try {
      const currentUser = await this.supabaseService.getClinicAuthStateSnapshot();

      if (currentUser) {
        console.log('Current user:', currentUser);
        const { data: userData, error: userError } = await this.supabaseService
          .getSupabase()
          .from('clinic_users_tbl')
          .select('id')
          .eq('email', currentUser.email);

        if (userError) {
          console.error('Error fetching user data:', userError);
        } else {
          console.log('User data:', userData);
          if (userData && userData.length > 0) {
            const userId = userData[0].id;

            const { data: couponsData, error: couponsError } = await this.supabaseService
              .getSupabase()
              .from('clinic_coupons_tbl')
              .select('id, cClinic_name, cDetails, cUser')
              .eq('cUser', userId);

            if (couponsError) {
              console.error('Error fetching coupons:', couponsError);
            } else {
              console.log('Coupons data:', couponsData);
              this.coupons = couponsData || [];
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

  popAddCoupon(): void {
    const dialogRef = this.dialog.open(AddCouponsComponent, {
      width: '30%',
      height: 'auto',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadCoupons(); // Reload coupons after adding a new one
      }
    });
  }

  popUpdateCoupon(coupon: Coupon): void {
    const dialogRef = this.dialog.open(UpdateCouponsComponent, {
      width: '30%',
      height: 'auto',
      data: { 
        couponId: coupon.id,
        clinicName: coupon.cClinic_name,
        details: coupon.cDetails 
      }
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadCoupons(); // Reload coupons after updating
      }
    });
  }

  async deleteCoupon(couponId: number) {
    try {
      const confirmation = await Swal.fire({
        title: 'Are you sure?',
        text: 'Once deleted, you will not be able to recover this coupon!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, keep it'
      });

      if (confirmation.isConfirmed) {
        const { error } = await this.supabaseService.getSupabase()
          .from('clinic_coupons_tbl')
          .delete()
          .eq('id', couponId);

        if (error) {
          console.error('Error deleting coupon:', error);
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong! Please try again later.'
          });
        } else {
          await this.supabaseService.getSupabase()
            .from('user_coupons_tbl')
            .delete()
            .eq('cCoupons', couponId);

          Swal.fire({
            icon: 'success',
            title: 'Deleted',
            text: 'Coupon deleted successfully!'
          });
          this.loadCoupons(); // Reload coupons after deletion
        }
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong! Please try again later.'
      });
    }
  }
}
