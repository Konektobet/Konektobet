import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UploadCoverRoutingModule } from './upload-cover-routing.module';
import { UploadCoverComponent } from './upload-cover.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
  declarations: [
    UploadCoverComponent
  ],
  imports: [
    CommonModule,
    UploadCoverRoutingModule,

    MatButtonModule,
    MatIconModule,
  ]
})
export class UploadCoverModule { }
