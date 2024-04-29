import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EditPetRoutingModule } from './edit-pet-routing.module';
import { EditPetComponent } from './edit-pet.component';


@NgModule({
  declarations: [
    EditPetComponent
  ],
  imports: [
    CommonModule,
    EditPetRoutingModule
  ]
})
export class EditPetModule { }
