import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PetDetailsRoutingModule } from './pet-details-routing.module';
import { PetDetailsComponent } from './pet-details.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';


@NgModule({
  declarations: [
    PetDetailsComponent
  ],
  imports: [
    CommonModule,
    PetDetailsRoutingModule,

    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    FormsModule,
    MatRadioModule,
    MatSelectModule,
  ]
})
export class PetDetailsModule { }
