import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-profile-preview',
  templateUrl: './profile-preview.component.html',
  styleUrls: ['./profile-preview.component.scss']
})
export class ProfilePreviewComponent {

  selectedImage: string | ArrayBuffer | null;

  constructor(
    public dialogRef: MatDialogRef<ProfilePreviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Retrieve the selected image from the data passed to the dialog
    this.selectedImage = data.image;
  }

  onClose(): void {
    this.dialogRef.close();
  }
}