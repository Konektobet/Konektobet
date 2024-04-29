import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClinicRoutingModule } from './clinic-routing.module';
import { ClinicComponent } from './clinic.component';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { ClinicDetailsComponent } from '../details/clinic-details/clinic-details.component';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [
    ClinicComponent,
    ClinicDetailsComponent
  ],
  imports: [
    CommonModule,
    ClinicRoutingModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatSelectModule,
  ]
})
export class ClinicModule { }
