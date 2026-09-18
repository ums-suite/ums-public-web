/** Mirrors `@ums/shared`'s own `UmsLocale` union so this app's dictionaries stay in lockstep. */
export type PwebLocale = 'en' | 'bn';

export const PWEB_DEFAULT_LOCALE: PwebLocale = 'en';
export const PWEB_SUPPORTED_LOCALES: readonly PwebLocale[] = ['en', 'bn'];

export function isPwebLocale(value: string | null | undefined): value is PwebLocale {
  return value === 'en' || value === 'bn';
}
