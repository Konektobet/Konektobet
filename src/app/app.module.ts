import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { DatePipe, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MenubarComponent } from './modules/menubar/menubar.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDialogModule } from '@angular/material/dialog';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { ClinicMenubarComponent } from './clinic-side/clinic-menubar/clinic-menubar.component';
import { AddClinicComponent } from './clinic-side/crud/add-clinic/add-clinic.component';

import { NgxMatFileInputModule } from '@angular-material-components/file-input';
import { EditClinicComponent } from './clinic-side/crud/edit-clinic/edit-clinic.component';
import { ClinicDetailsComponent } from './clinic-side/clinic-details/clinic-details.component';
import { RemoveQuotesPipe } from './pipes/remove-quotes.pipe';
import { RemoveBracketsPipe } from './pipes/remove-brackets.pipe';
import { HttpClientModule } from '@angular/common/http';
import { MatDividerModule } from '@angular/material/divider';
import { InitialPreferenceComponent } from './modules/initial-preference/initial-preference.component';
import { MatNativeDateModule } from '@angular/material/core';
import { AdminMenubarComponent } from './admin/admin-menubar/admin-menubar.component';
import { PaymentService } from './service/payment.service';

@NgModule({
  declarations: [
    AppComponent,
    MenubarComponent,
    ClinicMenubarComponent,
    AdminMenubarComponent,
    AddClinicComponent,
    EditClinicComponent,
    ClinicDetailsComponent,
    RemoveQuotesPipe,
    RemoveBracketsPipe,
    InitialPreferenceComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMatFileInputModule,
    HttpClientModule,
    MatSelectModule,
    MatDatepickerModule,
    MatToolbarModule,
    MatIconModule,
    MatInputModule,
    MatCardModule,
    MatFormFieldModule,
    MatButtonModule,
    MatMenuModule,
    MatSidenavModule,
    MatListModule,
    MatGridListModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatStepperModule,
    MatDialogModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatDialogModule,
    MatDividerModule,
    MatNativeDateModule,
  ],
  providers: [PaymentService, DatePipe, {provide: LocationStrategy, useClass: HashLocationStrategy}],
  bootstrap: [AppComponent]
})
export class AppModule { }
