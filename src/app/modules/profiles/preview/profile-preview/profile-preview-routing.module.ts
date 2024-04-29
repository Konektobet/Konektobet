import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfilePreviewComponent } from './profile-preview.component';

const routes: Routes = [{ path: '', component: ProfilePreviewComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfilePreviewRoutingModule { }
