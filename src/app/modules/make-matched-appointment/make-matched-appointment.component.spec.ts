import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MakeMatchedAppointmentComponent } from './make-matched-appointment.component';

describe('MakeMatchedAppointmentComponent', () => {
  let component: MakeMatchedAppointmentComponent;
  let fixture: ComponentFixture<MakeMatchedAppointmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MakeMatchedAppointmentComponent]
    });
    fixture = TestBed.createComponent(MakeMatchedAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
