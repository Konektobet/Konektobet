import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubsConfirmationComponent } from './subs-confirmation.component';

describe('SubsConfirmationComponent', () => {
  let component: SubsConfirmationComponent;
  let fixture: ComponentFixture<SubsConfirmationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubsConfirmationComponent]
    });
    fixture = TestBed.createComponent(SubsConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
