import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MakeFavAppointmentComponent } from './make-fav-appointment.component';

describe('MakeFavAppointmentComponent', () => {
  let component: MakeFavAppointmentComponent;
  let fixture: ComponentFixture<MakeFavAppointmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MakeFavAppointmentComponent]
    });
    fixture = TestBed.createComponent(MakeFavAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
