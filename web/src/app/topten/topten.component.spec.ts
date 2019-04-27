import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToptenComponent } from './topten.component';

describe('ToptenComponent', () => {
  let component: ToptenComponent;
  let fixture: ComponentFixture<ToptenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToptenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToptenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
