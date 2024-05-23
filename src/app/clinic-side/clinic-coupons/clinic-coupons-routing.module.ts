import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClinicCouponsComponent } from './clinic-coupons.component';

const routes: Routes = [{ path: '', component: ClinicCouponsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClinicCouponsRoutingModule { }
