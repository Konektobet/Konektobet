import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddClinicComponent } from './add-clinic.component';

describe('AddClinicComponent', () => {
  let component: AddClinicComponent;
  let fixture: ComponentFixture<AddClinicComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddClinicComponent]
    });
    fixture = TestBed.createComponent(AddClinicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
