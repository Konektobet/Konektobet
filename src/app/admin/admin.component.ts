import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { InitialRecommendService } from 'src/app/service/initial-recommend.service';
import { Router } from '@angular/router';
import { ClinicDetailsComponent } from 'src/app/modules/details/clinic-details/clinic-details.component';
import { SupabaseService } from '../service/supabase.service';
import { AdminCdetailsComponent } from './admin-cdetails/admin-cdetails.component';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {
  clinics: any[] = [];
  clinicsFound = false;

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

    this.initialRecommendService.matchedClinics$.subscribe((matchedClinics) => {
      // Check if the clinic is added to favorites
      const addedToFavorites = this.dialog.openDialogs.some(dialog => dialog.componentInstance instanceof AdminCdetailsComponent && dialog.componentInstance.addedToFavorites);

      // Update the clinics only if not added to favorites
      if (!addedToFavorites) {
        this.clinics = matchedClinics.map((clinic) => ({
          ...clinic,
          similarity: undefined,
        }));
        this.clinicsFound = matchedClinics.length > 0;
        this.cdr.detectChanges();
      }
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
      .from('admin_clinic_tbl')
      .select('*')
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching clinics:', error);
        } else {
          this.clinics = data;
        }
      });
  }

  popSeeMoreDetails(clinic: any): void {
    this.router.navigate(['/new-details', clinic.id]);
  }
}