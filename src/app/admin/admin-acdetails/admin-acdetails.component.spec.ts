import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAcdetailsComponent } from './admin-acdetails.component';

describe('AdminAcdetailsComponent', () => {
  let component: AdminAcdetailsComponent;
  let fixture: ComponentFixture<AdminAcdetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminAcdetailsComponent]
    });
    fixture = TestBed.createComponent(AdminAcdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
