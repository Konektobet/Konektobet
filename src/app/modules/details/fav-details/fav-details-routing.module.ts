import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FavDetailsComponent } from './fav-details.component';

const routes: Routes = [{ path: '', component: FavDetailsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FavDetailsRoutingModule { }
