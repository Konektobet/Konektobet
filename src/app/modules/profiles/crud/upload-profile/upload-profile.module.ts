import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UploadProfileRoutingModule } from './upload-profile-routing.module';
import { UploadProfileComponent } from './upload-profile.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
  declarations: [
    UploadProfileComponent
  ],
  imports: [
    CommonModule,
    UploadProfileRoutingModule,

    MatButtonModule,
    MatIconModule
  ]
})
export class UploadProfileModule { }
