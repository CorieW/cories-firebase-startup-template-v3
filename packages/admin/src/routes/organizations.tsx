/**
 * Organization directory route for admin search and read-only inspection.
 */
import {
  Link,
  Outlet,
  createFileRoute,
  useRouterState,
} from '@tanstack/react-router';
import { useToast } from '../../../common/src/client/SharedToastProvider';
import {
  AdminEmptyState,
  AdminPagination,
  AdminPageHeader,
  AdminPanel,
} from '../components/AdminElements';
import { loadOrganizationDirectoryServer } from '../lib/admin-data';
import { requireActiveAdmin } from '../lib/admin-auth';
import { formatAdminDateTime, formatAdminText } from '../lib/formatting';
import { normalizePaginationPage } from '../lib/pagination';
import { secondaryButtonClass, textInputClass } from '../lib/ui';

interface OrganizationDirectorySearchParams {
  page?: unknown;
  search?: unknown;
}

export const Route = createFileRoute('/organizations')({
  beforeLoad: async ({ location }) => {
    await requireActiveAdmin(location.pathname);
  },
  validateSearch: (search: OrganizationDirectorySearchParams | undefined) => ({
    page: normalizePaginationPage(search?.page),
    search: typeof search?.search === 'string' ? search.search.trim() : '',
  }),
  loaderDeps: ({ search }) => ({
    page: search.page,
    search: search.search,
  }),
  loader: async ({ deps }) =>
    loadOrganizationDirectoryServer({
      data: {
        page: deps.page,
        search: deps.search,
      },
    }),
  component: OrganizationsPage,
});

/**
 * Renders the organization directory with exact-id and prefix search.
 */
function OrganizationsPage() {
  const pathname = useRouterState({
    select: state => state.location.pathname,
  });
  const { toast } = useToast();
  const organizations = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  if (pathname.startsWith('/organizations/')) {
    return <Outlet />;
  }

  const showOrganizationSearchToast = (nextSearch: string) => {
    if (nextSearch) {
      toast.success({
        title: 'Organization filter updated',
        description: `Showing matching organizations for "${nextSearch}".`,
      });
      return;
    }

    toast.info({
      title: 'Organization filter cleared',
      description: 'Showing the latest organizations again.',
    });
  };

  return (
    <div className='space-y-6 py-5'>
      <AdminPageHeader
        description='Search organizations by id or name prefix, then inspect members and raw organization records.'
        title='Organization directory'
      />

      <AdminPanel
        description='Search by organization id or name prefix.'
        title='Find an organization'
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
            showOrganizationSearchToast(nextSearch);
          }}
        >
          <input
            className={textInputClass}
            defaultValue={search.search}
            name='search'
            placeholder='Search by name or organization id'
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
                  toast.info({
                    title: 'Organization filter cleared',
                    description: 'Showing the latest organizations again.',
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

      <AdminPanel
        description='These rows come directly from Better Auth organization records.'
        title='Results'
      >
        {organizations.items.length === 0 ? (
          <div className='space-y-4'>
            <AdminEmptyState
              description={
                organizations.page > 1
                  ? 'This page no longer has any matching organizations. Try the previous page or change the current filter.'
                  : 'Try a different prefix or clear the current filter to see the newest organizations.'
              }
              title='No organizations matched this search'
            />
            {organizations.page > 1 ? (
              <AdminPagination
                currentPage={organizations.page}
                hasNextPage={organizations.hasNextPage}
                itemCount={organizations.items.length}
                onPageChange={page => {
                  void navigate({
                    search: {
                      page,
                      search: search.search,
                    },
                  });
                }}
                pageSize={organizations.pageSize}
                totalCount={organizations.totalCount}
              />
            ) : null}
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='overflow-x-auto'>
              <table className='min-w-full border-separate border-spacing-0 text-sm'>
                <thead>
                  <tr className='text-left text-[0.72rem] uppercase tracking-[0.08em] text-[var(--ink-soft)]'>
                    <th className='border-b border-[var(--line)] px-3 py-3 font-semibold'>
                      Organization
                    </th>
                    <th className='border-b border-[var(--line)] px-3 py-3 font-semibold'>
                      Slug
                    </th>
                    <th className='border-b border-[var(--line)] px-3 py-3 font-semibold'>
                      ID
                    </th>
                    <th className='border-b border-[var(--line)] px-3 py-3 font-semibold'>
                      Created
                    </th>
                    <th className='border-b border-[var(--line)] px-3 py-3 font-semibold'>
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {organizations.items.map(organization => (
                    <tr key={organization.id}>
                      <td className='border-b border-[var(--line)] px-3 py-3 align-top font-medium'>
                        {formatAdminText(organization.name)}
                      </td>
                      <td className='border-b border-[var(--line)] px-3 py-3 align-top'>
                        {formatAdminText(organization.slug)}
                      </td>
                      <td className='border-b border-[var(--line)] px-3 py-3 align-top font-mono text-xs'>
                        {organization.id}
                      </td>
                      <td className='border-b border-[var(--line)] px-3 py-3 align-top'>
                        {formatAdminDateTime(organization.createdAt)}
                      </td>
                      <td className='border-b border-[var(--line)] px-3 py-3 align-top'>
                        <Link
                          className='font-semibold text-[var(--primary)]'
                          params={{ organizationId: organization.id }}
                          search={{
                            page: search.page,
                            search: search.search,
                          }}
                          to='/organizations/$organizationId'
                        >
                          Open organization
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <AdminPagination
              currentPage={organizations.page}
              hasNextPage={organizations.hasNextPage}
              itemCount={organizations.items.length}
              onPageChange={page => {
                void navigate({
                  search: {
                    page,
                    search: search.search,
                  },
                });
              }}
              pageSize={organizations.pageSize}
              totalCount={organizations.totalCount}
            />
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
