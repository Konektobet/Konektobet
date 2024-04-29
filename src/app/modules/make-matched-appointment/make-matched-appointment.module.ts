import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MakeMatchedAppointmentRoutingModule } from './make-matched-appointment-routing.module';
import { MakeMatchedAppointmentComponent } from './make-matched-appointment.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [
    MakeMatchedAppointmentComponent
  ],
  imports: [
    CommonModule,
    MakeMatchedAppointmentRoutingModule,

    MatChipsModule,
    MatIconModule,
    MatButtonModule,
  ]
})
export class MakeMatchedAppointmentModule { }
