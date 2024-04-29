import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClinicMenubarComponent } from './clinic-menubar.component';

describe('ClinicMenubarComponent', () => {
  let component: ClinicMenubarComponent;
  let fixture: ComponentFixture<ClinicMenubarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClinicMenubarComponent]
    });
    fixture = TestBed.createComponent(ClinicMenubarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
