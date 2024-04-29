import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSelectionComponent } from './user-selection.component';

describe('UserSelectionComponent', () => {
  let component: UserSelectionComponent;
  let fixture: ComponentFixture<UserSelectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserSelectionComponent]
    });
    fixture = TestBed.createComponent(UserSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
