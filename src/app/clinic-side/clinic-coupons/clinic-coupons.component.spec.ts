import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClinicCouponsComponent } from './clinic-coupons.component';

describe('ClinicCouponsComponent', () => {
  let component: ClinicCouponsComponent;
  let fixture: ComponentFixture<ClinicCouponsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClinicCouponsComponent]
    });
    fixture = TestBed.createComponent(ClinicCouponsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
