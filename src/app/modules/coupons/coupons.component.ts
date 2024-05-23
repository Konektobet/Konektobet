import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SupabaseService } from '../../service/supabase.service';
import Swal from 'sweetalert2';

interface Coupon {
  id: number;
  cClinic_name: string;
  cDetails: string;
}

@Component({
  selector: 'app-coupons',
  templateUrl: './coupons.component.html',
  styleUrls: ['./coupons.component.scss'],
})
export class CouponsComponent implements OnInit{
  coupons: Coupon[] = [];
  loading: boolean = false;
  
  constructor(
    private supabaseService: SupabaseService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUserCoupons();
  }

  async loadUserCoupons() {
    try {
      const currentUser = await this.supabaseService.getClinicAuthStateSnapshot();

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

            const { data: userCouponsData, error: userCouponsError } = await this.supabaseService
              .getSupabase()
              .from('user_coupons_tbl')
              .select('cCoupons')
              .eq('cUser_coupons', userId);

            if (userCouponsError) {
              console.error('Error fetching user coupons:', userCouponsError);
            } else {
              const couponIds = userCouponsData.map(coupon => coupon.cCoupons);

              const { data: couponsData, error: couponsError } = await this.supabaseService
                .getSupabase()
                .from('clinic_coupons_tbl')
                .select('id, cClinic_name, cDetails')
                .in('id', couponIds);

              if (couponsError) {
                console.error('Error fetching coupons:', couponsError);
              } else {
                this.coupons = couponsData || [];
              }
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

  async claimCoupon(coupon: Coupon) {
    try {
      const currentUser = await this.supabaseService.getClinicAuthStateSnapshot();
      if (!currentUser) {
        throw new Error('No logged-in user found.');
      }
  
      // Retrieve the userId
      const { data: userData, error: userError } = await this.supabaseService
        .getSupabase()
        .from('users_tbl')
        .select('id')
        .eq('email', currentUser.email);
  
      if (userError) {
        console.error('Error fetching user data:', userError);
        throw new Error('Error fetching user data');
      }
  
      const userId = userData && userData.length > 0 ? userData[0].id : null;
  
      if (!userId) {
        throw new Error('No user data found for the logged-in user.');
      }
  
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: `Do you want to claim the coupon "${coupon.cClinic_name}"?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, claim it!'
      });
  
      if (result.isConfirmed) {
        // Delete the claimed coupon from the user_coupons_tbl
        await this.supabaseService
          .getSupabase()
          .from('user_coupons_tbl')
          .delete()
          .eq('cUser_coupons', userId)
          .eq('cCoupons', coupon.id);
  
        // Display success SweetAlert after successfully claiming the coupon
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: `Coupon "${coupon.cClinic_name}" claimed successfully!`,
        });
  
        // Remove claimed coupon from the list
        this.coupons = this.coupons.filter(c => c.id !== coupon.id);
      }
    } catch (error) {
      console.error('Error claiming coupon:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to claim coupon. Please try again later.',
      });
    }
  }
  
}
