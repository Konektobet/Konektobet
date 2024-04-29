import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminAcceptedRoutingModule } from './admin-accepted-routing.module';
import { AdminAcceptedComponent } from './admin-accepted.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
  declarations: [
    AdminAcceptedComponent
  ],
  imports: [
    CommonModule,
    AdminAcceptedRoutingModule,

    MatCardModule,
    MatIconModule,
  ]
})
export class AdminAcceptedModule { }
