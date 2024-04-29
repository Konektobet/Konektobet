import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitialPreferenceComponent } from './initial-preference.component';

describe('InitialPreferenceComponent', () => {
  let component: InitialPreferenceComponent;
  let fixture: ComponentFixture<InitialPreferenceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InitialPreferenceComponent]
    });
    fixture = TestBed.createComponent(InitialPreferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
