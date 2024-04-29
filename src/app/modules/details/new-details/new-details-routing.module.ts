import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewDetailsComponent } from './new-details.component';

const routes: Routes = [{ path: '', component: NewDetailsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NewDetailsRoutingModule { }
