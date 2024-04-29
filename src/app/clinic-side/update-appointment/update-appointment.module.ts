import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog'; // Import MatDialogModule
import { UpdateAppointmentRoutingModule } from './update-appointment-routing.module';
import { UpdateAppointmentComponent } from './update-appointment.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [
    UpdateAppointmentComponent
  ],
  imports: [
    CommonModule,
    UpdateAppointmentRoutingModule,
    MatDialogModule, // Include MatDialogModule here
    MatChipsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
  ]
})
export class UpdateAppointmentModule { }
