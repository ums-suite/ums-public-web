import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService, UmsToastContainerComponent } from '@ums/design-system';
import { SiteFooterComponent } from './shared/ui/footer/site-footer.component';
import { SiteHeaderComponent } from './shared/ui/header/site-header.component';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, UmsToastContainerComponent, SiteHeaderComponent, SiteFooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly theme = inject(ThemeService);

  constructor() {
    // requirement-spec.md §7 "Theming": light is this app's primary, brand-defining experience;
    // dark is an opt-in variant, never the default -- even when the visitor's OS prefers dark.
    // `ThemeService.mode` only stays at its own 'system' default when nothing has EVER been
    // explicitly persisted under its own storage key (this app's own theme toggle only ever
    // offers Light/Dark, never "System" -- see SiteHeaderComponent), so 'system' can only mean
    // "first-ever visit, no stored preference" -- safe to coerce to 'light' without ever
    // overriding a returning visitor's own explicit choice.
    if (this.theme.mode() === 'system') {
      this.theme.setMode('light');
    }
  }
}
