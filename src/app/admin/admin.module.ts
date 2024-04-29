import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { AdminMenubarComponent } from './admin-menubar/admin-menubar.component';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


@NgModule({
  declarations: [
    AdminComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,

    BrowserModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatIconModule,
  ]
})
export class AdminModule { }
