import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FavoriteDetailsRoutingModule } from './favorite-details-routing.module';
import { FavoriteDetailsComponent } from './favorite-details.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';


@NgModule({
  declarations: [
    FavoriteDetailsComponent
  ],
  imports: [
    CommonModule,
    FavoriteDetailsRoutingModule,

    MatIconModule,
    MatButtonModule,
    MatDividerModule,
  ]
})
export class FavoriteDetailsModule { }
