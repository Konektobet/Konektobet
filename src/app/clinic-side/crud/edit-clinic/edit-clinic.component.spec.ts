import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditClinicComponent } from './edit-clinic.component';

describe('EditClinicComponent', () => {
  let component: EditClinicComponent;
  let fixture: ComponentFixture<EditClinicComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditClinicComponent]
    });
    fixture = TestBed.createComponent(EditClinicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
