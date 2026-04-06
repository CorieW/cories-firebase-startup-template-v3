/**
 * Support options grid component.
 */
import { BookOpen, HelpCircle, Mail, MessageCircle } from 'lucide-react';
import { panelClass, panelMutedClass } from '../../lib/ui';
import { useToast } from '../toast/ToastProvider';
import { SUPPORT_OPTIONS } from './support-content';

const optionIconMap = {
  documentation: BookOpen,
  'live-chat': MessageCircle,
  'email-support': Mail,
  faq: HelpCircle,
} as const;

/**
 * Quick support channels shown as card links.
 */
interface SupportOptionsGridProps {
  onLiveChatClick: () => void;
}

export default function SupportOptionsGrid({
  onLiveChatClick,
}: SupportOptionsGridProps) {
  const { toast } = useToast();

  function handleSupportLinkClick(option: (typeof SUPPORT_OPTIONS)[number]) {
    const descriptions = {
      documentation: 'Opening the documentation in a new tab.',
      'email-support': 'Opening your email app with the support address.',
      faq: 'Jumping to the FAQ section on this page.',
      'live-chat': 'Opening live chat support.',
    } as const;

    toast.info({
      title: option.title,
      description: descriptions[option.id],
    });
  }

  return (
    <section className='grid grid-cols-1 gap-3 min-[760px]:grid-cols-2'>
      {SUPPORT_OPTIONS.map(option => {
        const Icon = optionIconMap[option.id];
        const cardClass = `${panelClass} ${panelMutedClass} group block p-4 text-left no-underline transition hover:border-[var(--line-strong)] hover:bg-[var(--surface)]`;

        if (option.id === 'live-chat') {
          return (
            <button
              key={option.title}
              type='button'
              onClick={() => {
                handleSupportLinkClick(option);
                onLiveChatClick();
              }}
              className={cardClass}
            >
              <Icon
                aria-hidden='true'
                className='mb-2 h-8 w-8 text-[var(--ink)]'
              />
              <h2 className='m-0 text-base font-bold text-[var(--ink)]'>
                {option.title}
              </h2>
              <p className='mb-0 mt-2 text-sm leading-6 text-[var(--ink-soft)]'>
                {option.description}
              </p>
              <p className='mb-0 mt-3 text-sm font-semibold text-[var(--ink)]'>
                {option.cta}
              </p>
            </button>
          );
        }

        const isExternal = option.href.startsWith('http');

        return (
          <a
            key={option.title}
            href={option.href}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noreferrer' : undefined}
            className={cardClass}
            onClick={() => {
              handleSupportLinkClick(option);
            }}
          >
            <Icon
              aria-hidden='true'
              className='mb-2 h-8 w-8 text-[var(--ink)]'
            />
            <h2 className='m-0 text-base font-bold text-[var(--ink)]'>
              {option.title}
            </h2>
            <p className='mb-0 mt-2 text-sm leading-6 text-[var(--ink-soft)]'>
              {option.description}
            </p>
            <p className='mb-0 mt-3 text-sm font-semibold text-[var(--ink)]'>
              {option.cta}
            </p>
          </a>
        );
      })}
    </section>
  );
}
