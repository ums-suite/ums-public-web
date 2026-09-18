import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ResponsiveImageComponent } from './responsive-image.component';

describe('ResponsiveImageComponent', () => {
  let fixture: ComponentFixture<ResponsiveImageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ResponsiveImageComponent] });
    fixture = TestBed.createComponent(ResponsiveImageComponent);
    fixture.componentRef.setInput('src', 'https://example.edu/photo.jpg');
    fixture.componentRef.setInput('alt', 'Campus');
  });

  it('reserves the aspect-ratio box on the host before the image loads (no layout shift)', () => {
    fixture.componentRef.setInput('aspectRatio', '4/3');
    fixture.detectChanges();

    // The browser normalizes the CSS value's serialization (spaces around the slash) on read-back.
    expect(fixture.nativeElement.style.aspectRatio).toBe('4 / 3');
    expect(fixture.nativeElement.classList).not.toContain('pweb-responsive-image--loaded');
  });

  it('renders alt text for a non-decorative image', () => {
    fixture.detectChanges();
    const img = fixture.debugElement.query(By.css('img')).nativeElement as HTMLImageElement;
    expect(img.alt).toBe('Campus');
  });

  it('renders an empty accessible name for a decorative image regardless of alt input', () => {
    fixture.componentRef.setInput('decorative', true);
    fixture.detectChanges();
    const img = fixture.debugElement.query(By.css('img')).nativeElement as HTMLImageElement;
    expect(img.alt).toBe('');
  });

  it('marks the host loaded once the image fires its load event', () => {
    fixture.detectChanges();
    const img = fixture.debugElement.query(By.css('img')).nativeElement as HTMLImageElement;

    img.dispatchEvent(new Event('load'));
    fixture.detectChanges();

    expect(fixture.nativeElement.classList).toContain('pweb-responsive-image--loaded');
  });

  it('marks the host errored (and hides the broken-image icon via CSS) on a load failure', () => {
    fixture.detectChanges();
    const img = fixture.debugElement.query(By.css('img')).nativeElement as HTMLImageElement;

    img.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(fixture.nativeElement.classList).toContain('pweb-responsive-image--errored');
  });

  it('builds a srcset string from provided sources, and omits it entirely when none given', () => {
    fixture.detectChanges();
    let img = fixture.debugElement.query(By.css('img')).nativeElement as HTMLImageElement;
    expect(img.getAttribute('srcset')).toBeNull();

    fixture.componentRef.setInput('sources', [
      { url: 'small.jpg', width: 400 },
      { url: 'large.jpg', width: 1200 },
    ]);
    fixture.detectChanges();
    img = fixture.debugElement.query(By.css('img')).nativeElement as HTMLImageElement;
    expect(img.getAttribute('srcset')).toBe('small.jpg 400w, large.jpg 1200w');
  });

  it('never lazy-loads a priority (hero/LCP) image', () => {
    fixture.componentRef.setInput('priority', true);
    fixture.detectChanges();
    const img = fixture.debugElement.query(By.css('img')).nativeElement as HTMLImageElement;
    expect(img.getAttribute('loading')).toBeNull();
    expect(img.getAttribute('fetchpriority')).toBe('high');
  });
});
