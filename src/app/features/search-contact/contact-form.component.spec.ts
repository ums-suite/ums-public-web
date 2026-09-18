import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import { NotificationsApiService } from '../../core/http/notifications-api.service';
import type { SubmitInquiryOutcome } from '../../core/http/notifications-api.models';
import { ContactFormComponent } from './contact-form.component';

describe('ContactFormComponent', () => {
  let fixture: ComponentFixture<ContactFormComponent>;
  let notificationsApiSpy: jasmine.SpyObj<NotificationsApiService>;

  function setUp(): void {
    TestBed.configureTestingModule({
      imports: [ContactFormComponent],
      providers: [{ provide: NotificationsApiService, useValue: notificationsApiSpy }],
    });
    fixture = TestBed.createComponent(ContactFormComponent);
    fixture.detectChanges();
  }

  function fillValidForm(): void {
    const instance = fixture.componentInstance;
    instance['name'].set('Ada Rahman');
    instance['email'].set('ada@example.edu');
    instance['subject'].set('Admission question');
    instance['message'].set('I would like to know more about the program.');
  }

  beforeEach(() => {
    sessionStorage.clear();
    notificationsApiSpy = jasmine.createSpyObj<NotificationsApiService>('NotificationsApiService', [
      'submitInquiry',
    ]);
  });

  afterEach(() => sessionStorage.clear());

  it('shows validation errors and never calls the API for an empty submission', () => {
    setUp();
    fixture.componentInstance['onSubmit']();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Please enter your name');
    expect(notificationsApiSpy.submitInquiry).not.toHaveBeenCalled();
  });

  it('submits with a client-generated idempotency key and shows the accepted confirmation', () => {
    notificationsApiSpy.submitInquiry.and.returnValue(of({ kind: 'accepted' }));
    setUp();
    fillValidForm();

    fixture.componentInstance['onSubmit']();
    fixture.detectChanges();

    expect(notificationsApiSpy.submitInquiry).toHaveBeenCalledWith(
      jasmine.objectContaining({ name: 'Ada Rahman', email: 'ada@example.edu' }),
      jasmine.any(String),
    );
    expect(fixture.nativeElement.textContent).toContain('Thank you');
  });

  it('disable-on-click: a second click while a request is in flight does not submit twice', () => {
    const inFlight = new Subject<SubmitInquiryOutcome>();
    notificationsApiSpy.submitInquiry.and.returnValue(inFlight);
    setUp();
    fillValidForm();

    fixture.componentInstance['onSubmit']();
    fixture.componentInstance['onSubmit'](); // second click before the first resolves
    fixture.detectChanges();

    expect(notificationsApiSpy.submitInquiry).toHaveBeenCalledTimes(1);
    inFlight.next({ kind: 'accepted' });
  });

  it('reuses the SAME idempotency key across a simulated page reload (sessionStorage-persisted pending attempt)', () => {
    // Simulates a reload after a request whose outcome the visitor never saw (a slow/timed-out
    // request that outlives the page) -- sessionStorage still holds the 'pending' record from
    // before the reload, since nothing ever called markAttemptTerminal on it.
    sessionStorage.setItem(
      'pweb-contact-attempt',
      JSON.stringify({ key: 'pre-reload-key', status: 'pending' }),
    );

    let usedKey: string | undefined;
    notificationsApiSpy.submitInquiry.and.callFake((_req, key: string) => {
      usedKey = key;
      return of({ kind: 'unavailable' } as SubmitInquiryOutcome);
    });

    setUp();
    fillValidForm();
    fixture.componentInstance['onSubmit']();

    expect(usedKey).toBe('pre-reload-key');
  });

  it('mints a fresh idempotency key for a new inquiry after a terminal outcome', () => {
    notificationsApiSpy.submitInquiry.and.returnValue(of({ kind: 'accepted' }));
    setUp();
    fillValidForm();
    fixture.componentInstance['onSubmit']();
    fixture.detectChanges();

    const afterAccept = JSON.parse(sessionStorage.getItem('pweb-contact-attempt') ?? 'null');
    expect(afterAccept.status).toBe('terminal');

    fixture.componentInstance['startNewInquiry']();

    const afterNew = JSON.parse(sessionStorage.getItem('pweb-contact-attempt') ?? 'null');
    expect(afterNew.status).toBe('pending');
    expect(afterNew.key).not.toBe(afterAccept.key);
  });

  it('renders the rate-limited outcome message', () => {
    notificationsApiSpy.submitInquiry.and.returnValue(
      of({ kind: 'rateLimited', retryAfterSeconds: 30 }),
    );
    setUp();
    fillValidForm();
    fixture.componentInstance['onSubmit']();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
  });

  it('renders the captcha-required outcome message', () => {
    notificationsApiSpy.submitInquiry.and.returnValue(of({ kind: 'captchaRequired' }));
    setUp();
    fillValidForm();
    fixture.componentInstance['onSubmit']();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
  });

  it('renders an honest "temporarily unavailable" message rather than a silent failure', () => {
    notificationsApiSpy.submitInquiry.and.returnValue(of({ kind: 'unavailable' }));
    setUp();
    fillValidForm();
    fixture.componentInstance['onSubmit']();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('temporarily unavailable');
  });
});
