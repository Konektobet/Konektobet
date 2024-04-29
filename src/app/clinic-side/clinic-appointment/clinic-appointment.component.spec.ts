import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClinicAppointmentComponent } from './clinic-appointment.component';

describe('ClinicAppointmentComponent', () => {
  let component: ClinicAppointmentComponent;
  let fixture: ComponentFixture<ClinicAppointmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClinicAppointmentComponent]
    });
    fixture = TestBed.createComponent(ClinicAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
