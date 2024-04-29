import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SupabaseService } from 'src/app/service/supabase.service';
import Swal from 'sweetalert2';
import { UploadImageComponent } from '../upload-image/upload-image.component';
import { DatePipe } from '@angular/common';
import { UploadProfileComponent } from '../upload-profile/upload-profile.component';
import { UploadCoverComponent } from '../upload-cover/upload-cover.component';

@Component({
  selector: 'app-add-pet',
  templateUrl: './add-pet.component.html',
  styleUrls: ['./add-pet.component.scss'],
})
export class AddPetComponent implements OnInit {
  petForm!: FormGroup;

  // vax card
  images: string[] = []; // Array to store image filenames
  currentImageIndex = 0; // Index to display the current image
  url = '';
  file!: File;
  showChooseFile = false;
  isEmailEditable = false;

  // profile pic
  profilePicture: File | null | undefined = null;

  // cover pic
  coverPicture: string | null = null;

  // vax pic
  vaxPicture: string | null = null;

  pet: any;
  pets: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private supabaseService: SupabaseService,
    public dialogRef: MatDialogRef<AddPetComponent>,
    private dialog: MatDialog,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.petForm = this.formBuilder.group({
      petName: ['', Validators.required],
      petAge: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      petSex: ['', Validators.required],
      petBreed: ['', Validators.required],
      petType: ['', Validators.required],
      petBday: ['', Validators.required],
      petWeight: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      petHeight: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
    });

    // Subscribe to petBday value changes
    this.petForm.get('petBday')!.valueChanges.subscribe((value) => {
      this.calculateAge(value);
    });

    // this.fetchAllImages();
    // this.fetchProfilePicture();
    this.loadPets();
  }

  onClose(): void {
    this.dialogRef.close();
  }

  // load pet
  async loadPets() {
    try {
      const currentUser = this.supabaseService.getAuthStateSnapshot();

      if (currentUser) {
        const { data: userData, error: userError } = await this.supabaseService
          .getSupabase()
          .from('users_tbl')
          .select('id')
          .eq('email', currentUser.email);

        if (userError) {
          console.error('Error fetching user data:', userError);
        } else {
          if (userData && userData.length > 0) {
            const userId = userData[0].id;

            const { data: petsData, error: petsError } =
              await this.supabaseService
                .getSupabase()
                .from('pets_tbl')
                .select('*')
                .eq('pUsers_id', userId);

            if (petsError) {
              console.error('Error fetching pet data:', petsError);
            } else {
              this.pets = petsData || [];
            }
          } else {
            console.error('No user data found for the logged-in user.');
          }
        }
      } else {
        console.error('No logged-in user found.');
      }
    } catch (error) {
      console.error('Error:', error);
      // Handle error appropriately
    }
  }

  // add pet
  async addPet() {
    if (this.petForm.valid) {
      try {
        const currentUser = this.supabaseService.getAuthStateSnapshot();

        if (currentUser) {
          const { data: userData, error: userError } =
            await this.supabaseService
              .getSupabase()
              .from('users_tbl')
              .select('id')
              .eq('email', currentUser.email);

          if (userError) {
            console.error('Error fetching user data:', userError);
          } else {
            if (userData && userData.length > 0) {
              const petData = {
                ...this.petForm.value,
                pUsers_id: userData[0].id,
                petBday: this.formatDate(this.petForm.value.petBday)
              };

              const { data: insertData, error: insertError } =
                await this.supabaseService
                  .getSupabase()
                  .from('pets_tbl')
                  .insert([petData]);

              await this.loadPets();

              if (insertError) {
                console.error('Error inserting pet:', insertError);
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'An error occurred while adding the pet. Please try again.',
                });
              } else {
                console.log('Pet added successfully:', insertData);

                Swal.fire({
                  icon: 'success',
                  title: 'Pet Added!',
                  text: 'Creating your pet profile success',
                });

                this.dialogRef.close(petData);
              }
            } else {
              console.error('No user data found for the logged-in user.');
            }
          }
        } else {
          console.error('No logged-in user found.');
        }
      } catch (error) {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while adding the pet. Please try again.',
        });
      }
    } else {
      // Handle validation error if needed
    }
  }

  formatDate(date: string): string {
    const [year, month, day] = date.split('-');
    return `${year}/${month}/${day}`;
  }

  // modal upload vax card
  async uploadImage() {
    const dialogRef = this.dialog.open(UploadImageComponent, {
      width: '45%',
      height: 'auto',
    });

    dialogRef.afterClosed().subscribe((result: string | null) => {
      if (result) {
        this.vaxPicture = result;
      }
    });
  }

  // modal upload profile
  uploadProfile(): void {
    const dialogRef = this.dialog.open(UploadProfileComponent, {
      width: '45%',
      height: 'auto',
    });

    dialogRef.afterClosed().subscribe((result: File | null) => {
      if (result) {
        // this.addPetProfile(result);
        this.profilePicture = result;
        // this.addPetProfile(result);
      }
    });
  }

  // modal upload cover
  async uploadCover() {
    const dialogRef = this.dialog.open(UploadCoverComponent, {
      width: '45%',
      height: 'auto',
    });

    dialogRef.afterClosed().subscribe((result: File | null) => {
      if (result) {
        // Save the image to the database
        this.addPetCover(result)
          .then(() => {
            // Once the image is saved, update the coverPicture variable
            this.coverPicture = URL.createObjectURL(result);
          })
          .catch((error: any) => {
            console.error('Error uploading cover picture:', error);
            // Handle error as needed
          });
      }
    });
  }

  // calculate birthday
  calculateAge(birthday: string) {
    if (!birthday) {
      // If birthday is empty
      this.petForm.get('petAge')!.setValue(''); // Set petAge to empty string
      return; // Exit the function
    }

    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    this.petForm.get('petAge')!.setValue(age);
  }

  // add vax card
  async addVaxCard(file: File) {
    if (file) {
      const currentUser = this.supabaseService.getAuthStateSnapshot();
      if (currentUser) {
        const { data: userData, error: userError } = await this.supabaseService
          .getSupabase()
          .from('users_tbl')
          .select('id')
          .eq('email', currentUser.email)
          .single();

        if (userError) {
          console.error('Error fetching user data:', userError);
          return;
        }

        if (userData) {
          const userId = userData.id;
          const petName = this.petForm.get('petName')?.value;
          const filename = `${userId}_${petName}_${Date.now()}_vaxCard`;

          const { data: uploadData, error: uploadError } =
            await this.supabaseService
              .getSupabase()
              .storage.from('vaxCard')
              .upload(filename, file, {
                cacheControl: '3600',
                upsert: true,
              });

          if (uploadError) {
            console.error('Error uploading new image:', uploadError);
            return;
          }

          console.log('Pet Vax Card uploaded successfully:', uploadData);
        }
      }
    } else {
      console.error('No file provided.');
    }
  }

  // add pet profile
  async addPetProfile(file: File) {
    if (file) {
      const currentUser = this.supabaseService.getAuthStateSnapshot();
      if (currentUser) {
        const { data: userData, error: userError } = await this.supabaseService
          .getSupabase()
          .from('users_tbl')
          .select('id')
          .eq('email', currentUser.email)
          .single();

        if (userError) {
          console.error('Error fetching user data:', userError);
          return;
        }

        if (userData) {
          const userId = userData.id;
          const petName = this.petForm.get('petName')?.value;
          const filename = `${userId}_${petName}_${Date.now()}_petProfile`;

          const { data: uploadData, error: uploadError } =
            await this.supabaseService
              .getSupabase()
              .storage.from('petProfile')
              .upload(filename, file, {
                cacheControl: '3600',
                upsert: true,
              });

          if (uploadError) {
            console.error('Error uploading new image:', uploadError);
            return;
          }

          console.log('Pet Profile uploaded successfully:', uploadData);
        }
      }
    } else {
      console.error('No file provided.');
    }
  }

  // add pet cover
  async addPetCover(file: File) {
    if (file) {
      const currentUser = this.supabaseService.getAuthStateSnapshot();
      if (currentUser) {
        const { data: userData, error: userError } = await this.supabaseService
          .getSupabase()
          .from('users_tbl')
          .select('id')
          .eq('email', currentUser.email)
          .single();

        if (userError) {
          console.error('Error fetching user data:', userError);
          return;
        }

        if (userData) {
          const userId = userData.id;
          const petName = this.petForm.get('petName')?.value;
          const filename = `${userId}_${petName}_${Date.now()}_petCover`;

          const { data: uploadData, error: uploadError } =
            await this.supabaseService
              .getSupabase()
              .storage.from('petCover')
              .upload(filename, file, {
                cacheControl: '3600',
                upsert: true,
              });

          if (uploadError) {
            console.error('Error uploading new image:', uploadError);
            return;
          }

          console.log('Pet Cover uploaded successfully:', uploadData);
        }
      }
    } else {
      console.error('No file provided.');
    }
  }

  getImageUrl(file: File): string | null {
    if (file instanceof Blob) {
      // Check if file is a Blob
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        return reader.result as string;
      };
    }
    return null;
  }

  // async onSelectProfile(e: any) {
  //   if (e.target.files && e.target.files.length > 0) {
  //     const file: File = e.target.files[0];
  //     const currentUser = this.supabaseService.getAuthStateSnapshot();
  //     // this.profilePicture = file;

  //     if (currentUser) {
  //       try {
  //         const { data: userData, error: userError } = await this.supabaseService
  //           .getSupabase()
  //           .from('users_tbl')
  //           .select('id')
  //           .eq('email', currentUser.email)
  //           .single();

  //         if (userError) {
  //           console.error('Error fetching user data:', userError);
  //           return;
  //         }

  //         if (userData) {
  //           const userId = userData.id;
  //           const petName = this.petForm.get('petName')?.value;
  //           const filename = `${userId}_${petName}_petProfile_${Date.now()}`;

  //           const { data: uploadData, error: uploadError } = await this.supabaseService.getSupabase().storage
  //             .from('petProfile')
  //             .upload(filename, file as File, {
  //               cacheControl: '3600',
  //               upsert: true,
  //             });

  //           if (uploadError) {
  //             console.error('Error uploading pet profile picture:', uploadError);
  //             return;
  //           }

  //           console.log('Pet profile uploaded successfully:', uploadData);
  //           // You may not need to convert the file to a data URL again since you already have the file object
  //         }
  //       } catch (error) {
  //         console.error('Error:', error);
  //       }
  //     }
  //   }
  // }

  // async fetchAllImages() {
  //   const currentUser = this.supabaseService.getAuthStateSnapshot();
  //   if (currentUser) {
  //     try {
  //       const { data: userData, error: userError } = await this.supabaseService
  //         .getSupabase()
  //         .from('users_tbl')
  //         .select('id')
  //         .eq('email', currentUser.email)
  //         .single();

  //       if (userError) {
  //         console.error('Error fetching user data:', userError);
  //       } else {
  //         if (userData) {
  //           const userId = userData.id;
  //           const petName = this.petForm.get('petName')?.value;
  //           const filename = `${petName}_${userId}_petProfile_${Date.now()}`;

  //           // Fetch the profile picture based on the constructed filename
  //           const { data, error } = await this.supabaseService.getSupabase().storage
  //             .from('petProfile')
  //             .download(filename);

  //           if (error) {
  //             console.error('Error fetching profile picture:', error);
  //           } else {
  //             // Set the profile picture URL to the fetched image
  //             this.url = URL.createObjectURL(data);
  //           }
  //         }
  //       }
  //     } catch (error) {
  //       console.error('Error fetching images:', error);
  //     }
  //   }
  // }

  // async displayCurrentImage() {
  //   // Display the user's uploaded profile picture
  //   const currentUser = this.supabaseService.getAuthStateSnapshot();
  //   if (currentUser) {
  //     try {
  //       const { data: userData, error: userError } = await this.supabaseService
  //         .getSupabase()
  //         .from('users_tbl')
  //         .select('id')
  //         .eq('email', currentUser.email)
  //         .single();

  //       if (userError) {
  //         console.error('Error fetching user data:', userError);
  //       } else {
  //         if (userData) {
  //           const userId = userData.id;
  //           const petName = this.petForm.get('petName')?.value;
  //           const filename = `${petName}_${userId}_petProfile_${Date.now()}`;

  //           // Fetch and display the profile picture
  //           await this.fetchImage(filename);
  //         }
  //       }
  //     } catch (error) {
  //       console.error('Error fetching profile picture:', error);
  //     }
  //   }
  // }
  async onSelectProfile(e: any) {
    if (e.target.files) {
      this.file = e.target.files[0];

      const currentUser = this.supabaseService.getAuthStateSnapshot();
      if (currentUser) {
        try {
          const { data: userData, error: userError } =
            await this.supabaseService
              .getSupabase()
              .from('users_tbl')
              .select('id')
              .eq('email', currentUser.email)
              .single();

          if (userError) {
            throw new Error('Error fetching user data');
          }

          if (!userData) {
            throw new Error('User data not found');
          }

          const userId = userData.id;
          const petName = this.petForm.get('petName')?.value;
          const filename = `${userId}_${petName}_petProfile_${Date.now()}`;

          const { data: currentImage, error: currentImageError } =
            await this.supabaseService
              .getSupabase()
              .storage.from('petProfile')
              .list();

          if (currentImageError) {
            throw new Error('Error fetching current image');
          }

          const { data: uploadData, error: uploadError } =
            await this.supabaseService
              .getSupabase()
              .storage.from('petProfile')
              .upload(filename, this.file as File, {
                cacheControl: '3600',
                upsert: false,
              });

          if (uploadError) {
            throw new Error('Error uploading new image');
          }

          console.log('Pet profile uploaded successfully:', uploadData);

          this.fetchAllImages(); // Fetch all images after successful upload
        } catch (error) {
          console.error('Error uploading pet profile picture:', error);
        }
      }
    }
  }

  async fetchAllImages() {
    const currentUser = this.supabaseService.getAuthStateSnapshot();
    if (currentUser) {
      try {
        const { data, error } = await this.supabaseService
          .getSupabase()
          .storage.from('petProfile')
          .list();

        if (error) {
          throw new Error('Error fetching images');
        }

        // Sort the images based on the creation timestamp in descending order
        this.images = data
          .sort((a, b) => b.created_at.localeCompare(a.created_at))
          .map((file) => file.name);

        // Fetch the latest image
        await this.displayCurrentImage();
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    }
  }

  async fetchImage(filename: string) {
    console.log('Fetching image:', filename);

    try {
      const { data, error } = await this.supabaseService
        .getSupabase()
        .storage.from('petProfile')
        .download(filename);

      if (error) {
        throw new Error('Error fetching image');
      }

      if (data) {
        this.url = URL.createObjectURL(data);
      } else {
        console.error('Image not found:', filename);
        this.url = 'assets/addPhoto.png'; // Fallback to default image
      }
    } catch (error) {
      console.error('Error fetching image:', error);
      this.url = 'assets/addPhoto.png'; // Fallback to default image
    }
  }

  async displayCurrentImage() {
    const currentUser = this.supabaseService.getAuthStateSnapshot();
    if (currentUser) {
      try {
        const { data: userData, error: userError } = await this.supabaseService
          .getSupabase()
          .from('users_tbl')
          .select('id')
          .eq('email', currentUser.email)
          .single();

        if (userError) {
          throw new Error('Error fetching user data');
        }

        if (!userData) {
          throw new Error('User data not found');
        }

        const userId = userData.id;
        const petName = this.petForm.get('petName')?.value;

        // Ensure filename construction matches upload logic
        const filename = `${userId}_${petName}_petProfile_${Date.now()}`;

        try {
          // Attempt to fetch the image
          await this.fetchImage(filename);
        } catch (error) {
          console.error('Error fetching profile picture:', error);
          this.url = 'assets/addPhoto.png'; // Fallback to default image
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
  }

  extractTimestamp(filename: string): number {
    const matches = filename.match(/_(\d+)_/);
    return matches ? parseInt(matches[1], 10) : 0;
  }
}
