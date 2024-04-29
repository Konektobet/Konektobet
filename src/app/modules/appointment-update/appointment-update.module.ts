import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppointmentUpdateRoutingModule } from './appointment-update-routing.module';
import { AppointmentUpdateComponent } from './appointment-update.component';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';


@NgModule({
  declarations: [
    AppointmentUpdateComponent
  ],
  imports: [
    CommonModule,
    AppointmentUpdateRoutingModule,

    FormsModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatDatepickerModule,
    MatInputModule,
  ]
})
export class AppointmentUpdateModule { }
