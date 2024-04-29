import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConcludedComponent } from './concluded.component';

const routes: Routes = [{ path: '', component: ConcludedComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConcludedRoutingModule { }
