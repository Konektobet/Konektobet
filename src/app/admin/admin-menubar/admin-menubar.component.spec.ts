import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminMenubarComponent } from './admin-menubar.component';

describe('AdminMenubarComponent', () => {
  let component: AdminMenubarComponent;
  let fixture: ComponentFixture<AdminMenubarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminMenubarComponent]
    });
    fixture = TestBed.createComponent(AdminMenubarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
