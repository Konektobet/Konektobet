import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ProfilePreviewComponent } from '../../preview/profile-preview/profile-preview.component';

@Component({
  selector: 'app-upload-profile',
  templateUrl: './upload-profile.component.html',
  styleUrls: ['./upload-profile.component.scss']
})
export class UploadProfileComponent {

  selectedImage: File | null = null;

  constructor(
    private dialogRef: MatDialogRef<UploadProfileComponent>,
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
        const dataUrl: string = e.target?.result as string;
        this.convertDataUrlToFile(dataUrl, file.name, file.type).then((convertedFile) => {
          this.selectedImage = convertedFile;
          // Open the profile preview modal
          // this.openProfilePreviewModal();
        }).catch((error) => {
          console.error('Error converting data URL to file:', error);
        });
      };
      reader.readAsDataURL(file);
    }
  }

  convertDataUrlToFile(dataUrl: string, filename: string, mimeType: string): Promise<File> {
    return fetch(dataUrl)
      .then(response => response.blob())
      .then(blob => new File([blob], filename, { type: mimeType }));
  }

  openProfilePreviewModal(): void {
    const dialogRef = this.dialog.open(ProfilePreviewComponent, {
      width: '40%',
      height: 'auto',
      data: { image: this.selectedImage } // Pass the selected image to the profile preview modal
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The profile preview modal was closed');
    });
  }

  submitProfile(): void {
    // Emit the selected image File to the parent component
    this.dialogRef.close(this.selectedImage);
  }
}