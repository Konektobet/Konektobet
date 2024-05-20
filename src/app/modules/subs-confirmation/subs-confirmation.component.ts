import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentService } from 'src/app/service/payment.service';
import { Session } from '@supabase/supabase-js';
import { SupabaseService } from 'src/app/service/supabase.service';

@Component({
  selector: 'app-subs-confirmation',
  templateUrl: './subs-confirmation.component.html',
  styleUrls: ['./subs-confirmation.component.scss']
})
export class SubsConfirmationComponent implements OnInit{
  errorMessage: string | null = null;
  loading: boolean = false; // Add loading variable
  user: Session | null = null;

  constructor(
    private paymentService: PaymentService,
    private router: Router,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit(): void {
    this.getUserId();
  }

  async proceedToPayment() {
    const currentUser = this.supabaseService.getAuthStateSnapshot();
  
    // Check if there is a logged-in user
    if (!currentUser) {
      // If no user logged in, navigate to login page
      this.router.navigate(['/login']);
      return;
    }
  
    try {
      this.loading = true; // Show loader
      const paymentLink = await this.paymentService.createPaymentLink(250, 'Premium Plan', 'Subscription for Premium Plan');
      const linkId = paymentLink.data.id;
      const paymentStatus = paymentLink.data.attributes.status;
  
      console.log('Initial Payment status:', paymentStatus);
  
      if (paymentStatus === 'unpaid') {
        window.open(paymentLink.data.attributes.checkout_url, '_blank');
        this.pollPaymentStatus(linkId);
      } else if (paymentStatus === 'paid') {
        console.log('Payment successful!');
        this.navigateToPricing(true); // Navigate to pricing and set paid to true
      } else {
        console.log('Payment status unknown. Please check your payment details.');
      }
    } catch (error: any) {
      this.errorMessage = 'Payment failed. Please try again.';
      console.error('Payment error:', error.message ? error.message : error);
    } finally {
      this.loading = false; // Hide loader
    }
  }

  async getUserId(): Promise<string | null> {
    const currentUser = this.supabaseService.getAuthStateSnapshot();
    
    if (currentUser) {
      const { data: userData, error: userError } = await this.supabaseService
        .getSupabase()
        .from('users_tbl')
        .select('id')
        .eq('email', currentUser.email);
      
      if (userData && userData.length > 0) {
        return userData[0].id; // Return the userId if found
      }
    }
    
    return null; // Return null if user data not found or no user logged in
  }

  async pollPaymentStatus(linkId: string) {
    const interval = 5000; // Poll every 5 seconds
    const maxAttempts = 24; // Poll for a maximum of 2 minutes

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const paymentLinkStatus = await this.paymentService.getPaymentLinkStatus(linkId);
        const paymentStatus = paymentLinkStatus.data.attributes.status;

        console.log(`Polling Payment status (Attempt ${attempt + 1}):`, paymentStatus);

        if (paymentStatus === 'paid') {
          console.log('Final Payment status: paid');
          this.navigateToPricing(true); // Navigate to pricing and set paid to true
          return;
        } else if (paymentStatus !== 'unpaid') {
          console.log('Payment status unknown. Please check your payment details.');
          return;
        }
      } catch (error: any) {
        console.error('Error polling payment status:', error.message ? error.message : error);
        this.errorMessage = 'Error checking payment status. Please try again.';
        return;
      }

      await this.delay(interval);
    }

    this.errorMessage = 'Payment timed out. Please try again.';
  }

  async navigateToPricing(isPaid: boolean) {
    // Get user ID from session
    const userId = await this.getUserId();
    
    if (!userId) {
      console.error('User ID not found.');
      return;
    }
    
    // Store payment status with user identifier in localStorage
    localStorage.setItem(`isPaid_${userId}`, isPaid ? 'true' : 'false');
    
    // Save subscription status to subscribers_tbl
    try {
      await this.saveSubscriptionStatus(userId, isPaid);
    } catch (error) {
      console.error('Error saving subscription status:', error);
      this.errorMessage = 'Error saving subscription status. Please try again.';
      return;
    }
    
    // Show loader before navigating
    this.loading = true;
    setTimeout(() => {
      this.router.navigate(['/pricing']);
      this.loading = false; // Hide loader after navigation
    }, 2000); // Delay before navigation
  }
  
  async saveSubscriptionStatus(userId: string, isPaid: boolean) {
    try {
      // Insert a new row into the subscribers_tbl table
      const { data, error } = await this.supabaseService
        .getSupabase()
        .from('subscribers_tbl')
        .insert([{ subsUsers_id: userId, subscribed: isPaid }]);
        
      if (error) {
        throw new Error('Error inserting subscription status');
      } else {
        if (data) {
          console.log('Insert successfully', data)
        }
      }
    } catch (error) {
      throw error;
    }
  }
  
  
  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
