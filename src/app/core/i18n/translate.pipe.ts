import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from './translate.service';

/**
 * `{{ 'home.viewAll' | translate }}` / `{{ 'cta.admissionOpensOn' | translate: { date } }}`.
 *
 * Deliberately impure (`pure: false`): the translated output must re-render when
 * {@link LocaleService}'s `locale` signal changes, and a signal read inside a pure pipe's
 * `transform` is not itself a Angular-tracked binding the way a template signal call is -- impure
 * marks this pipe dirty-checked every change-detection run, an acceptable cost for a handful of
 * short UI strings on read-mostly pages.
 */
@Pipe({ name: 'translate', pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly translateService = inject(TranslateService);

  transform(key: string, params?: Readonly<Record<string, string | number>>): string {
    return this.translateService.translate(key, params);
  }
}
