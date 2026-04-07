/**
 * User directory route for admin search and read-only inspection.
 */
import {
  Link,
  Outlet,
  createFileRoute,
  useRouterState,
} from '@tanstack/react-router';
import {
  AdminEmptyState,
  AdminPagination,
  AdminPageHeader,
  AdminPanel,
} from '../components/AdminElements';
import { loadUserDirectoryServer } from '../lib/admin-data';
import { requireActiveAdmin } from '../lib/admin-auth';
import { formatAdminDateTime, formatAdminText } from '../lib/formatting';
import { normalizePaginationPage } from '../lib/pagination';
import { secondaryButtonClass, textInputClass } from '../lib/ui';

interface UserDirectorySearchParams {
  page?: unknown;
  search?: unknown;
}

export const Route = createFileRoute('/users')({
  beforeLoad: async ({ location }) => {
    await requireActiveAdmin(location.pathname);
  },
  validateSearch: (search: UserDirectorySearchParams | undefined) => ({
    page: normalizePaginationPage(search?.page),
    search: typeof search?.search === 'string' ? search.search.trim() : '',
  }),
  loaderDeps: ({ search }) => ({
    page: search.page,
    search: search.search,
  }),
  loader: async ({ deps }) =>
    loadUserDirectoryServer({
      data: {
        page: deps.page,
        search: deps.search,
      },
    }),
  component: UsersPage,
});

/**
 * Renders the user directory with lightweight search controls.
 */
function UsersPage() {
  const pathname = useRouterState({
    select: state => state.location.pathname,
  });
  const users = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  if (pathname.startsWith('/users/')) {
    return <Outlet />;
  }

  return (
    <div className='space-y-6 py-5'>
      <AdminPageHeader
        description='Find Better Auth users by id, email, or name, then inspect their raw profile and membership records.'
        title='User directory'
      />

      <AdminPanel
        description='Search by user id, email prefix, or name prefix.'
        title='Find a user'
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
            placeholder='Search by email, name, or uid'
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

      <AdminPanel
        description='These rows come directly from Better Auth user records.'
        title='Results'
      >
        {users.items.length === 0 ? (
          <div className='space-y-4'>
            <AdminEmptyState
              description={
                users.page > 1
                  ? 'This page no longer has any matching users. Try the previous page or change the current filter.'
                  : 'Try a different prefix or clear the current filter to see the newest users.'
              }
              title='No users matched this search'
            />
            {users.page > 1 ? (
              <AdminPagination
                currentPage={users.page}
                hasNextPage={users.hasNextPage}
                itemCount={users.items.length}
                onPageChange={page => {
                  void navigate({
                    search: {
                      page,
                      search: search.search,
                    },
                  });
                }}
                pageSize={users.pageSize}
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
                      User
                    </th>
                    <th className='border-b border-[var(--admin-line)] px-3 py-3 font-semibold'>
                      ID
                    </th>
                    <th className='border-b border-[var(--admin-line)] px-3 py-3 font-semibold'>
                      Created
                    </th>
                    <th className='border-b border-[var(--admin-line)] px-3 py-3 font-semibold'>
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.items.map(user => (
                    <tr key={user.id}>
                      <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top'>
                        <div className='font-medium'>
                          {formatAdminText(user.name)}
                        </div>
                        <div className='mt-1 text-[var(--admin-ink-soft)]'>
                          {formatAdminText(user.email)}
                        </div>
                      </td>
                      <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top font-mono text-xs'>
                        {user.id}
                      </td>
                      <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top'>
                        {formatAdminDateTime(user.createdAt)}
                      </td>
                      <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top'>
                        <Link
                          className='font-semibold text-[var(--admin-primary)]'
                          params={{ userId: user.id }}
                          to='/users/$userId'
                        >
                          Open profile
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <AdminPagination
              currentPage={users.page}
              hasNextPage={users.hasNextPage}
              itemCount={users.items.length}
              onPageChange={page => {
                void navigate({
                  search: {
                    page,
                    search: search.search,
                  },
                });
              }}
              pageSize={users.pageSize}
            />
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
