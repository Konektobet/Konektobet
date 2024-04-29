import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClinicFindRoutingModule } from './clinic-find-routing.module';
import { ClinicFindComponent } from './clinic-find.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [
    ClinicFindComponent
  ],
  imports: [
    CommonModule,
    ClinicFindRoutingModule,

    MatIconModule,
    MatButtonModule,
  ]
})
export class ClinicFindModule { }
