import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchedDetailsComponent } from './matched-details.component';

describe('MatchedDetailsComponent', () => {
  let component: MatchedDetailsComponent;
  let fixture: ComponentFixture<MatchedDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MatchedDetailsComponent]
    });
    fixture = TestBed.createComponent(MatchedDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
