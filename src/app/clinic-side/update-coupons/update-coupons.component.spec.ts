import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateCouponsComponent } from './update-coupons.component';

describe('UpdateCouponsComponent', () => {
  let component: UpdateCouponsComponent;
  let fixture: ComponentFixture<UpdateCouponsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateCouponsComponent]
    });
    fixture = TestBed.createComponent(UpdateCouponsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
