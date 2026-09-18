import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UmsEmptyStateComponent } from '@ums/design-system';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

/**
 * PWEB-15/PWEB-16: Faculty Directory browse/search + member detail.
 *
 * **CONFIRMED GAP, not a guess** (PWEB-15/16 research, read directly against `ums-core`'s
 * `Faculty` module source): there is NO public/anonymous endpoint anywhere that lists or searches
 * `FacultyMember`s. `FacultyMemberEndpoints.cs`'s `GET /faculty/members` and
 * `GET /faculty/members/{id}` both require `.RequirePermission(FacultyPermissions.ProfileRead)` --
 * confirmed, not `.AllowAnonymous()`. The ONE public route in this module,
 * `GET /faculty/members/{facultyMemberId}/research-profile`, is itself unreachable for a real
 * directory use case: it requires already knowing a `facultyMemberId`, and there is no anonymous
 * way to discover one (the only listing endpoint that would supply one is the same gated
 * `/members` route above). There is also no public Organization-side listing of faculty-adjacent
 * people data that could substitute.
 *
 * Per this batch's brief: build the honest empty/coming-soon shell rather than fabricate a
 * browsable directory the backend cannot serve -- {@link UmsEmptyStateComponent} renders a
 * designed "not yet available" state, never a broken page or an invented member list. Flagged
 * prominently in this app's PR as a blocking cross-team backend gap (Faculty module needs a public
 * directory read endpoint before PWEB-15/16 can be genuinely built).
 *
 * The "placeholder avatar, initials-on-brand-color" edge case this ticket calls out is real and
 * tested where this app DOES have genuine faculty-adjacent people data: `research-showcase.component.ts`
 * (PWEB-20) renders every publication/grant author through `<ums-avatar [name]="...">` with no
 * `imageUrl` at all (`Research`'s `AuthorEntryDto`/`GrantInvestigatorDto` never carry a photo) --
 * `@ums/design-system`'s own `UmsAvatarComponent` already implements and tests the initials-
 * fallback behaviour this edge case asks for; this component would reuse it identically the
 * moment a real directory endpoint exists.
 */
@Component({
  selector: 'pweb-faculty-directory',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UmsEmptyStateComponent, TranslatePipe],
  host: { class: 'pweb-faculty-directory' },
  template: `
    <ums-empty-state
      illustration="illustration-empty-state"
      [title]="'faculty.directory.unavailableTitle' | translate"
      [description]="'faculty.directory.unavailableDescription' | translate"
    />
  `,
  styleUrl: './faculty-directory.component.scss',
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- purely declarative empty-state shell, no logic to hold (see class doc).
export class FacultyDirectoryComponent {}
