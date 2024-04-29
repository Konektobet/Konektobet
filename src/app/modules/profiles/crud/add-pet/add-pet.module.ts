import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AddPetRoutingModule } from './add-pet-routing.module';
import { AddPetComponent } from './add-pet.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [
    AddPetComponent
  ],
  imports: [
    CommonModule,
    AddPetRoutingModule,

    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatIconModule,
  ]
})
export class AddPetModule { }
