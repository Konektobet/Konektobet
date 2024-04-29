import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ProfilePreviewComponent } from '../../preview/profile-preview/profile-preview.component';

@Component({
  selector: 'app-upload-image',
  templateUrl: './upload-image.component.html',
  styleUrls: ['./upload-image.component.scss']
})
export class UploadImageComponent {

  selectedImage: string | ArrayBuffer | null | undefined = null;

  constructor(
    private dialogRef: MatDialogRef<UploadImageComponent>,
    private dialog: MatDialog,
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      // Check file size
      if (file.size > 2 * 1024 * 1024) {
        // Notify the user about the file size limit
        alert('File size exceeds the limit of 2MB.');
        return; // Stop further processing
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedImage = e.target?.result;
      };
      reader.readAsDataURL(file);
    }
  }

  submitVax(): void {
    // Emit the selected image URL to the parent component
    this.dialogRef.close(this.selectedImage);
  }
}

// with open preview

//   onFileSelected(event: any): void {
//     const file: File = event.target.files[0];
//     if (file) {
//       // Check file size
//       if (file.size > 2 * 1024 * 1024) {
//         // Notify the user about the file size limit
//         alert('File size exceeds the limit of 2MB.');
//         return; // Stop further processing
//       }
      
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         this.selectedImage = e.target?.result;
//         // Open the profile preview modal
//         this.openProfilePreviewModal();
//       };
//       reader.readAsDataURL(file);
//     }
//   }

//   openProfilePreviewModal(): void {
//     const dialogRef = this.dialog.open(ProfilePreviewComponent, {
//       width: '40%',
//       height: 'auto',
//       data: { image: this.selectedImage } // Pass the selected image to the profile preview modal
//     });

//     dialogRef.afterClosed().subscribe(result => {
//       console.log('The profile preview modal was closed');
//     });
//   }
// }