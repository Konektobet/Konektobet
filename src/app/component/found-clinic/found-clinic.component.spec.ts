import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoundClinicComponent } from './found-clinic.component';

describe('FoundClinicComponent', () => {
  let component: FoundClinicComponent;
  let fixture: ComponentFixture<FoundClinicComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FoundClinicComponent]
    });
    fixture = TestBed.createComponent(FoundClinicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
