import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

/**
 * PWEB-21: static-ish campus information (facilities, maps, downloads) on the fully-prerendered
 * tier -- requirement-spec.md §3.5/§2 explicitly names this a candidate for `RenderMode.Prerender`
 * (see `app.routes.server.ts`), since it has no dynamic backend dependency and no publish-window/
 * locale-cookie concerns (unlike every other route in this app, which needs a live per-request
 * `RESPONSE_INIT`/`REQUEST`, per `app.routes.server.ts`'s own doc comment).
 *
 * Content here is genuinely static editorial copy this app owns directly -- not sourced from any
 * `ums-core` module (Organization's own `Building`/`Room` endpoints exist but are permission-gated
 * facilities-management data, not a public "here's how to find us" page; using them would also
 * require yet another gated-endpoint workaround, so this page deliberately doesn't attempt it).
 */
@Component({
  selector: 'pweb-campus-information',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe],
  host: { class: 'pweb-campus-information' },
  templateUrl: './campus-information.component.html',
  styleUrl: './campus-information.component.scss',
})
export class CampusInformationComponent {
  protected readonly facilities = [
    { titleKey: 'campus.facilities.library.title', bodyKey: 'campus.facilities.library.body' },
    { titleKey: 'campus.facilities.labs.title', bodyKey: 'campus.facilities.labs.body' },
    {
      titleKey: 'campus.facilities.residences.title',
      bodyKey: 'campus.facilities.residences.body',
    },
    { titleKey: 'campus.facilities.sports.title', bodyKey: 'campus.facilities.sports.body' },
  ] as const;
}
