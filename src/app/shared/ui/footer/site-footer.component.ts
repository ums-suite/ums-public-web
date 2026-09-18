import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Minimal editorial footer -- expanded as later PWEB tickets (Downloads/News, Contact) land. */
@Component({
  selector: 'pweb-site-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pweb-site-footer' },
  template: `<p>&copy; {{ year }} University Management Suite</p>`,
  styleUrl: './site-footer.component.scss',
})
export class SiteFooterComponent {
  protected readonly year = new Date().getFullYear();
}
