import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavDetailsComponent } from './fav-details.component';

describe('FavDetailsComponent', () => {
  let component: FavDetailsComponent;
  let fixture: ComponentFixture<FavDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FavDetailsComponent]
    });
    fixture = TestBed.createComponent(FavDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
