import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClinicDetailsRoutingModule } from './clinic-details-routing.module';
import { ClinicDetailsComponent } from './clinic-details.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

@NgModule({
  declarations: [
    ClinicDetailsComponent
  ],
  imports: [
    CommonModule,
    ClinicDetailsRoutingModule,

    MatIconModule,
    MatDividerModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatOptionModule,
  ]
})
export class ClinicDetailsModule { }
