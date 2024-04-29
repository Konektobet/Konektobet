import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PetProfileRoutingModule } from './pet-profile-routing.module';
import { PetProfileComponent } from './pet-profile.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';


@NgModule({
  declarations: [
    PetProfileComponent
  ],
  imports: [
    CommonModule,
    PetProfileRoutingModule,

    MatIconModule,
    MatButtonModule,
    MatCardModule,
  ]
})
export class PetProfileModule { }
