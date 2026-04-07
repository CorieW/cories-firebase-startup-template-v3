/**
 * Shared admin page primitives for headings, cards, and detail panels.
 */
import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import {
  badgeClass,
  cardClass,
  dangerCardClass,
  dangerMutedTextClass,
  dangerTextClass,
  primaryButtonClass,
  secondaryButtonClass,
  subtleCardClass,
} from '../lib/ui';
import { formatAdminJson, formatAdminNumber } from '../lib/formatting';
import { getPaginationSummary } from '../lib/pagination';

interface AdminPageHeaderProps {
  actionHref?: string;
  actionLabel?: string;
  description: string;
  title: string;
}

/**
 * Renders a consistent title block for admin routes.
 */
export function AdminPageHeader({
  actionHref,
  actionLabel,
  description,
  title,
}: AdminPageHeaderProps) {
  return (
    <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
      <div className='space-y-2'>
        <h1 className='m-0 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl'>
          {title}
        </h1>
        <p className='m-0 max-w-3xl text-sm leading-7 text-[var(--admin-ink-soft)] sm:text-base'>
          {description}
        </p>
      </div>

      {actionHref && actionLabel ? (
        <Link className={secondaryButtonClass} to={actionHref}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

interface AdminPanelProps {
  children: ReactNode;
  className?: string;
  description?: string;
  title?: string;
}

/**
 * Renders a titled card section for admin route content.
 */
export function AdminPanel({
  children,
  className = '',
  description,
  title,
}: AdminPanelProps) {
  return (
    <section className={`${cardClass} p-6 sm:p-7 ${className}`.trim()}>
      {title ? (
        <header className='mb-5 space-y-1'>
          <h2 className='m-0 text-xl font-semibold tracking-[-0.02em]'>
            {title}
          </h2>
          {description ? (
            <p className='m-0 text-sm leading-6 text-[var(--admin-ink-soft)]'>
              {description}
            </p>
          ) : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

interface AdminEmptyStateProps {
  actionHref?: string;
  actionLabel?: string;
  description: string;
  title: string;
  tone?: 'default' | 'danger';
}

/**
 * Renders a reusable empty state for sparse admin views.
 */
export function AdminEmptyState({
  actionHref,
  actionLabel,
  description,
  title,
  tone = 'default',
}: AdminEmptyStateProps) {
  const isDanger = tone === 'danger';

  return (
    <div
      className={`${isDanger ? dangerCardClass : subtleCardClass} flex flex-col gap-4 p-6 text-sm`}
    >
      <div className='space-y-2'>
        <h2
          className={`m-0 text-lg font-semibold tracking-[-0.02em] ${
            isDanger ? dangerTextClass : ''
          }`}
        >
          {title}
        </h2>
        <p
          className={`m-0 max-w-2xl leading-6 ${
            isDanger ? dangerMutedTextClass : 'text-[var(--admin-ink-soft)]'
          }`}
        >
          {description}
        </p>
      </div>
      {actionHref && actionLabel ? (
        <div>
          <Link className={primaryButtonClass} to={actionHref}>
            {actionLabel}
          </Link>
        </div>
      ) : null}
    </div>
  );
}

interface AdminPaginationProps {
  currentPage: number;
  hasNextPage: boolean;
  itemCount: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  totalCount?: number | null;
}

/**
 * Renders previous and next controls for paginated admin listings.
 */
export function AdminPagination({
  currentPage,
  hasNextPage,
  itemCount,
  onPageChange,
  pageSize,
  totalCount,
}: AdminPaginationProps) {
  const summary = getPaginationSummary({
    itemCount,
    page: currentPage,
    pageSize,
  });
  const summaryText = summary
    ? totalCount === null || totalCount === undefined
      ? `Showing ${formatAdminNumber(summary.startItem)}-${formatAdminNumber(summary.endItem)}`
      : `Showing ${formatAdminNumber(summary.startItem)}-${formatAdminNumber(summary.endItem)} of ${formatAdminNumber(totalCount)}`
    : currentPage === 1
      ? 'No results to display.'
      : `No results found on page ${formatAdminNumber(currentPage)}.`;

  return (
    <div
      className={`${subtleCardClass} flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between`}
    >
      <p className='m-0 text-sm text-[var(--admin-ink-soft)]'>{summaryText}</p>
      <div className='flex flex-wrap items-center gap-2'>
        <button
          className={secondaryButtonClass}
          disabled={currentPage === 1}
          onClick={() => {
            onPageChange(currentPage - 1);
          }}
          type='button'
        >
          Previous
        </button>
        <span className={badgeClass}>
          Page {formatAdminNumber(currentPage)}
        </span>
        <button
          className={secondaryButtonClass}
          disabled={!hasNextPage}
          onClick={() => {
            onPageChange(currentPage + 1);
          }}
          type='button'
        >
          Next
        </button>
      </div>
    </div>
  );
}

interface AdminKeyValueListProps {
  items: Array<{
    label: string;
    tone?: 'default' | 'danger';
    value: ReactNode;
  }>;
}

/**
 * Displays compact key-value metadata in a responsive grid.
 */
export function AdminKeyValueList({ items }: AdminKeyValueListProps) {
  return (
    <dl className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
      {items.map(item => {
        const isDanger = item.tone === 'danger';

        return (
          <div
            key={item.label}
            className={`${isDanger ? dangerCardClass : subtleCardClass} space-y-1 p-4 text-sm`}
          >
            <dt
              className={`text-[0.72rem] font-semibold uppercase tracking-[0.08em] ${
                isDanger ? dangerMutedTextClass : 'text-[var(--admin-ink-soft)]'
              }`}
            >
              {item.label}
            </dt>
            <dd
              className={`m-0 break-words ${
                isDanger ? dangerTextClass : 'text-[var(--admin-ink)]'
              }`}
            >
              {item.value}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

interface AdminJsonPreviewProps {
  description?: string;
  title: string;
  value: unknown;
}

interface AdminRedactedBlockProps {
  children: ReactNode;
  description: string;
  title: string;
}

/**
 * Shows a structured Firestore or API record as formatted JSON.
 */
export function AdminJsonPreview({
  description,
  title,
  value,
}: AdminJsonPreviewProps) {
  return (
    <AdminPanel description={description} title={title}>
      <pre className='m-0 overflow-x-auto rounded-[18px] border border-[var(--admin-line)] bg-[var(--admin-surface-muted)] p-4 text-xs leading-6 text-[var(--admin-ink)]'>
        {formatAdminJson(value)}
      </pre>
    </AdminPanel>
  );
}

/**
 * Visibly masks sensitive content when the admin app cannot safely show it.
 */
export function AdminRedactedBlock({
  children,
  description,
  title,
}: AdminRedactedBlockProps) {
  return (
    <div className='relative overflow-hidden rounded-[20px]'>
      <div className='pointer-events-none select-none opacity-25'>
        {children}
      </div>
      <div className='absolute inset-0 flex items-center justify-center p-4'>
        <div className='w-full rounded-[20px] border border-[var(--admin-danger)] bg-[var(--admin-danger-surface)] p-5 text-center'>
          <p className='m-0 text-sm font-semibold uppercase tracking-[0.08em] text-[var(--admin-danger)]'>
            {title}
          </p>
          <p className='mt-2 mb-0 text-sm leading-6 text-[var(--admin-danger)] opacity-80'>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
