import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AddPetComponent } from '../crud/add-pet/add-pet.component';
import { SupabaseService } from 'src/app/service/supabase.service';

@Component({
  selector: 'app-pet-profile',
  templateUrl: './pet-profile.component.html',
  styleUrls: ['./pet-profile.component.scss']
})
export class PetProfileComponent implements OnInit{

  pet: any;
  pets: any[] = [];
  profile = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private supabaseService: SupabaseService,
  ){}

  ngOnInit(): void {
    this.loadPets();
    this.fetchPetProfilePictures();
  }
  
  addPet(){
    // this.router.navigate(['/add-pet']);
    const dialogRef = this.dialog.open(AddPetComponent, {
      width: 'auto',
      height: 'auto',
    });

    // dialogRef.afterClosed().subscribe((result) => {
    //   if (result) {
    //     this.addClinic(result);
    //   }
    // });
  }

  goToPetDetails(){
    this.router.navigate(['/pet-details']);
  }

  async loadPets(){
    try{
      const currentUser = this.supabaseService.getAuthStateSnapshot()

      if(currentUser){
        const { data: userData, error: userError } = await this.supabaseService
        .getSupabase()
        .from('users_tbl')
        .select('id')
        .eq('email', currentUser.email)

        if(userError){
          console.error('Error fetching user data:', userError);
        } else{
          if(userData && userData.length > 0){
            const userId = userData[0].id;

            const { data: petsData, error: petsError } = await this.supabaseService
            .getSupabase()
            .from('pets_tbl')
            .select('*')
            .eq('pUsers_id', userId)

            if(petsError){
              console.error('Error fetching pet data:', petsError);
            } else {
              this.pets = petsData || []
              this.fetchPetProfilePictures();
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

  async fetchPetProfilePictures() {
    for (const pet of this.pets) {
      const filename = `${pet.petName}_${pet.pUsers_id}_petProfile`;
      try {
        const { data, error } = await this.supabaseService.getSupabase().storage
          .from('petProfile')
          .download(filename);
        console.log(filename)

        if (error) {
          console.error('Error fetching profile picture:', error);
          // Fallback to default image
          pet.profile = 'assets/defaultvax.png';
        } else {
          if (data) {
            pet.profile = URL.createObjectURL(data);
          } else {
            console.error('Profile picture not found:', filename);
            // Fallback to default image
            pet.profile = 'assets/defaultvax.png';
          }
        }
      } catch (error) {
        console.error('Error fetching profile picture:', error);
        // Fallback to default image
        pet.profile = 'assets/defaultvax.png';
      }
    }
  }
}
