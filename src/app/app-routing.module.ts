import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { InitialPreferenceComponent } from './modules/initial-preference/initial-preference.component';
import { NewDetailsComponent } from './modules/details/new-details/new-details.component';
import { FavoriteDetailsComponent } from './modules/details/favorite-details/favorite-details.component';
import { FavDetailsComponent } from './modules/details/fav-details/fav-details.component';
import { MatchedDetailsComponent } from './modules/details/matched-details/matched-details.component';
import { AdminCdetailsComponent } from './admin/admin-cdetails/admin-cdetails.component';
import { AdminAcdetailsComponent } from './admin/admin-acdetails/admin-acdetails.component';
import { ClinicDetailsComponent } from './clinic-side/details/clinic-details/clinic-details.component';
import { RclinicDetailsComponent } from './clinic-side/details/rclinic-details/rclinic-details.component';
import { PetDetailsComponent } from './modules/profiles/pet-details/pet-details.component';
import { FindDetailsComponent } from './modules/details/find-details/find-details.component';

const routes: Routes = [

  // user side
  { path: '', loadChildren: () => import('./modules/home/home.module').then(m => m.HomeModule) },
  { path: 'find', loadChildren: () => import('./modules/find/find.module').then(m => m.FindModule) },
  { path: 'clinic', loadChildren: () => import('./modules/clinic/clinic.module').then(m => m.ClinicModule) },
  { path: 'about', loadChildren: () => import('./modules/about/about.module').then(m => m.AboutModule) },
  { path: 'login', loadChildren: () => import('./modules/login/login.module').then(m => m.LoginModule) },
  { path: 'signup', loadChildren: () => import('./modules/signup/signup.module').then(m => m.SignupModule) },
  { path: 'user-profile', loadChildren: () => import('./modules/profiles/user-profile/user-profile.module').then(m => m.UserProfileModule) },
  { path: 'favorites', loadChildren: () => import('./modules/favorites/favorites.module').then(m => m.FavoritesModule) },
  { path: 'make-appointment', loadChildren: () => import('./modules/make-appointment/make-appointment.module').then(m => m.MakeAppointmentModule) },
  { path: 'appointment', loadChildren: () => import('./modules/appointment/appointment.module').then(m => m.AppointmentModule) },
  { path: 'maps', loadChildren: () => import('./modules/maps/maps.module').then(m => m.MapsModule) },
  { path: 'matched-details', loadChildren: () => import('./modules/details/matched-details/matched-details.module').then(m => m.MatchedDetailsModule) },
  { path: 'favorite-details', loadChildren: () => import('./modules/details/favorite-details/favorite-details.module').then(m => m.FavoriteDetailsModule) },
  { path: 'fav-details', loadChildren: () => import('./modules/details/fav-details/fav-details.module').then(m => m.FavDetailsModule) },
  { path: 'make-favAppointment', loadChildren: () => import('./modules/make-fav-appointment/make-fav-appointment.module').then(m => m.MakeFavAppointmentModule) },
  { path: 'make-matchedAppointment', loadChildren: () => import('./modules/make-matched-appointment/make-matched-appointment.module').then(m => m.MakeMatchedAppointmentModule) },
  { path: 'new-details', loadChildren: () => import('./modules/details/new-details/new-details.module').then(m => m.NewDetailsModule) },
  { path: 'ratings', loadChildren: () => import('./modules/ratings/ratings.module').then(m => m.RatingsModule) },
  { path: 'appointment-update', loadChildren: () => import('./modules/appointment-update/appointment-update.module').then(m => m.AppointmentUpdateModule) },
  { path: 'user-selection', loadChildren: () => import('./clinic-side/user-selection/user-selection.module').then(m => m.UserSelectionModule) },
  { path: 'find-details', loadChildren: () => import('./modules/details/find-details/find-details.module').then(m => m.FindDetailsModule) },

  // pet
  { path: 'pet-profile', loadChildren: () => import('./modules/profiles/pet-profile/pet-profile.module').then(m => m.PetProfileModule) },
  { path: 'add-pet', loadChildren: () => import('./modules/profiles/crud/add-pet/add-pet.module').then(m => m.AddPetModule) },
  { path: 'edit-pet', loadChildren: () => import('./modules/profiles/crud/edit-pet/edit-pet.module').then(m => m.EditPetModule) },
  { path: 'pet-details', loadChildren: () => import('./modules/profiles/pet-details/pet-details.module').then(m => m.PetDetailsModule) },

  // clinic side
  { path: 'clinic/clinic-login', loadChildren: () => import('./clinic-side/clinic-login/clinic-login.module').then(m => m.ClinicLoginModule) },
  { path: 'clinic/clinic-home', loadChildren: () => import('./clinic-side/clinic-home/clinic-home.module').then(m => m.ClinicHomeModule) },
  { path: 'clinic/clinic-list', loadChildren: () => import('./clinic-side/clinic-list/clinic-list.module').then(m => m.ClinicListModule) },
  { path: 'clinic/clinic-find', loadChildren: () => import('./clinic-side/clinic-find/clinic-find.module').then(m => m.ClinicFindModule) },
  { path: 'clinic/clinic-signup', loadChildren: () => import('./clinic-side/clinic-signup/clinic-signup.module').then(m => m.ClinicSignupModule) },
  { path: 'clinic/clinic-appointment', loadChildren: () => import('./clinic-side/clinic-appointment/clinic-appointment.module').then(m => m.ClinicAppointmentModule) },
  { path: 'clinic/status', loadChildren: () => import('./clinic-side/status/status.module').then(m => m.StatusModule) },
  { path: 'clinic/update-appointment', loadChildren: () => import('./clinic-side/update-appointment/update-appointment.module').then(m => m.UpdateAppointmentModule) },
  { path: 'clinic/clinic-details', loadChildren: () => import('./clinic-side/details/clinic-details/clinic-details.module').then(m => m.ClinicDetailsModule) },
  { path: 'clinic/rclinic-details', loadChildren: () => import('./clinic-side/details/rclinic-details/rclinic-details.module').then(m => m.RclinicDetailsModule) },
  { path: 'clinic/onboarding', loadChildren: () => import('./clinic-side/onboarding/onboarding.module').then(m => m.OnboardingModule) },

  // details
  { path: 'new-details/:id', component: NewDetailsComponent },
  { path: 'find-details/:id', component: FindDetailsComponent },
  { path: 'favorite-details/:id', component: FavoriteDetailsComponent },
  { path: 'fav-details/:id', component: FavDetailsComponent },
  { path: 'matched-details/:id', component: MatchedDetailsComponent },
  { path: 'admin-cdetails/:id', component: AdminCdetailsComponent },
  { path: 'admin-acdetails/:id', component: AdminAcdetailsComponent },
  { path: 'clinic/clinic-details/:id', component: ClinicDetailsComponent },
  { path: 'clinic/rclinic-details/:id', component: RclinicDetailsComponent },
  { path: 'profiles/pet-details/:id', component: PetDetailsComponent },

  // admin side
  { path: 'admin/admin-login', loadChildren: () => import('./admin/admin-login/admin-login.module').then(m => m.AdminLoginModule) },
  { path: 'admin/admin-signup', loadChildren: () => import('./admin/admin-signup/admin-signup.module').then(m => m.AdminSignupModule) },
  { path: 'admin/admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },
  { path: 'admin/admin-home', loadChildren: () => import('./admin/admin-home/admin-home.module').then(m => m.AdminHomeModule) },
  { path: 'admin/admin-accepted', loadChildren: () => import('./admin/admin-accepted/admin-accepted.module').then(m => m.AdminAcceptedModule) },
  { path: 'admin/admin-cdetails', loadChildren: () => import('./admin/admin-cdetails/admin-cdetails.module').then(m => m.AdminCdetailsModule) },
  { path: 'admin/admin-acdetails', loadChildren: () => import('./admin/admin-acdetails/admin-acdetails.module').then(m => m.AdminAcdetailsModule) },

  {
    path: 'initial-pref',
    component: InitialPreferenceComponent
  },
  { path: 'trial', loadChildren: () => import('./modules/trial/trial.module').then(m => m.TrialModule) },

  { path: 'upload-image', loadChildren: () => import('./modules/profiles/crud/upload-image/upload-image.module').then(m => m.UploadImageModule) },

  { path: 'cover-preview', loadChildren: () => import('./modules/profiles/preview/cover-preview/cover-preview.module').then(m => m.CoverPreviewModule) },

  { path: 'profile-preview', loadChildren: () => import('./modules/profiles/preview/profile-preview/profile-preview.module').then(m => m.ProfilePreviewModule) },

  { path: 'upload-profile', loadChildren: () => import('./modules/profiles/crud/upload-profile/upload-profile.module').then(m => m.UploadProfileModule) },

  { path: 'upload-cover', loadChildren: () => import('./modules/profiles/crud/upload-cover/upload-cover.module').then(m => m.UploadCoverModule) },

  { path: 'concluded', loadChildren: () => import('./modules/concluded/concluded.module').then(m => m.ConcludedModule) },

  { path: 'pricing', loadChildren: () => import('./modules/pricing/pricing.module').then(m => m.PricingModule) },

  { path: 'subs-confirmation', loadChildren: () => import('./modules/subs-confirmation/subs-confirmation.module').then(m => m.SubsConfirmationModule) },



];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
