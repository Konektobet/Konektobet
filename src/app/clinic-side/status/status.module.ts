import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StatusRoutingModule } from './status-routing.module';
import { StatusComponent } from './status.component';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';


@NgModule({
  declarations: [
    StatusComponent
  ],
  imports: [
    CommonModule,
    StatusRoutingModule,

    MatTableModule,
    MatIconModule,
    MatCardModule,
    
  ]
})
export class StatusModule { }
