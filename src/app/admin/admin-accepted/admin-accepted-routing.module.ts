import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminAcceptedComponent } from './admin-accepted.component';

const routes: Routes = [{ path: '', component: AdminAcceptedComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminAcceptedRoutingModule { }
