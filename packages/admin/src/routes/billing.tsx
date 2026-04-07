/**
 * Billing route for read-only Autumn customer diagnostics.
 */
import { createFileRoute } from '@tanstack/react-router';
import {
  AdminEmptyState,
  AdminPagination,
  AdminPageHeader,
  AdminPanel,
} from '../components/AdminElements';
import { loadBillingDataServer } from '../lib/admin-data';
import { requireActiveAdmin } from '../lib/admin-auth';
import {
  formatAdminDateTime,
  formatAdminNumber,
  formatAdminText,
} from '../lib/formatting';
import { normalizePaginationPage } from '../lib/pagination';
import type { BillingData } from '../lib/server/billing-data';
import {
  dangerCardClass,
  dangerMutedTextClass,
  dangerTextClass,
  secondaryButtonClass,
  textInputClass,
} from '../lib/ui';

interface BillingSearchParams {
  page?: unknown;
  search?: unknown;
}

export const Route = createFileRoute('/billing')({
  beforeLoad: async ({ location }) => {
    await requireActiveAdmin(location.pathname);
  },
  validateSearch: (search: BillingSearchParams | undefined) => ({
    page: normalizePaginationPage(search?.page),
    search: typeof search?.search === 'string' ? search.search.trim() : '',
  }),
  loaderDeps: ({ search }) => ({
    page: search.page,
    search: search.search,
  }),
  loader: async ({ deps }) =>
    loadBillingDataServer({
      data: {
        page: deps.page,
        search: deps.search,
      },
    }),
  component: BillingPage,
});

/**
 * Renders read-only customer billing visibility for admins.
 */
function BillingPage() {
  const billing = Route.useLoaderData() as BillingData;
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <div className='space-y-6 py-5'>
      <AdminPageHeader
        description='Inspect Autumn customer state without leaving the admin app. This view is read-only and only loads when billing credentials are configured.'
        title='Billing diagnostics'
      />

      <AdminPanel
        description='Search by customer id, email, or name.'
        title='Find a billing customer'
      >
        <form
          className='flex flex-col gap-3 md:flex-row'
          onSubmit={event => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const nextSearch = String(formData.get('search') ?? '').trim();

            void navigate({
              search: {
                page: 1,
                search: nextSearch,
              },
            });
          }}
        >
          <input
            className={textInputClass}
            defaultValue={search.search}
            name='search'
            placeholder='Search by customer id, name, or email'
            type='search'
          />
          <div className='flex gap-3'>
            <button className={secondaryButtonClass} type='submit'>
              Search
            </button>
            {search.search ? (
              <button
                className={secondaryButtonClass}
                onClick={() => {
                  void navigate({
                    search: {
                      page: 1,
                      search: '',
                    },
                  });
                }}
                type='button'
              >
                Clear
              </button>
            ) : null}
          </div>
        </form>
      </AdminPanel>

      {!billing.isAvailable ? (
        <div className={`${dangerCardClass} flex flex-col gap-4 p-6 text-sm`}>
          <div className='space-y-2'>
            <h2
              className={`m-0 text-lg font-semibold tracking-[-0.02em] ${dangerTextClass}`}
            >
              Billing integration is not configured
            </h2>
            <p className={`m-0 max-w-2xl leading-6 ${dangerMutedTextClass}`}>
              Set `AUTUMN_SECRET_KEY` in packages/admin/.env to unlock this page
              locally.
            </p>
          </div>
        </div>
      ) : (
        <>
          <section className='grid gap-4 md:grid-cols-2'>
            <article className='rounded-[20px] border border-[var(--admin-line)] bg-[var(--admin-surface)] p-5'>
              <p className='m-0 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[var(--admin-ink-soft)]'>
                Total customers
              </p>
              <p className='mt-4 mb-0 text-3xl font-semibold tracking-[-0.03em]'>
                {formatAdminNumber(billing.total)}
              </p>
            </article>
            <article className='rounded-[20px] border border-[var(--admin-line)] bg-[var(--admin-surface)] p-5'>
              <p className='m-0 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[var(--admin-ink-soft)]'>
                Filtered results
              </p>
              <p className='mt-4 mb-0 text-3xl font-semibold tracking-[-0.03em]'>
                {formatAdminNumber(billing.totalCount)}
              </p>
            </article>
          </section>

          <AdminPanel
            description='Recent Autumn customer records returned for this search.'
            title='Customers'
          >
            {billing.customers.length === 0 ? (
              <div className='space-y-4'>
                <AdminEmptyState
                  description={
                    billing.page > 1
                      ? 'This page no longer has any matching billing customers. Try the previous page or change the current search.'
                      : 'No billing customers matched the current search.'
                  }
                  title='No customers found'
                />
                {billing.page > 1 ? (
                  <AdminPagination
                    currentPage={billing.page}
                    hasNextPage={billing.hasNextPage}
                    itemCount={billing.customers.length}
                    onPageChange={page => {
                      void navigate({
                        search: {
                          page,
                          search: search.search,
                        },
                      });
                    }}
                    pageSize={billing.pageSize}
                    totalCount={billing.totalCount}
                  />
                ) : null}
              </div>
            ) : (
              <div className='space-y-4'>
                <div className='overflow-x-auto'>
                  <table className='min-w-full border-separate border-spacing-0 text-sm'>
                    <thead>
                      <tr className='text-left text-[0.72rem] uppercase tracking-[0.08em] text-[var(--admin-ink-soft)]'>
                        <th className='border-b border-[var(--admin-line)] px-3 py-3 font-semibold'>
                          Customer
                        </th>
                        <th className='border-b border-[var(--admin-line)] px-3 py-3 font-semibold'>
                          ID
                        </th>
                        <th className='border-b border-[var(--admin-line)] px-3 py-3 font-semibold'>
                          Subscriptions
                        </th>
                        <th className='border-b border-[var(--admin-line)] px-3 py-3 font-semibold'>
                          Purchases
                        </th>
                        <th className='border-b border-[var(--admin-line)] px-3 py-3 font-semibold'>
                          Created
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {billing.customers.map(customer => (
                        <tr key={customer.id}>
                          <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top'>
                            <div className='font-medium'>
                              {formatAdminText(customer.name)}
                            </div>
                            <div className='mt-1 text-[var(--admin-ink-soft)]'>
                              {formatAdminText(customer.email)}
                            </div>
                          </td>
                          <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top font-mono text-xs'>
                            {customer.id}
                          </td>
                          <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top'>
                            {formatAdminNumber(customer.subscriptions)}
                          </td>
                          <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top'>
                            {formatAdminNumber(customer.purchases)}
                          </td>
                          <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top'>
                            {formatAdminDateTime(customer.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <AdminPagination
                  currentPage={billing.page}
                  hasNextPage={billing.hasNextPage}
                  itemCount={billing.customers.length}
                  onPageChange={page => {
                    void navigate({
                      search: {
                        page,
                        search: search.search,
                      },
                    });
                  }}
                  pageSize={billing.pageSize}
                  totalCount={billing.totalCount}
                />
              </div>
            )}
          </AdminPanel>
        </>
      )}
    </div>
  );
}
