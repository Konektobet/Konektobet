import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClinicLoginRoutingModule } from './clinic-login-routing.module';
import { ClinicLoginComponent } from './clinic-login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';


@NgModule({
  declarations: [
    ClinicLoginComponent
  ],
  imports: [
    CommonModule,
    ClinicLoginRoutingModule,
    ReactiveFormsModule,

    MatInputModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ]

})
export class ClinicLoginModule { }
