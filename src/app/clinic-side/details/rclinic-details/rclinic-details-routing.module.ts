import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RclinicDetailsComponent } from './rclinic-details.component';

const routes: Routes = [{ path: '', component: RclinicDetailsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RclinicDetailsRoutingModule { }
