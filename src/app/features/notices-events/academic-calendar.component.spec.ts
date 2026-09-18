import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AcademicCalendarComponent } from './academic-calendar.component';

describe('AcademicCalendarComponent', () => {
  let fixture: ComponentFixture<AcademicCalendarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AcademicCalendarComponent] });
    fixture = TestBed.createComponent(AcademicCalendarComponent);
    fixture.detectChanges();
  });

  it('renders the honest "not yet available" empty state rather than fabricated session dates', () => {
    expect(fixture.nativeElement.querySelector('ums-empty-state')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Academic calendar is not yet available');
  });
});
