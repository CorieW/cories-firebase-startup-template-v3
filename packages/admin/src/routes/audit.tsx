/**
 * Audit route for recent read-only admin activity inspection.
 */
import { createFileRoute } from '@tanstack/react-router';
import {
  AdminEmptyState,
  AdminPagination,
  AdminPageHeader,
  AdminPanel,
} from '../components/AdminElements';
import { loadAuditDataServer } from '../lib/admin-data';
import { requireActiveAdmin } from '../lib/admin-auth';
import { formatAdminDateTime, formatAdminJson } from '../lib/formatting';
import {
  normalizePaginationPage,
  type AdminPaginatedResult,
} from '../lib/pagination';
import type { SerializedAdminAuditLog } from '../lib/server/audit-log';
import { secondaryButtonClass, textInputClass } from '../lib/ui';

interface AuditSearchParams {
  action?: unknown;
  actor?: unknown;
  from?: unknown;
  page?: unknown;
  resourceType?: unknown;
  to?: unknown;
}

export const Route = createFileRoute('/audit')({
  beforeLoad: async ({ location }) => {
    await requireActiveAdmin(location.pathname);
  },
  validateSearch: (search: AuditSearchParams | undefined) => ({
    action: typeof search?.action === 'string' ? search.action.trim() : '',
    actor: typeof search?.actor === 'string' ? search.actor.trim() : '',
    from: typeof search?.from === 'string' ? search.from.trim() : '',
    page: normalizePaginationPage(search?.page),
    resourceType:
      typeof search?.resourceType === 'string'
        ? search.resourceType.trim()
        : '',
    to: typeof search?.to === 'string' ? search.to.trim() : '',
  }),
  loaderDeps: ({ search }) => ({
    action: search.action,
    actor: search.actor,
    from: search.from,
    page: search.page,
    resourceType: search.resourceType,
    to: search.to,
  }),
  loader: async ({ deps }) =>
    loadAuditDataServer({
      data: deps,
    }),
  component: AuditPage,
});

/**
 * Renders recent admin audit rows with lightweight client-facing filters.
 */
function AuditPage() {
  const entries =
    Route.useLoaderData() as AdminPaginatedResult<SerializedAdminAuditLog>;
  const search = Route.useSearch() ?? {
    action: '',
    actor: '',
    from: '',
    page: 1,
    resourceType: '',
    to: '',
  };
  const navigate = Route.useNavigate();

  return (
    <div className='space-y-6 py-5'>
      <AdminPageHeader
        description='Review recent admin reads, denied access attempts, and billing lookups. Search text is redacted before it is stored.'
        title='Audit timeline'
      />

      <AdminPanel
        description='Filters are applied against recent audit rows in reverse chronological order.'
        title='Filter activity'
      >
        <form
          className='grid gap-3 lg:grid-cols-5'
          onSubmit={event => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);

            void navigate({
              search: {
                action: String(formData.get('action') ?? '').trim(),
                actor: String(formData.get('actor') ?? '').trim(),
                from: String(formData.get('from') ?? '').trim(),
                page: 1,
                resourceType: String(formData.get('resourceType') ?? '').trim(),
                to: String(formData.get('to') ?? '').trim(),
              },
            });
          }}
        >
          <input
            className={textInputClass}
            defaultValue={search.action}
            name='action'
            placeholder='Action'
            type='search'
          />
          <input
            className={textInputClass}
            defaultValue={search.actor}
            name='actor'
            placeholder='Actor uid'
            type='search'
          />
          <input
            className={textInputClass}
            defaultValue={search.resourceType}
            name='resourceType'
            placeholder='Resource type'
            type='search'
          />
          <input
            className={textInputClass}
            defaultValue={search.from}
            name='from'
            placeholder='From ISO date'
            type='search'
          />
          <input
            className={textInputClass}
            defaultValue={search.to}
            name='to'
            placeholder='To ISO date'
            type='search'
          />
          <div className='flex gap-3 lg:col-span-5'>
            <button className={secondaryButtonClass} type='submit'>
              Apply filters
            </button>
            {(search.action ||
              search.actor ||
              search.resourceType ||
              search.from ||
              search.to) && (
              <button
                className={secondaryButtonClass}
                onClick={() => {
                  void navigate({
                    search: {
                      action: '',
                      actor: '',
                      from: '',
                      page: 1,
                      resourceType: '',
                      to: '',
                    },
                  });
                }}
                type='button'
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </AdminPanel>

      <AdminPanel
        description='Most recent stored rows after filter matching.'
        title='Audit entries'
      >
        {entries.items.length === 0 ? (
          <div className='space-y-4'>
            <AdminEmptyState
              description={
                entries.page > 1
                  ? 'This page no longer has any matching audit entries. Try the previous page or broaden the filters.'
                  : 'Try broadening the filters or use other admin pages to generate fresh audit rows.'
              }
              title='No audit entries matched these filters'
            />
            {entries.page > 1 ? (
              <AdminPagination
                currentPage={entries.page}
                hasNextPage={entries.hasNextPage}
                itemCount={entries.items.length}
                onPageChange={page => {
                  void navigate({
                    search: {
                      action: search.action,
                      actor: search.actor,
                      from: search.from,
                      page,
                      resourceType: search.resourceType,
                      to: search.to,
                    },
                  });
                }}
                pageSize={entries.pageSize}
                totalCount={entries.totalCount}
              />
            ) : null}
          </div>
        ) : (
          <div className='space-y-4'>
            {entries.items.map(entry => (
              <article
                key={entry.id}
                className='rounded-[20px] border border-[var(--admin-line)] bg-[var(--admin-surface)] p-5'
              >
                <div className='flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between'>
                  <div className='space-y-2'>
                    <p className='m-0 text-lg font-semibold tracking-[-0.02em]'>
                      {entry.action}
                    </p>
                    <p className='m-0 text-sm text-[var(--admin-ink-soft)]'>
                      {formatAdminDateTime(entry.occurredAt)} by{' '}
                      {entry.actorUid}
                    </p>
                  </div>
                  <div className='flex flex-wrap gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[var(--admin-ink-soft)]'>
                    <span>{entry.resourceType}</span>
                    <span>{entry.result}</span>
                  </div>
                </div>

                <div className='mt-4 grid gap-3 md:grid-cols-2'>
                  <div className='rounded-[16px] bg-[var(--admin-surface-strong)] p-4 text-sm'>
                    <p className='m-0 font-semibold'>Resource ID</p>
                    <p className='mt-2 mb-0 break-words text-[var(--admin-ink-soft)]'>
                      {entry.resourceId ?? 'Unavailable'}
                    </p>
                  </div>
                  <div className='rounded-[16px] bg-[var(--admin-surface-strong)] p-4 text-sm'>
                    <p className='m-0 font-semibold'>Request ID</p>
                    <p className='mt-2 mb-0 break-words text-[var(--admin-ink-soft)]'>
                      {entry.requestId}
                    </p>
                  </div>
                </div>

                <details className='mt-4'>
                  <summary className='cursor-pointer text-sm font-semibold text-[var(--admin-primary)]'>
                    View metadata
                  </summary>
                  <pre className='mt-3 overflow-x-auto rounded-[16px] border border-[var(--admin-line)] bg-[var(--admin-surface-muted)] p-4 text-xs leading-6 text-[var(--admin-ink)]'>
                    {formatAdminJson(entry.metadata)}
                  </pre>
                </details>
              </article>
            ))}
            <AdminPagination
              currentPage={entries.page}
              hasNextPage={entries.hasNextPage}
              itemCount={entries.items.length}
              onPageChange={page => {
                void navigate({
                  search: {
                    action: search.action,
                    actor: search.actor,
                    from: search.from,
                    page,
                    resourceType: search.resourceType,
                    to: search.to,
                  },
                });
              }}
              pageSize={entries.pageSize}
              totalCount={entries.totalCount}
            />
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
