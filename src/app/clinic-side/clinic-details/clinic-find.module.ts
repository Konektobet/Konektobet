import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClinicFindRoutingModule } from './clinic-find-routing.module';
import { ClinicFindComponent } from './clinic-find.component';


@NgModule({
  declarations: [
    ClinicFindComponent
  ],
  imports: [
    CommonModule,
    ClinicFindRoutingModule
  ]
})
export class ClinicFindModule { }
