import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SupabaseService } from '../../service/supabase.service';
import { InitialRecommendService } from 'src/app/service/initial-recommend.service';

interface Clinic {
profile: any;
  id: number;
  matchCount: any;
  cService: string;
  cSchedule: string;
  similarity?: number;
  rank?: number;
  logo: string;
  cName: string;
  cAddress: string;
}

interface Review {
  rrClinic_id: number;
  serviceRating: number;
  facilityRating: number;
  priceRating: number;
}

@Component({
  selector: 'app-clinic',
  templateUrl: './clinic.component.html',
  styleUrls: ['./clinic.component.scss'],
})
export class ClinicComponent implements OnInit {
  clinics: Clinic[] = [];
  reviews: Review[] = [];
  clinicsFound = false;
  selectedServiceSort: 'highest' | 'lowest' = 'highest';
  selectedFacilitySort: 'highest' | 'lowest' = 'highest';
  selectedPriceSort: 'highest' | 'lowest' = 'highest';

  isHovered: boolean = false;

  constructor(
    private supabaseService: SupabaseService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private initialRecommendService: InitialRecommendService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadClinics();
    this.loadReviews();
    this.fetchClinicLogo();

    this.initialRecommendService.matchedClinics$.subscribe((matchedClinics) => {
      this.clinics = matchedClinics.map((clinic) => ({
        ...clinic,
        similarity: undefined,
      }));
      this.clinicsFound = matchedClinics.length > 0;
      this.sortClinics(); // Sort clinics initially
      this.cdr.detectChanges();
    });
  }

  onMouseEnter() {
    this.isHovered = true;
  }

  onMouseLeave() {
    this.isHovered = false;
  }

  loadClinics() {
    this.supabaseService
      .getSupabase()
      .from('clinic_tbl')
      .select('*')
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching clinics:', error);
        } else {
          this.clinics = data;
          this.sortClinics(); // Sort clinics initially
          this.fetchClinicLogo();
        }
      });
  }

  loadReviews() {
    this.supabaseService
      .getSupabase()
      .from('ratesReviews_tbl')
      .select('*')
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching reviews:', error);
        } else {
          this.reviews = data;
        }
      });
  }

  getAverageRating(clinicId: number): { service: number; facility: number; price: number } {
    const relevantReviews = this.reviews.filter((review) => review.rrClinic_id === clinicId);
    const totalReviews = relevantReviews.length;
    if (totalReviews === 0) {
      return { service: 0, facility: 0, price: 0 };
    }
  
    const sumService = relevantReviews.reduce((acc, curr) => acc + curr.serviceRating, 0);
    const sumFacility = relevantReviews.reduce((acc, curr) => acc + curr.facilityRating, 0);
    const sumPrice = relevantReviews.reduce((acc, curr) => acc + curr.priceRating, 0);
  
    return {
      service: parseFloat((sumService / totalReviews).toFixed(1)),
      facility: parseFloat((sumFacility / totalReviews).toFixed(1)),
      price: parseFloat((sumPrice / totalReviews).toFixed(1)),
    };
  }

  sortClinics(sortBy?: 'service' | 'facility' | 'price'): void {
    switch (sortBy) {
      case 'service':
        this.clinics.sort((a, b) => {
          const ratingA = this.getAverageRating(a.id).service;
          const ratingB = this.getAverageRating(b.id).service;
          return this.selectedServiceSort === 'highest' ? ratingB - ratingA : ratingA - ratingB;
        });
        break;
      case 'facility':
        this.clinics.sort((a, b) => {
          const ratingA = this.getAverageRating(a.id).facility;
          const ratingB = this.getAverageRating(b.id).facility;
          return this.selectedFacilitySort === 'highest' ? ratingB - ratingA : ratingA - ratingB;
        });
        break;
      case 'price':
        this.clinics.sort((a, b) => {
          const ratingA = this.getAverageRating(a.id).price;
          const ratingB = this.getAverageRating(b.id).price;
          return this.selectedPriceSort === 'highest' ? ratingB - ratingA : ratingA - ratingB;
        });
        break;
      default:
        // Sort by service rating by default
        this.clinics.sort((a, b) => {
          const ratingA = this.getAverageRating(a.id).service;
          const ratingB = this.getAverageRating(b.id).service;
          return this.selectedServiceSort === 'highest' ? ratingB - ratingA : ratingA - ratingB;
        });
    }
  }

  generateStarRating(rating: number): string {
    const roundedRating = Math.round(rating);
    const fullStars = '★'.repeat(roundedRating);
    const emptyStars = '☆'.repeat(5 - roundedRating);

    return fullStars + emptyStars;
  }

  popSeeMoreDetails(clinic: any): void {
    this.router.navigate(['/new-details', clinic.id]);
  }

  async fetchClinicLogo() {
    for (const clinic of this.clinics) {
      const filename = `${clinic.cName}_clinicLogo`;
      try {
        const { data, error } = await this.supabaseService.getSupabase().storage
          .from('clinicLogo')
          .download(filename);
        // console.log(filename)

        if (error) {
          // console.error('Error fetching profile picture:', error);
          // Fallback to default image
          clinic.profile = 'assets/logo.png';
        } else {
          clinic.profile = URL.createObjectURL(data);
        }
      } catch (error) {
        // console.error('Error fetching profile picture:', error);
        // Fallback to default image
        clinic.profile = 'assets/logo.png';
      }
    }
  }
}
