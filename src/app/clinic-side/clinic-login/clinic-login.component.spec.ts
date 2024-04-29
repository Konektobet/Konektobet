import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClinicLoginComponent } from './clinic-login.component';

describe('ClinicLoginComponent', () => {
  let component: ClinicLoginComponent;
  let fixture: ComponentFixture<ClinicLoginComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClinicLoginComponent]
    });
    fixture = TestBed.createComponent(ClinicLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
