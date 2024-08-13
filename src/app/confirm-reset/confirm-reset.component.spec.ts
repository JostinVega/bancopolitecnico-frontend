import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmResetComponent } from './confirm-reset.component';

describe('ConfirmResetComponent', () => {
  let component: ConfirmResetComponent;
  let fixture: ComponentFixture<ConfirmResetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmResetComponent]
    });
    fixture = TestBed.createComponent(ConfirmResetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});