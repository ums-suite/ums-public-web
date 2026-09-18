import { TestBed } from '@angular/core/testing';
import { PwebErrorHandler } from './pweb-error-handler';

describe('PwebErrorHandler', () => {
  it('logs an Error instance message alongside a correlation id and the current path', () => {
    spyOn(console, 'error');
    const handler = TestBed.inject(PwebErrorHandler);

    handler.handleError(new Error('boom'));

    expect(console.error).toHaveBeenCalledWith(
      '[route-error]',
      jasmine.objectContaining({
        message: 'boom',
        path: jasmine.any(String),
        correlationId: jasmine.any(String),
      }),
    );
  });

  it('stringifies a non-Error thrown value rather than throwing itself', () => {
    spyOn(console, 'error');
    const handler = TestBed.inject(PwebErrorHandler);

    expect(() => handler.handleError('a plain string error')).not.toThrow();
    expect(console.error).toHaveBeenCalledWith(
      '[route-error]',
      jasmine.objectContaining({ message: 'a plain string error' }),
    );
  });
});
