import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UploadProfileComponent } from './upload-profile.component';

const routes: Routes = [{ path: '', component: UploadProfileComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UploadProfileRoutingModule { }
