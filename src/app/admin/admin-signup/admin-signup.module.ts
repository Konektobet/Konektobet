import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminSignupRoutingModule } from './admin-signup-routing.module';
import { AdminSignupComponent } from './admin-signup.component';

import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';


@NgModule({
  declarations: [
    AdminSignupComponent
  ],
  imports: [
    CommonModule,
    AdminSignupRoutingModule,
    ReactiveFormsModule,

    MatIconModule,
    MatDividerModule,
  ]
})
export class AdminSignupModule { }
