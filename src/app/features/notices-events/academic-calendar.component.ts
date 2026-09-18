import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UmsEmptyStateComponent } from '@ums/design-system';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

/**
 * PWEB-19: Academic Calendar -- a printable/exportable view of the current `AcademicSession`'s
 * key dates.
 *
 * **CONFIRMED GAP, not a guess** (PWEB-19 research, read directly against `ums-core`'s `Academic`
 * module source): there is NO anonymous-accessible endpoint anywhere in the `Academic` module.
 * `AcademicSessionEndpoints.cs` maps exactly two routes -- `POST /academic-sessions` (permission-
 * gated create) and `GET /academic-sessions/{id}` -- and even the get-by-id route requires
 * `.RequireLiveSession()` (authenticated), NOT `.AllowAnonymous()`. There is also no `GET
 * /academic-sessions` list route at all, so even an authenticated caller has no way to discover
 * "the current session's id" without already knowing it. `grep`-confirmed: zero
 * `.AllowAnonymous()` call sites exist anywhere under the Academic module.
 *
 * This is a full backend gap, not a partial one -- there is no plausible interim contract to build
 * against (unlike PWEB-25's Notifications gap, where a real in-process pattern at least exists to
 * model an interim shape on). Per this batch's brief, this renders the honest "not yet available"
 * shell rather than fabricating session dates. Flagged prominently in this app's PR as a blocking
 * cross-team backend gap (Academic needs a public session/semester read endpoint before this
 * ticket can be genuinely built).
 */
@Component({
  selector: 'pweb-academic-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UmsEmptyStateComponent, TranslatePipe],
  host: { class: 'pweb-academic-calendar' },
  template: `
    <ums-empty-state
      illustration="illustration-empty-state"
      [title]="'calendar.unavailableTitle' | translate"
      [description]="'calendar.unavailableDescription' | translate"
    />
  `,
  styleUrl: './academic-calendar.component.scss',
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- purely declarative empty-state shell, no logic to hold (see class doc).
export class AcademicCalendarComponent {}
