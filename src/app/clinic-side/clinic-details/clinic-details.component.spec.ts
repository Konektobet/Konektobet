import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClinicDetailsComponent } from './clinic-details.component';

describe('ClinicDetailsComponent', () => {
  let component: ClinicDetailsComponent;
  let fixture: ComponentFixture<ClinicDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClinicDetailsComponent]
    });
    fixture = TestBed.createComponent(ClinicDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
