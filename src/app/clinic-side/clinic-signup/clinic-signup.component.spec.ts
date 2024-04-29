import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClinicSignupComponent } from './clinic-signup.component';

describe('ClinicSignupComponent', () => {
  let component: ClinicSignupComponent;
  let fixture: ComponentFixture<ClinicSignupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClinicSignupComponent]
    });
    fixture = TestBed.createComponent(ClinicSignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
