import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UploadImageRoutingModule } from './upload-image-routing.module';
import { UploadImageComponent } from './upload-image.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
  declarations: [
    UploadImageComponent
  ],
  imports: [
    CommonModule,
    UploadImageRoutingModule,

    MatButtonModule,
    MatIconModule,
  ]
})
export class UploadImageModule { }
