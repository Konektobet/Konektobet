import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClinicFindComponent } from './clinic-find.component';

describe('ClinicFindComponent', () => {
  let component: ClinicFindComponent;
  let fixture: ComponentFixture<ClinicFindComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClinicFindComponent]
    });
    fixture = TestBed.createComponent(ClinicFindComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
