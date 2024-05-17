import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { FindDetailsRoutingModule } from './find-details-routing.module';
import { FindDetailsComponent } from './find-details.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ClinicDetailsRoutingModule } from 'src/app/clinic-side/details/clinic-details/clinic-details-routing.module';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    FindDetailsComponent
  ],
  imports: [
    CommonModule,
    FindDetailsRoutingModule,

    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatRadioModule,
    MatSelectModule,
    ReactiveFormsModule
  ]
})
export class FindDetailsModule { }
