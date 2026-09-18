import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

export interface ResponsiveImageSource {
  readonly url: string;
  /** Real pixel width of this source, for `srcset`'s `Nw` descriptor. */
  readonly width: number;
}

/**
 * PWEB-7: reusable responsive image delivery -- `<picture>`/`srcset` with an aspect-ratio-
 * preserving placeholder, so a slow-loading hero/card image never causes layout shift or a blank
 * flash (Domain Invariant #5). PWEB-9/12/13/16/20 all render imagery through this one component.
 *
 * `ums-core` today returns a single `imageUrl` per `Banner`/`Program`-adjacent entity (no width
 * variants confirmed, PWEB-4 research) -- `sources` is optional specifically so this component
 * already supports true `srcset` the moment a real image-resizing CDN convention exists, while
 * `src` alone (today's reality) still gets full layout-shift protection and lazy-loading.
 */
@Component({
  selector: 'pweb-responsive-image',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'pweb-responsive-image',
    '[style.aspect-ratio]': 'aspectRatio()',
    '[class.pweb-responsive-image--loaded]': 'loaded()',
    '[class.pweb-responsive-image--errored]': 'errored()',
  },
  templateUrl: './responsive-image.component.html',
  styleUrl: './responsive-image.component.scss',
})
export class ResponsiveImageComponent {
  readonly src = input.required<string>();
  readonly alt = input<string>('');
  /** Decorative imagery (e.g. an ambient hero backdrop) gets an empty accessible name instead of `alt`. */
  readonly decorative = input(false);
  /** CSS `aspect-ratio` value, e.g. `'16/9'` or `'1/1'` -- reserves layout space before the image loads. */
  readonly aspectRatio = input<string>('16/9');
  readonly sources = input<readonly ResponsiveImageSource[]>([]);
  readonly sizes = input<string>('100vw');
  /** The hero's own LCP image should never be lazy-loaded; every other usage defaults to lazy. */
  readonly priority = input(false);

  protected readonly loaded = signal(false);
  protected readonly errored = signal(false);

  protected get srcset(): string | null {
    const sources = this.sources();
    return sources.length ? sources.map((s) => `${s.url} ${s.width}w`).join(', ') : null;
  }

  protected onLoad(): void {
    this.loaded.set(true);
  }

  protected onError(): void {
    this.errored.set(true);
  }
}
