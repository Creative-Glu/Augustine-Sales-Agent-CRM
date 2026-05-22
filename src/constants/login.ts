export const APP_VERSION = 'v0.1.0';

export const SLIDE_INTERVAL_MS = 5000;

export interface HeroSlide {
  headline: string;
  accent: string;
  subline: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    headline: 'Run your Catholic outreach with',
    accent: 'intelligence at scale.',
    subline:
      'Personalised outreach to parishes, dioceses, and ministries — powered by your campaigns, ICPs, and an AI agent that actually understands the mission.',
  },
  {
    headline: 'Turn cold parish leads into',
    accent: 'warm conversations.',
    subline:
      'Every reply is classified, every click is tracked — so your team focuses only on the leads ready to move.',
  },
  {
    headline: 'Reach every diocese with the',
    accent: 'right message at the right time.',
    subline:
      'Run campaigns tailored to ICPs across thousands of Catholic institutions — from one dashboard, no spreadsheets, no copy-paste.',
  },
  {
    headline: 'Where ministry vision meets',
    accent: 'measurable impact.',
    subline:
      'Built for evangelization-driven teams who need ROI visibility without compromising the Catholic mission.',
  },
  {
    headline: 'From cold lead to scheduled call in',
    accent: 'under 48 hours.',
    subline:
      'Real-time Slack alerts, automatic funnel transitions, and AI-drafted replies that sound like your best rep on their best day.',
  },
];
