import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminCdetailsComponent } from './admin-cdetails.component';

const routes: Routes = [{ path: '', component: AdminCdetailsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminCdetailsRoutingModule { }
