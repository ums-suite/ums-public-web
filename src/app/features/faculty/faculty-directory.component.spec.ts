import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FacultyDirectoryComponent } from './faculty-directory.component';

describe('FacultyDirectoryComponent', () => {
  let fixture: ComponentFixture<FacultyDirectoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [FacultyDirectoryComponent] });
    fixture = TestBed.createComponent(FacultyDirectoryComponent);
    fixture.detectChanges();
  });

  it('renders the honest "not yet available" empty state rather than a fabricated directory', () => {
    const emptyState = fixture.nativeElement.querySelector('ums-empty-state');
    expect(emptyState).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Faculty directory is not yet available');
  });

  it('never renders a member list or card grid -- there is no real data source for one', () => {
    expect(fixture.nativeElement.querySelectorAll('a').length).toBe(0);
  });
});
