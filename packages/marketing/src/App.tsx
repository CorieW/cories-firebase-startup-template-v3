/**
 * Marketing site application shell.
 */
import { useEffect } from 'react';
import MarketingFeatureGrid from './components/marketing/MarketingFeatureGrid';
import MarketingFooter from './components/marketing/MarketingFooter';
import MarketingHeader from './components/marketing/MarketingHeader';
import MarketingHero from './components/marketing/MarketingHero';
import MarketingPricing from './components/marketing/MarketingPricing';
import MarketingSocialProof from './components/marketing/MarketingSocialProof';
import MarketingStoryGrid from './components/marketing/MarketingStoryGrid';
import MarketingTestimonials from './components/marketing/MarketingTestimonials';
import { logMarketingEvent } from './lib/marketing-logging';

/**
 * Renders the static marketing experience for the starter template.
 */
export default function App() {
  useEffect(() => {
    logMarketingEvent('pageView', {
      page: 'marketing-home',
    });
  }, []);

  return (
    <div id='top' className='marketing-shell min-h-screen text-[var(--ink)]'>
      <MarketingHeader />
      <main className='marketing-main'>
        <MarketingHero />
        <MarketingSocialProof />
        <MarketingFeatureGrid />
        <MarketingStoryGrid />
        <MarketingTestimonials />
        <MarketingPricing />
      </main>
      <MarketingFooter />
    </div>
  );
}
