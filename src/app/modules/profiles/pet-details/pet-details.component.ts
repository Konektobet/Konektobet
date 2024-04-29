import { DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from 'src/app/service/supabase.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pet-details',
  templateUrl: './pet-details.component.html',
  styleUrls: ['./pet-details.component.scss'],
})
export class PetDetailsComponent implements OnInit {
  petForm!: FormGroup;

  pets: any[] = [];
  pet: any;

  isEditable = false;

  // profile picture
  images: string[] = []; // Array to store image filenames
  currentImageIndex = 0; // Index to display the current image
  file!: File;
  showChooseFile = false;

  profile = '';
  cover = '';
  vax = '';

  formChanged = false;
  initialFormValues: any;
  showForm = true;
  petId = this.route.snapshot.params['id'];

  constructor(
    private router: Router,
    private supabaseService: SupabaseService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder
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

    // Subscribe to form value changes
    this.petForm.valueChanges.subscribe(() => {
      // Set formChanged flag to true when the form values change
      this.formChanged = true;
    });

    this.loadPets();
    this.displayPetProfile();
    this.displayPetCover();
    this.displayVaxCard();
  }

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
            const petId = this.route.snapshot.params['id'];
            console.log(petId);
            const { data: petsData, error: petsError } =
              await this.supabaseService
                .getSupabase()
                .from('pets_tbl')
                .select('*')
                .eq('id', petId);

            if (petsError) {
              console.error('Error fetching pet data:', petsError);
            } else {
              this.pets = petsData || [];

              this.petForm.patchValue({
                petName: this.pets[0]?.petName || '',
                petBday: this.pets[0]?.petBday || '',
                petAge: this.pets[0]?.petAge || '',
                petType: this.pets[0]?.petType || '',
                petBreed: this.pets[0]?.petBreed || '',
                petSex: this.pets[0]?.petSex || '',
                petHeight: this.pets[0]?.petHeight || '',
                petWeight: this.pets[0]?.petWeight || '',
              });

              // Initialize initialFormValues
              this.initialFormValues = {
                petName: this.petForm.value.petName,
                petBday: this.petForm.value.petBday,
                petAge: this.petForm.value.petAge,
                petType: this.petForm.value.petType,
                petBreed: this.petForm.value.petBreed,
                petSex: this.petForm.value.petSex,
                petHeight: this.petForm.value.petHeight,
                petWeight: this.petForm.value.petWeight,
              };
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

  backToPets() {
    this.router.navigate(['/pet-profile']);
  }

  // reset form
  resetForm() {
    this.petForm.patchValue(this.initialFormValues);
    this.formChanged = false;
  }

  // edit pet details
  async editPet() {
    try {
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

        if (!userData) {
          console.error('No user data found for the logged-in user.');
          return;
        }

        const petId = this.route.snapshot.params['id'];

        // Retrieve the current pet details from the database
        const { data: petData, error: petError } = await this.supabaseService
          .getSupabase()
          .from('pets_tbl')
          .select('*')
          .eq('id', petId)
          .single();

        if (petError) {
          console.error('Error fetching pet data:', petError);
          return;
        }

        if (!petData) {
          console.error('Pet data not found.');
          return;
        }

        // Update the pet object with the form values
        this.pet = {
          petName: this.petForm.value.petName,
          petAge: this.petForm.value.petAge,
          petSex: this.petForm.value.petSex,
          petBreed: this.petForm.value.petBreed,
          petType: this.petForm.value.petType,
          petBday: this.petForm.value.petBday,
          petWeight: this.petForm.value.petWeight,
          petHeight: this.petForm.value.petHeight,
        };

        // Perform the update operation
        const { data: updateData, error: updateError } =
          await this.supabaseService
            .getSupabase()
            .from('pets_tbl')
            .update(this.pet)
            .eq('id', petId);

        if (updateError) {
          console.error('Error updating pet details:', updateError);
          // Handle error appropriately, e.g., show a message to the user
          return;
        }

        this.formChanged = false;

        // Show success message using SweetAlert
        Swal.fire({
          icon: 'success',
          title: 'Pet details updated successfully!',
          showConfirmButton: false,
          timer: 1500, // Close the alert after 1.5 seconds
        });

        console.log('Pet details updated successfully:', updateData);
      } else {
        console.error('No logged-in user found.');
      }
    } catch (error) {
      console.error('Error:', error);
      // Handle error appropriately, e.g., show a message to the user
    }
  }

  // remove pet 
  async removePet(petId: string) {
    try {
      // Display confirmation dialog using SweetAlert
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'You won\'t be able to revert this!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, remove it!'
      });
  
      if (result.isConfirmed) {
        // User confirmed the deletion
  
        // Perform the delete operation
        const { data: deleteData, error: deleteError } =
          await this.supabaseService
            .getSupabase()
            .from('pets_tbl')
            .delete()
            .eq('id', petId);
  
        if (deleteError) {
          console.error('Error deleting pet:', deleteError);
          // Handle error appropriately, e.g., show a message to the user
          return;
        }
  
        // Pet successfully deleted
        Swal.fire(
          'Deleted!',
          'Your pet has been removed.',
          'success'
        );

        this.router.navigate(['/pet-profile'])
  
        // Optionally, you can navigate the user to another page or refresh the pet list
      }
    } catch (error) {
      console.error('Error:', error);
      // Handle error appropriately, e.g., show a message to the user
    }
  }

  // pet profile
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
          const petId = this.route.snapshot.params['id'];

          // Fetch the pet name from the database
          const { data: petData, error: petError } = await this.supabaseService
            .getSupabase()
            .from('pets_tbl')
            .select('petName')
            .eq('id', petId)
            .single();

          if (petError) {
            throw new Error('Error fetching pet data');
          }

          if (!petData) {
            throw new Error('Pet data not found');
          }

          const petName = petData.petName;
          const filename = `${petName}_${userId}_petProfile`;

          // Fetch the current image filename
          const { data: currentImage, error: currentImageError } =
            await this.supabaseService
              .getSupabase()
              .storage.from('petProfile')
              .list();

          if (currentImageError) {
            throw new Error('Error fetching current profile');
          }

          const existingImage = currentImage.find(
            (image) => image.name === filename
          );

          // Delete the existing image if found
          if (existingImage) {
            const { error: deleteError } = await this.supabaseService
              .getSupabase()
              .storage.from('petProfile')
              .remove([existingImage.id]);

            if (deleteError) {
              throw new Error('Error deleting existing profile');
            }
          }

          // Upload the new image
          const { data: uploadData, error: uploadError } =
            await this.supabaseService
              .getSupabase()
              .storage.from('petProfile')
              .upload(filename, this.file as File, {
                cacheControl: '3600',
                upsert: true,
              });

          if (uploadError) {
            throw new Error('Error uploading new image');
          }

          console.log('Pet profile uploaded successfully:', uploadData);

          // Display the current image
          await this.displayPetProfile();
        } catch (error) {
          console.error('Error uploading pet profile picture:', error);
        }
      }
    }
  }

  async fetchProfile(filename: string) {
    console.log('Fetching profile:', filename);

    try {
      const { data, error } = await this.supabaseService
        .getSupabase()
        .storage.from('petProfile')
        .download(filename);

      if (error) {
        throw new Error('Error fetching profile');
      }

      if (data) {
        this.profile = URL.createObjectURL(data);
      } else {
        console.error('profile not found:', filename);
        this.profile = 'assets/defaultprofile.png'; // Fallback to default image
      }
    } catch (error) {
      // console.error('Error fetching profile:', error);
      this.profile = 'assets/defaultprofile.png'; // Fallback to default image
    }
  }

  async displayPetProfile() {
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
        const petId = this.route.snapshot.params['id'];

        // Fetch the pet name from the database
        const { data: petData, error: petError } = await this.supabaseService
          .getSupabase()
          .from('pets_tbl')
          .select('petName')
          .eq('id', petId)
          .single();

        if (petError) {
          throw new Error('Error fetching pet data');
        }

        if (!petData) {
          throw new Error('Pet data not found');
        }

        const petName = petData.petName;
        const filename = `${petName}_${userId}_petProfile`;

        try {
          // Attempt to fetch the image
          await this.fetchProfile(filename);
        } catch (error) {
          // console.error('Error fetching profile picture:', error);
          this.profile = 'assets/defaultprofile.png'; // Fallback to default image
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
  }

  // pet cover
  async onSelectCover(e: any) {
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
          const petId = this.route.snapshot.params['id'];
          const filename = `${userId}_${petId}_petCover`;

          // Fetch the current image filename
          const { data: currentImage, error: currentImageError } =
            await this.supabaseService
              .getSupabase()
              .storage.from('petCover')
              .list();

          if (currentImageError) {
            throw new Error('Error fetching current cover');
          }

          const existingImage = currentImage.find(
            (image) => image.name === filename
          );

          // Delete the existing image if found
          if (existingImage) {
            const { error: deleteError } = await this.supabaseService
              .getSupabase()
              .storage.from('petCover')
              .remove([existingImage.id]);

            if (deleteError) {
              throw new Error('Error deleting existing cover');
            }
          }

          // Upload the new image
          const { data: uploadData, error: uploadError } =
            await this.supabaseService
              .getSupabase()
              .storage.from('petCover')
              .upload(filename, this.file as File, {
                cacheControl: '3600',
                upsert: true,
              });

          if (uploadError) {
            throw new Error('Error uploading new cover');
          }

          console.log('Pet cover uploaded successfully:', uploadData);

          // Display the current image
          await this.displayPetCover();
        } catch (error) {
          console.error('Error uploading pet cover:', error);
        }
      }
    }
  }

  async fetchCover(filename: string) {
    console.log('Fetching cover:', filename);

    try {
      const { data, error } = await this.supabaseService
        .getSupabase()
        .storage.from('petCover')
        .download(filename);

      if (error) {
        throw new Error('Error fetching cover');
      }

      if (data) {
        this.cover = URL.createObjectURL(data);
      } else {
        console.error('Cover not found:', filename);
        this.cover = 'assets/defaultCover.png'; // Fallback to default image
      }
    } catch (error) {
      // console.error('Error fetching cover:', error);
      this.cover = 'assets/defaultCover.png'; // Fallback to default image
    }
  }

  async displayPetCover() {
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
        const petId = this.route.snapshot.params['id'];
        const filename = `${userId}_${petId}_petCover`;

        try {
          // Attempt to fetch the image
          await this.fetchCover(filename);
        } catch (error) {
          // console.error('Error fetching cover picture:', error);
          this.cover = 'assets/defaultCover.png'; // Fallback to default image
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
  }

  // vax card
  async onSelectVax(e: any) {
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
          const petId = this.route.snapshot.params['id'];
          const filename = `${userId}_${petId}_vaxCard`;

          // Fetch the current image filename
          const { data: currentImage, error: currentImageError } =
            await this.supabaseService
              .getSupabase()
              .storage.from('vaxCard')
              .list();

          if (currentImageError) {
            throw new Error('Error fetching current vax card');
          }

          const existingImage = currentImage.find(
            (image) => image.name === filename
          );

          // Delete the existing image if found
          if (existingImage) {
            const { error: deleteError } = await this.supabaseService
              .getSupabase()
              .storage.from('vaxCard')
              .remove([existingImage.id]);

            if (deleteError) {
              throw new Error('Error deleting existing image');
            }
          }

          // Upload the new image
          const { data: uploadData, error: uploadError } =
            await this.supabaseService
              .getSupabase()
              .storage.from('vaxCard')
              .upload(filename, this.file as File, {
                cacheControl: '3600',
                upsert: true,
              });

          if (uploadError) {
            throw new Error('Error uploading new vax card');
          }

          console.log('Vax card uploaded successfully:', uploadData);

          // Display the current image
          await this.displayVaxCard();
        } catch (error) {
          console.error('Error uploading vax card:', error);
        }
      }
    }
  }

  async fetchVaxCard(filename: string) {
    console.log('Fetching vax card:', filename);

    try {
      const { data, error } = await this.supabaseService
        .getSupabase()
        .storage.from('vaxCard')
        .download(filename);

      if (error) {
        throw new Error('Error fetching vax card');
      }

      if (data) {
        this.vax = URL.createObjectURL(data);
      } else {
        // console.error('Vax card not found:', filename);
        this.vax = 'assets/defaultvax.png'; // Fallback to default image
      }
    } catch (error) {
      // console.error('Error fetching vax card:', error);
      this.vax = 'assets/defaultvax.png'; // Fallback to default image
    }
  }

  async displayVaxCard() {
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
        const petId = this.route.snapshot.params['id'];
        const filename = `${userId}_${petId}_vaxCard`;

        try {
          // Attempt to fetch the image
          await this.fetchVaxCard(filename);
        } catch (error) {
          // console.error('Error fetching vax card:', error);
          this.vax = 'assets/defaultvax.png'; // Fallback to default image
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
  }
}
