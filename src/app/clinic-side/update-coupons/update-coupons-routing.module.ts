import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UpdateCouponsComponent } from './update-coupons.component';

const routes: Routes = [{ path: '', component: UpdateCouponsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UpdateCouponsRoutingModule { }
