import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UploadCoverComponent } from './upload-cover.component';

const routes: Routes = [{ path: '', component: UploadCoverComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UploadCoverRoutingModule { }
