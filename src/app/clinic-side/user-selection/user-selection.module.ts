import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserSelectionRoutingModule } from './user-selection-routing.module';
import { UserSelectionComponent } from './user-selection.component';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [
    UserSelectionComponent
  ],
  imports: [
    CommonModule,
    UserSelectionRoutingModule,

    MatButtonModule,
  ]
})
export class UserSelectionModule { }
