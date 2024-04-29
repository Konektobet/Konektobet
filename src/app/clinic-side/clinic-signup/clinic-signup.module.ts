import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClinicSignupRoutingModule } from './clinic-signup-routing.module';
import { ClinicSignupComponent } from './clinic-signup.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';


@NgModule({
  declarations: [
    ClinicSignupComponent
  ],
  imports: [
    CommonModule,
    ClinicSignupRoutingModule,
    ReactiveFormsModule,

    MatIconModule,
    MatDividerModule,
  ]
})
export class ClinicSignupModule { }
