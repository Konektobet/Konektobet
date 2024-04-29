import { Component, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ReviewService } from 'src/app/service/review.service';
import { SupabaseService } from 'src/app/service/supabase.service';
import Swal from 'sweetalert2';

export interface Review {
  user: string;
  timestamp: Date | string;
  content: string;
  serviceRating: number | undefined;
  facilityRating: number | undefined;
  priceRating: number | undefined;
}

interface Clinic {
  id: any
  matchCount: any;
  cService: string;
  cSchedule: string;
  // cHealthcare: string;
  similarity?: number;
  rank?: number;
  cName: string;
  cAddress: string;
  cEmail: string;
  cNumber: string;
  cVet: string;
  cLink: string;
  cPrice: string;
  cTime: string;
}

@Component({
  selector: 'app-ratings',
  templateUrl: './ratings.component.html',
  styleUrls: ['./ratings.component.scss']
})
export class RatingsComponent implements OnInit{
  selectedService!: string;
  selectedFacility!: string;
  selectedPrice!: string;

  reviews: Review[] = [];
  newReview: string = '';
  serviceRate: number | undefined;
  facilityRate: number | undefined;
  priceRate: number | undefined;

  firstname!: string;
  lastname!: string;

  // clinic
  clinics: any[] = [];
  clinicFeatures: Clinic[] = [];
  clinic: any;
  clinicId: any; // Declare clinicId as a property of the component


  showUsername : boolean = true;

  @Output() ratingSubmitted = new EventEmitter<Review>();
  @ViewChild(RatingsComponent) ratingsComponent!: RatingsComponent;
 
  ngOnInit(): void {
    this.loadUser();
    this.loadClinicFeatures();
  
    console.log('Data in RatingsComponent:', this.data); // Add this line
  
    // Retrieve the clinicId from the data object
    this.clinicId = this.data.clinicId;
    console.log('Clinic ID in RatingsComponent:', this.clinicId);
  
    // Load additional clinic details
    if (this.clinicId) {
      this.loadAdditionalClinicDetails(this.clinicId);
    } else {
      console.error('Clinic ID is undefined or null.');
    }
  }
  
  
  constructor(
    public dialogRef: MatDialogRef<RatingsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { clinicId: any },
    private supabaseService: SupabaseService,
    private reviewService: ReviewService,
    private route: ActivatedRoute,
    private router: Router,
  ){
    const clinicId = data.clinicId;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  // user
  async loadUser() {
    try {
      const currentUser = this.supabaseService.getAuthStateSnapshot();
  
      if (currentUser) {
        const { data: userData, error: userError } = await this.supabaseService
          .getSupabase()
          .from('users_tbl')
          .select('*')
          .eq('email', currentUser.email)
          .single();
  
        if (userError) {
          console.error('Error fetching user data:', userError);
        } else {
          if (userData) {
            this.firstname = userData.firstname;
            this.lastname = userData.lastname;
  
            // Fetch user preferences from the interest_tbl
            const { data: userPrefsData, error: userPrefsError } =
              await this.supabaseService
                .getSupabase()
                .from('interests_tbl')
                .select('*')
                .eq('iUsers_id', userData.id)
                .single();
  
            if (userPrefsError) {
              console.error('Error fetching user preferences:', userPrefsError);
            } else {
            }
          } else {
            console.error('No user data found for the logged-in user.');
          }
        }
      } else {
        console.log('No logged-in user');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // clinic
  async loadClinicFeatures() {
    try {
      const currentUser = await this.supabaseService.getAuthStateSnapshot();
  
      if (currentUser) {
        const { data: userData, error: userError } = await this.supabaseService
          .getSupabase()
          .from('users_tbl')
          .select('*')
          .eq('email', currentUser.email)
          .single();
  
        if (userError) {
          console.error('Error fetching user data:', userError);
        } else {
          if (userData) {
            const userId = userData.id;
  
            const clinicsData = await this.supabaseService
              .getSupabase()
              .from('clinic_tbl')
              .select('*')
              // .eq('Users_id', userId);
  
            if (!clinicsData.error) {
              this.clinics = clinicsData.data;
  
              // Ensure that there is at least one clinic available
              if (this.clinics.length > 0) {
                // Set the first clinic as the default clinic (you can modify this logic)
                this.clinic = this.clinics[0];
  
                // Load additional clinic details
                await this.loadAdditionalClinicDetails(this.clinic.id);
              }
            } else {
              console.error('Error fetching clinic features:', clinicsData.error);
            }
          }
        }
      } else {
        console.error('No logged-in user found. Redirecting to the login page.');
      }
    } catch (error) {
      console.error('Error fetching clinic features:', error);
    }
  }

  async loadAdditionalClinicDetails(clinicId: any) {
    try {
      // Continue only if clinicId is defined
      if (clinicId) {
        // Fetch additional details from Supabase
        const { data: additionalDetails, error } = await this.supabaseService
          .getSupabase()
          .from('clinic_tbl') // Update with the correct table name
          .select('*')
          .eq('id', clinicId); // Update with the correct identifier
  
        if (error) {
          console.error('Error fetching additional clinic details:', error);
        } else {
          // Merge the additional details with the existing clinic data
          this.clinic = { ...this.clinic, ...additionalDetails };
        }
      }
    } catch (error) {
      console.error('Error:', error);
      // Handle error appropriately
    }
  }

  async submitReview(clinicId: any) {
    try {
      const currentUser = this.supabaseService.getAuthStateSnapshot();
  
      if (currentUser) {
        const { data: userData, error: userError } = await this.supabaseService
          .getSupabase()
          .from('users_tbl')
          .select('id, firstname, lastname')
          .eq('email', currentUser.email);
  
        if (userError) {
          console.error('Error fetching user data:', userError);
        } else {
          if (userData && userData.length > 0) {
            // Fetch appointment details using the clinicId
            const { data: appointmentData, error: appointmentError } = await this.supabaseService
              .getSupabase()
              .from('appointment_tbl')
              .select('*')
              .eq('aClinic_id', clinicId)
  
            if (appointmentError) {
              console.error('Error fetching appointment details:', appointmentError);
              return; // Exit the function if there's an error fetching appointment details
            }
  
            // Fetch clinic details using aClinic_id foreign key from the appointment data
            const { data: clinicData, error: clinicError } = await this.supabaseService
              .getSupabase()
              .from('clinic_tbl')
              .select('*')
              .eq('id', clinicId);
  
            if (clinicError) {
              console.error('Error fetching clinic details:', clinicError);
              return; // Exit the function if there's an error fetching clinic details
            }
  
            const currentDate = new Date();
            const formattedDate = `${currentDate.getMonth() + 1}/${currentDate.getDate()}/${currentDate.getFullYear()}`;
            const formattedTime = this.formatAMPM(currentDate);
  
            const newReviewObj = {
              rrUsers_id: userData[0].id,
              rrClinic_id: clinicId,
              content: this.newReview,
              serviceRating: this.serviceRate,
              facilityRating: this.facilityRate,
              priceRating: this.priceRate,
              timestamp: `${formattedDate} ${formattedTime}`,
              user: this.showUsername ? `${userData[0].firstname} ${userData[0].lastname}` : this.maskUsername(),
            };
  
            const { data: insertData, error: insertError } = await this.supabaseService
              .getSupabase()
              .from('ratesReviews_tbl')
              .insert([newReviewObj]);
  
            if (insertError) {
              console.error('Error inserting rates and reviews', insertError);
            } else {
              console.log('Data inserted successfully');
  
              // Convert the new review data to the Review type
              const review: Review = {
                user: newReviewObj.user,
                timestamp: newReviewObj.timestamp,
                content: newReviewObj.content,
                serviceRating: newReviewObj.serviceRating,
                facilityRating: newReviewObj.facilityRating,
                priceRating: newReviewObj.priceRating,
              };
  
              Swal.fire({
                icon: 'success',
                title: 'Review added successfully!',
                text: 'Thank you for your review.',
              });
  
              // Emit the ratingSubmitted event with the converted review object
              this.ratingSubmitted.emit(review);
              this.reviews.unshift(review);
              this.dialogRef.close();
            }
          } else {
            console.error('No user data found for the logged-in user.');
          }
        }
      } else {
        this.router.navigate(['/login']);
        console.error('No logged-in user found');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
  


  maskUsername(): string {
    const maskedFirstName = this.firstname.charAt(0) + '*'.repeat(this.firstname.length - 1);
    const maskedLastName = '*' + this.lastname.charAt(this.lastname.length - 1);
  
    return `${maskedFirstName}${maskedLastName}`;
  }

  formatAMPM(date: Date): string {
    let hours = date.getHours();
    let minutes: any = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    minutes = minutes < 10 ? '0' + minutes : minutes;
    const strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

  onStarClick(rating: number, category: string): void {
    switch (rating) {
      case 5:
        this.setRating(category, 'Poor', 1);
        console.log('Poor');
        break;
      case 4:
        this.setRating(category, 'OK', 2);
        console.log('OK');
        break;
      case 3:
        this.setRating(category, 'Good', 3);
        console.log('Good');
        break;
      case 2:
        this.setRating(category, 'Great', 4);
        console.log('Great');
        break;
      case 1:
        this.setRating(category, 'Amazing', 5);
        console.log('Amazing');
        break;
      default:
        this.setRating(category, 'Invalid rating', 0);
    }
  }

  private setRating(category: string, rating: string, numericRating: number): void {
    switch (category) {
      case 'service':
        this.serviceRate = numericRating;
        this.selectedService = rating;
        break;
      case 'facility':
        this.facilityRate = numericRating;
        this.selectedFacility = rating;
        break;
      case 'price':
        this.priceRate = numericRating;
        this.selectedPrice = rating;
        break;
    }
  }
}