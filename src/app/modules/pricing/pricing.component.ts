import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Session } from '@supabase/supabase-js';
import { SupabaseService } from 'src/app/service/supabase.service';
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss'],
})
export class PricingComponent implements OnInit {
  isPaid: boolean = false;
  user: Session | null = null;

  constructor(
    private router: Router,
    private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.getSubsInfo();
  }

  async getUserId(): Promise<string | null> {
    const currentUser = this.supabaseService.getAuthStateSnapshot();

    if (currentUser) {
      const { data: userData, error: userError } = await this.supabaseService
        .getSupabase()
        .from('users_tbl')
        .select('id')
        .eq('email', currentUser.email);

      if (userError) {
        console.error('Error fetching user ID:', userError);
        return null;
      }

      if (userData && userData.length > 0) {
        return userData[0].id; // Return the userId if found
      }
    }

    return null; // Return null if user data not found or no user logged in
  }

  async getSubsInfo() {
    const currentUser = this.supabaseService.getAuthStateSnapshot();

    if (currentUser) {
      const { data: userData, error: userError } = await this.supabaseService
        .getSupabase()
        .from('users_tbl')
        .select('id')
        .eq('email', currentUser.email);

      if (userError) {
        console.error('Error fetching user data:', userError);
        return;
      }

      if (userData && userData.length > 0) {
        const userId = userData[0].id;
        const { data: subsData, error: subsError } = await this.supabaseService
          .getSupabase()
          .from('subscribers_tbl')
          .select('subscribed')
          .eq('subsUsers_id', userId);

        if (subsError) {
          console.error('Error fetching subscription data:', subsError);
          return;
        }

        if (subsData && subsData.length > 0) {
          // If user is subscribed, set isPaid to true
          this.isPaid = subsData[0].subscribed === true;
        } else {
          // If no subscription data is found, set isPaid to false
          this.isPaid = false;
        }

        // Manually trigger change detection
        this.cdr.detectChanges();
      }
    }
  }

  async cancelSubscription() {
    const userId = await this.getUserId();
    if (!userId) return;

    try {
      const { data, error } = await this.supabaseService
        .getSupabase()
        .from('subscribers_tbl')
        .delete()
        .eq('subsUsers_id', userId);

      if (error) {
        throw new Error('Error cancelling subscription');
      }

      // Update local storage and UI
      this.isPaid = false;
      localStorage.setItem(`isPaid_${userId}`, 'false');
      this.cdr.detectChanges();

      Swal.fire('Cancelled!', 'Your subscription has been cancelled.', 'success');
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      Swal.fire('Error', 'There was an error cancelling your subscription. Please try again.', 'error');
    }
  }

  subsConfirmation() {
    if (this.isPaid) {
      Swal.fire({
        title: 'Are you sure?',
        text: "Do you really want to cancel your plan?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, cancel it!',
        cancelButtonText: 'No, keep it'
      }).then((result) => {
        if (result.isConfirmed) {
          this.cancelSubscription();
        }
      });
    } else {
      this.router.navigate(['/subs-confirmation']);
    }
  }
}
