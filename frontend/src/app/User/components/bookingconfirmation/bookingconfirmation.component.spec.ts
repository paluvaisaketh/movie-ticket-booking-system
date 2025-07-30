import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingconfirmationComponent } from './bookingconfirmation.component';

describe('BookingconfirmationComponent', () => {
  let component: BookingconfirmationComponent;
  let fixture: ComponentFixture<BookingconfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingconfirmationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingconfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
