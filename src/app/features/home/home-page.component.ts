import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ApplyNowCtaComponent } from '../../shared/ui/cta/apply-now-cta.component';
import { HeroBannerComponent } from './hero-banner.component';
import { NoticeEventFeedComponent } from './notice-event-feed.component';

/** PWEB-9/10/11: the homepage, composed of the hero, the Apply Now CTA fragment, and the notice/event feed. */
@Component({
  selector: 'pweb-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeroBannerComponent, ApplyNowCtaComponent, NoticeEventFeedComponent],
  host: { class: 'pweb-home-page' },
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- pure composition/layout, no state of its own
export class HomePageComponent {}
