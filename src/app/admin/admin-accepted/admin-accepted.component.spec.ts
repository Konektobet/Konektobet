import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAcceptedComponent } from './admin-accepted.component';

describe('AdminAcceptedComponent', () => {
  let component: AdminAcceptedComponent;
  let fixture: ComponentFixture<AdminAcceptedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminAcceptedComponent]
    });
    fixture = TestBed.createComponent(AdminAcceptedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
