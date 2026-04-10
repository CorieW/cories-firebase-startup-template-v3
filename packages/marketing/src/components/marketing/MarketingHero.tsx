/**
 * Hero section for the static marketing page.
 */
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { logMarketingEvent } from '../../lib/marketing-logging';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

const heroSlides = [
  {
    id: 'launch-week',
    badge: 'Launch-ready marketing system',
    eyebrow: 'Built for launch weeks, demo links, and early customer calls',
    title: 'Launch the site your dashboard deserves.',
    description:
      "A polished landing page that shares the dashboard's warm editorial tone, pairs cleanly with Firebase auth and billing, and gives founders something presentable on day one.",
    primaryAction: {
      href: '#pricing',
      label: 'Explore the package',
    },
    secondaryAction: {
      href: '#story',
      label: 'See how it fits',
    },
    metrics: [
      { value: '3x', label: 'faster first launch' },
      { value: '1', label: 'visual system across app + site' },
      { value: '0', label: 'extra backend needed for the landing page' },
    ],
    navigationLabel: 'Launch-ready presence',
    navigationDescription:
      'Set the tone with a first screen that already feels product-grade.',
    background: {
      canvas:
        'linear-gradient(140deg, rgba(14, 18, 26, 0.92), rgba(38, 28, 24, 0.86) 42%, rgba(128, 82, 38, 0.72) 100%)',
      glow: 'radial-gradient(circle at 16% 22%, rgba(255, 206, 124, 0.28), transparent 24rem), radial-gradient(circle at 78% 26%, rgba(242, 129, 73, 0.22), transparent 18rem), radial-gradient(circle at 56% 88%, rgba(255, 255, 255, 0.16), transparent 22rem)',
      panel:
        'linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.04))',
      accent: 'rgba(255, 205, 120, 0.34)',
    },
  },
  {
    id: 'demo-story',
    badge: 'Show the product before sign-in',
    eyebrow:
      'Frame auth, billing, and dashboard maturity before the demo starts',
    title: 'Make your first screen do the demo work.',
    description:
      'Rotate through launch story, product depth, and handoff points without dropping visitors into a wall of feature cards. The hero itself becomes the guided opening pitch.',
    primaryAction: {
      href: '#features',
      label: 'Browse the features',
    },
    secondaryAction: {
      href: '#story',
      label: 'Read the narrative',
    },
    metrics: [
      { value: 'Auth', label: 'entry points already mapped' },
      { value: 'Billing', label: 'handoff flows already designed' },
      { value: 'Theme', label: 'shared across marketing + app' },
    ],
    navigationLabel: 'Demo-ready storytelling',
    navigationDescription:
      'Use the hero like a concise pitch deck that still feels alive.',
    background: {
      canvas:
        'linear-gradient(140deg, rgba(13, 27, 33, 0.94), rgba(12, 57, 66, 0.82) 44%, rgba(109, 169, 156, 0.7) 100%)',
      glow: 'radial-gradient(circle at 20% 24%, rgba(154, 238, 220, 0.26), transparent 22rem), radial-gradient(circle at 82% 16%, rgba(255, 255, 255, 0.16), transparent 16rem), radial-gradient(circle at 68% 74%, rgba(81, 202, 179, 0.2), transparent 18rem)',
      panel:
        'linear-gradient(180deg, rgba(210, 255, 247, 0.16), rgba(255, 255, 255, 0.04))',
      accent: 'rgba(122, 229, 207, 0.32)',
    },
  },
  {
    id: 'conversion-handoff',
    badge: 'Conversion-focused handoff',
    eyebrow:
      'Built to move visitors from credibility into action without losing momentum',
    title: 'Move from narrative to conversion in one sweep.',
    description:
      'A full-window hero gives the landing page more confidence, then hands people directly into pricing, dashboard auth, and the sections that answer their next question.',
    primaryAction: {
      href: '#pricing',
      label: 'Jump to pricing',
    },
    secondaryAction: {
      href: '#features',
      label: 'See launch sections',
    },
    metrics: [
      { value: '2', label: 'handoff routes into billing' },
      { value: '1', label: 'shared CTA language across the page' },
      { value: '100%', label: 'responsive from mobile to desktop' },
    ],
    navigationLabel: 'Conversion-focused handoff',
    navigationDescription:
      'Keep the energy high right up to the pricing and sign-up path.',
    background: {
      canvas:
        'linear-gradient(145deg, rgba(31, 19, 45, 0.95), rgba(71, 28, 44, 0.82) 48%, rgba(188, 94, 82, 0.68) 100%)',
      glow: 'radial-gradient(circle at 22% 20%, rgba(255, 179, 198, 0.24), transparent 20rem), radial-gradient(circle at 84% 22%, rgba(255, 220, 155, 0.2), transparent 18rem), radial-gradient(circle at 62% 80%, rgba(245, 120, 108, 0.18), transparent 18rem)',
      panel:
        'linear-gradient(180deg, rgba(255, 210, 201, 0.16), rgba(255, 255, 255, 0.04))',
      accent: 'rgba(249, 155, 128, 0.3)',
    },
  },
] as const;

/**
 * Wraps slide indexes so previous and next controls stay cyclic.
 */
function getWrappedSlideIndex(index: number): number {
  return (index + heroSlides.length) % heroSlides.length;
}

/**
 * Introduces the product and its launch-ready positioning.
 */
export default function MarketingHero() {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlideIndex(currentIndex =>
        getWrappedSlideIndex(currentIndex + 1)
      );
    }, 6500);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [activeSlideIndex]);

  const activeSlide = heroSlides[activeSlideIndex];

  const handleSlideChange = (index: number, interaction: string) => {
    const nextSlideIndex = getWrappedSlideIndex(index);
    const nextSlide = heroSlides[nextSlideIndex];

    setActiveSlideIndex(nextSlideIndex);
    logMarketingEvent('heroSlideChange', {
      interaction,
      slide: nextSlide.id,
      slideIndex: nextSlideIndex + 1,
    });
  };

  return (
    <section className='marketing-hero'>
      <div className='pointer-events-none absolute inset-0'>
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            aria-hidden='true'
            className={`marketing-hero-slide ${index === activeSlideIndex ? 'is-active' : ''}`}
          >
            <div
              className='absolute inset-0'
              style={{ background: slide.background.canvas }}
            />
            <div
              className='absolute inset-0 opacity-90'
              style={{ backgroundImage: slide.background.glow }}
            />
            <div
              className='absolute top-[16%] -right-28 h-[20rem] w-[20rem] rounded-full blur-3xl sm:h-[24rem] sm:w-[24rem] lg:top-[12%] lg:right-[8%] lg:h-[28rem] lg:w-[28rem]'
              style={{
                background: `radial-gradient(circle, ${slide.background.accent}, transparent 68%)`,
              }}
            />
            <div
              className='absolute right-[-10%] bottom-[-8%] h-[18rem] w-[18rem] rounded-full blur-3xl lg:right-[16%] lg:bottom-[2%] lg:h-[24rem] lg:w-[24rem]'
              style={{
                background:
                  'radial-gradient(circle, rgba(255, 255, 255, 0.12), transparent 70%)',
              }}
            />
            <div
              className='absolute right-[8%] bottom-[12%] hidden h-[16rem] w-[20rem] rounded-[2.5rem] border border-white/12 shadow-[0_28px_70px_rgba(0,0,0,0.28)] lg:block'
              style={{ background: slide.background.panel }}
            />
          </div>
        ))}
        <div className='absolute inset-0 bg-[linear-gradient(180deg,rgba(8,12,18,0.06),rgba(8,12,18,0.4)_55%,rgba(8,12,18,0.68)_100%)]' />
        <div className='absolute inset-0 bg-[linear-gradient(90deg,rgba(8,12,18,0.62),rgba(8,12,18,0.26)_42%,rgba(8,12,18,0.7)_100%)]' />
      </div>

      <div className='marketing-container marketing-hero-stage'>
        <div className='relative z-10 grid gap-6 lg:grid-cols-[minmax(0,1.18fr)_minmax(320px,0.82fr)] lg:items-center lg:gap-8'>
          <div className='space-y-6 rounded-[2rem] border border-white/14 bg-[color-mix(in_srgb,rgba(14,16,24,0.76)_70%,transparent)] px-6 py-6 shadow-[0_28px_90px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:px-8 sm:py-7 lg:rounded-[2.5rem] lg:px-8 lg:py-8'>
            <div className='space-y-4'>
              <Badge className='w-fit border-white/12 bg-white/10 text-white shadow-none'>
                {activeSlide.badge}
              </Badge>
              <div className='space-y-4 text-white'>
                <p className='m-0 text-xs font-semibold tracking-[0.18em] text-white/72 uppercase'>
                  {activeSlide.eyebrow}
                </p>
                <h1 className='m-0 max-w-[12ch] text-[clamp(3.1rem,8vw,6.1rem)] leading-[0.88] font-extrabold tracking-[-0.08em] text-white'>
                  {activeSlide.title}
                </h1>
                <p className='max-w-[39rem] text-base leading-7 text-white/78 sm:text-[1.02rem] sm:leading-7 xl:text-lg'>
                  {activeSlide.description}
                </p>
              </div>
            </div>

            <div className='flex flex-col gap-3 sm:flex-row'>
              <Button
                asChild
                size='lg'
                className='bg-white text-slate-950 hover:bg-white/92'
              >
                <a
                  href={activeSlide.primaryAction.href}
                  onClick={() =>
                    logMarketingEvent('ctaClick', {
                      placement: `hero-${activeSlide.id}-primary`,
                      destination: activeSlide.primaryAction.href,
                      slide: activeSlide.id,
                    })
                  }
                >
                  {activeSlide.primaryAction.label}
                  <ArrowRight className='h-4 w-4' aria-hidden='true' />
                </a>
              </Button>
              <Button
                asChild
                variant='secondary'
                size='lg'
                className='border-white/14 bg-white/10 text-white hover:bg-white/16'
              >
                <a
                  href={activeSlide.secondaryAction.href}
                  onClick={() =>
                    logMarketingEvent('ctaClick', {
                      placement: `hero-${activeSlide.id}-secondary`,
                      destination: activeSlide.secondaryAction.href,
                      slide: activeSlide.id,
                    })
                  }
                >
                  {activeSlide.secondaryAction.label}
                </a>
              </Button>
            </div>

            <div className='grid gap-2.5 sm:grid-cols-3'>
              {activeSlide.metrics.map(metric => (
                <div
                  key={metric.label}
                  className='rounded-[1.5rem] border border-white/12 bg-white/10 px-4 py-3 shadow-[0_20px_48px_rgba(0,0,0,0.22)] backdrop-blur-sm sm:px-4.5 sm:py-3.5'
                >
                  <p className='m-0 text-3xl font-extrabold tracking-[-0.06em] text-white'>
                    {metric.value}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-white/74'>
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className='relative z-10 space-y-4 rounded-[2rem] border border-white/12 bg-[color-mix(in_srgb,rgba(8,12,18,0.72)_76%,transparent)] p-4 text-white shadow-[0_22px_80px_rgba(0,0,0,0.26)] backdrop-blur-xl lg:rounded-[2.25rem] lg:p-5'>
            <div className='flex items-center justify-between gap-4'>
              <div>
                <p className='m-0 text-xs font-semibold tracking-[0.18em] text-white/56 uppercase'>
                  Slideshow scenes
                </p>
                <p className='mt-2 text-sm leading-5.5 text-white/72'>
                  Auto-rotates through the landing page story, with manual
                  controls when you want to steer the first impression.
                </p>
              </div>
              <div className='flex items-center gap-2'>
                <button
                  type='button'
                  className='inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/14 bg-white/8 text-white transition hover:bg-white/14'
                  onClick={() =>
                    handleSlideChange(activeSlideIndex - 1, 'previous')
                  }
                  aria-label='Show previous hero slide'
                >
                  <ArrowLeft className='h-4 w-4' aria-hidden='true' />
                </button>
                <button
                  type='button'
                  className='inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/14 bg-white/8 text-white transition hover:bg-white/14'
                  onClick={() =>
                    handleSlideChange(activeSlideIndex + 1, 'next')
                  }
                  aria-label='Show next hero slide'
                >
                  <ArrowRight className='h-4 w-4' aria-hidden='true' />
                </button>
              </div>
            </div>

            <div className='space-y-2.5'>
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  type='button'
                  className={`flex w-full items-start gap-4 rounded-[1.4rem] border px-4 py-3 text-left transition ${
                    index === activeSlideIndex
                      ? 'border-white/22 bg-white/14 shadow-[0_20px_48px_rgba(0,0,0,0.22)]'
                      : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08]'
                  }`}
                  onClick={() => handleSlideChange(index, 'pager')}
                  aria-pressed={index === activeSlideIndex}
                >
                  <span className='inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/14 bg-white/8 text-sm font-semibold text-white/82'>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className='space-y-1'>
                    <span className='block text-sm font-semibold text-white'>
                      {slide.navigationLabel}
                    </span>
                    <span className='block text-sm leading-5.5 text-white/68'>
                      {slide.navigationDescription}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
