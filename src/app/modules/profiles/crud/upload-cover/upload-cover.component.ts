import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-upload-cover',
  templateUrl: './upload-cover.component.html',
  styleUrls: ['./upload-cover.component.scss']
})
export class UploadCoverComponent {
  selectedImage: string | ArrayBuffer | null | undefined = null;

  constructor(
    private dialogRef: MatDialogRef<UploadCoverComponent>,
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

  submitCover(): void {
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
