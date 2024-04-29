import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoverPreviewComponent } from './cover-preview.component';

describe('CoverPreviewComponent', () => {
  let component: CoverPreviewComponent;
  let fixture: ComponentFixture<CoverPreviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoverPreviewComponent]
    });
    fixture = TestBed.createComponent(CoverPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
