import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MakeAppointmentRoutingModule } from './make-appointment-routing.module';
import { MakeAppointmentComponent } from './make-appointment.component';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';


@NgModule({
  declarations: [
    MakeAppointmentComponent
  ],
  imports: [
    CommonModule,
    MakeAppointmentRoutingModule,

    FormsModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatDatepickerModule,
    MatInputModule,
  ]
})
export class MakeAppointmentModule { }
