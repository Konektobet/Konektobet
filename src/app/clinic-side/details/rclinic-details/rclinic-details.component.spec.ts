import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RclinicDetailsComponent } from './rclinic-details.component';

describe('RclinicDetailsComponent', () => {
  let component: RclinicDetailsComponent;
  let fixture: ComponentFixture<RclinicDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RclinicDetailsComponent]
    });
    fixture = TestBed.createComponent(RclinicDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
