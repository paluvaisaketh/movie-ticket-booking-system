import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowsManagementComponent } from './shows-management.component';
describe('ShowsManagementComponent', () => {
  let component: ShowsManagementComponent;
  let fixture: ComponentFixture<ShowsManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowsManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowsManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
