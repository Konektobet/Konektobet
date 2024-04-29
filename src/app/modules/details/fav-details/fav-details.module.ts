import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FavDetailsRoutingModule } from './fav-details-routing.module';
import { FavDetailsComponent } from './fav-details.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';


@NgModule({
  declarations: [
    FavDetailsComponent
  ],
  imports: [
    CommonModule,
    FavDetailsRoutingModule,

    MatButtonModule,
    MatIconModule,
    MatDividerModule,
  ]
})
export class FavDetailsModule { }
