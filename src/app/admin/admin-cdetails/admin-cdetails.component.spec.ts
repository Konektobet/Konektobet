import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCdetailsComponent } from './admin-cdetails.component';

describe('AdminCdetailsComponent', () => {
  let component: AdminCdetailsComponent;
  let fixture: ComponentFixture<AdminCdetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminCdetailsComponent]
    });
    fixture = TestBed.createComponent(AdminCdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
