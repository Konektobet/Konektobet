import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SupabaseService } from '../../service/supabase.service';

@Component({
  selector: 'app-clinic-details',
  templateUrl: './clinic-details.component.html',
  styleUrls: ['./clinic-details.component.scss'],
})
export class ClinicDetailsComponent {
  clinic: any;

  constructor(
    public dialogRef: MatDialogRef<ClinicDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private supabaseService: SupabaseService
  ) {
    this.clinic = data.clinic;
    this.loadAdditionalClinicDetails();
  }

  onClose(): void {
    this.dialogRef.close();
  }

  async loadAdditionalClinicDetails() {
    try {
      // Use the SupabaseService to fetch additional details based on the clinic ID or any other identifier
      const clinicId = this.clinic.id; // Update this based on your clinic object structure

      // Fetch additional details from Supabase
      const { data: additionalDetails, error } = await this.supabaseService
        .getSupabase()
        .from('clinic_tbl') // Update with the correct table name
        .select('*')
        .eq('cUsers_id', clinicId); // Update with the correct identifier

      if (error) {
        console.error('Error fetching additional clinic details:', error);
      } else {
        // Merge the additional details with the existing clinic data
        this.clinic = { ...this.clinic, ...additionalDetails };
      }
    } catch (error) {
      console.error('Error:', error);
      // Handle error appropriately
    }
  }
}
