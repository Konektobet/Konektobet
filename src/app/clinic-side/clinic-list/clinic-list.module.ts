import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClinicListRoutingModule } from './clinic-list-routing.module';
import { ClinicListComponent } from './clinic-list.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';


@NgModule({
  declarations: [
    ClinicListComponent,
  ],
  imports: [
    CommonModule,
    ClinicListRoutingModule,
    ReactiveFormsModule,

    MatCardModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    MatDialogModule,
  ]
})
export class ClinicListModule { }
