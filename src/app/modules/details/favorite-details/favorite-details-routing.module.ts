import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FavoriteDetailsComponent } from './favorite-details.component';

const routes: Routes = [{ path: '', component: FavoriteDetailsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FavoriteDetailsRoutingModule { }
