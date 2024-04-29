import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClinicListComponent } from './clinic-list.component';

describe('ClinicListComponent', () => {
  let component: ClinicListComponent;
  let fixture: ComponentFixture<ClinicListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClinicListComponent]
    });
    fixture = TestBed.createComponent(ClinicListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
