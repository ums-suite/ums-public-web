import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CampusInformationComponent } from './campus-information.component';

describe('CampusInformationComponent', () => {
  let fixture: ComponentFixture<CampusInformationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CampusInformationComponent],
      providers: [provideRouter([])],
    });
    fixture = TestBed.createComponent(CampusInformationComponent);
    fixture.detectChanges();
  });

  it('renders every facility card with a title and body', () => {
    const cards = fixture.nativeElement.querySelectorAll('.pweb-campus-information__facility');
    expect(cards.length).toBe(4);
  });

  it('links to the Downloads and Contact pages', () => {
    const links: HTMLAnchorElement[] = Array.from(fixture.nativeElement.querySelectorAll('a'));
    expect(links.some((a) => a.getAttribute('href') === '/downloads')).toBeTrue();
    expect(links.some((a) => a.getAttribute('href') === '/contact')).toBeTrue();
  });
});
