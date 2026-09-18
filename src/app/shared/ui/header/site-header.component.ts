import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '@ums/design-system';
import { HeaderSessionService } from '../../../core/auth/header-session.service';
import { LocaleService } from '../../../core/i18n/locale.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import type { PwebLocale } from '../../../core/i18n/locale.types';
import { SearchOverlayComponent } from '../../../features/search-contact/search-overlay.component';

/**
 * PWEB-2/PWEB-3/PWEB-6 tied together into one app-shell fixture: brand + nav (design-system
 * tokens/typography), a locale switch (PWEB-3, writes the SSR-readable cookie), a theme toggle
 * (PWEB-2, light-primary/dark-variant), and read-only SSO awareness (PWEB-6, Domain Invariant #1
 * -- shows only "Signed in as {role}", never fetches or renders any authenticated domain data,
 * and shows nothing at all for an anonymous visitor rather than a fabricated "Sign in" surface
 * this app doesn't own, requirement-spec.md §1).
 */
@Component({
  selector: 'pweb-site-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, SearchOverlayComponent, TranslatePipe],
  host: { class: 'pweb-site-header' },
  templateUrl: './site-header.component.html',
  styleUrl: './site-header.component.scss',
})
export class SiteHeaderComponent {
  protected readonly locale = inject(LocaleService);
  protected readonly theme = inject(ThemeService);
  protected readonly session = inject(HeaderSessionService);

  /** PWEB-24: "prominent in the header, expanding to a full-width overlay on activation" (requirement-spec.md §7). */
  protected readonly searchOpen = signal(false);

  protected toggleLocale(): void {
    const next: PwebLocale = this.locale.locale() === 'en' ? 'bn' : 'en';
    this.locale.setLocale(next);
  }

  protected toggleTheme(): void {
    this.theme.setMode(this.theme.resolvedTheme() === 'light' ? 'dark' : 'light');
  }

  protected openSearch(): void {
    this.searchOpen.set(true);
  }

  protected closeSearch(): void {
    this.searchOpen.set(false);
  }
}
