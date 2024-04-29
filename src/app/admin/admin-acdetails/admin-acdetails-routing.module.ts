import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminAcdetailsComponent } from './admin-acdetails.component';

const routes: Routes = [{ path: '', component: AdminAcdetailsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminAcdetailsRoutingModule { }
