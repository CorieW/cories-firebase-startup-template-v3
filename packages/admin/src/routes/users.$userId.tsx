/**
 * User detail route for read-only admin inspection.
 */
import { Link, createFileRoute } from '@tanstack/react-router';
import {
  AdminEmptyState,
  AdminJsonPreview,
  AdminKeyValueList,
  AdminPageHeader,
  AdminPanel,
} from '../components/AdminElements';
import { loadUserDetailServer } from '../lib/admin-data';
import { requireActiveAdmin } from '../lib/admin-auth';
import { formatAdminDateTime, formatAdminText } from '../lib/formatting';
import type { AdminUserDetail } from '../lib/server/user-data';
import { ADMIN_USERS_ROUTE_PATH } from '../lib/route-paths';

export const Route = createFileRoute('/users/$userId')({
  beforeLoad: async ({ location }) => {
    await requireActiveAdmin(location.pathname);
  },
  loader: async ({ params }) =>
    loadUserDetailServer({
      data: {
        userId: params.userId,
      },
    }),
  component: UserDetailPage,
});

/**
 * Renders the auth and app profile data for a specific user.
 */
function UserDetailPage() {
  const detail = Route.useLoaderData() as AdminUserDetail | null;
  const { userId } = Route.useParams();

  if (!detail) {
    return (
      <div className='space-y-6 py-5'>
        <AdminPageHeader
          description='That user id does not exist in the auth collection.'
          title='User not found'
        />
        <AdminEmptyState
          description='Check the uid and try the directory search again.'
          title='No user record was found'
        />
        <div>
          <Link
            className='font-semibold text-[var(--admin-primary)]'
            search={{
              page: 1,
              search: '',
            }}
            to={ADMIN_USERS_ROUTE_PATH}
          >
            Return to user directory
          </Link>
        </div>
      </div>
    );
  }

  const authUser =
    detail.authUser && typeof detail.authUser === 'object'
      ? detail.authUser
      : {};

  return (
    <div className='space-y-6 py-5'>
      <AdminPageHeader
        description='Review Better Auth profile data, app-owned profile data, and organization memberships for a single user.'
        title={formatAdminText(
          typeof authUser.name === 'string' ? authUser.name : userId
        )}
      />

      <AdminPanel
        description='Core identifiers and account timestamps.'
        title='User summary'
      >
        <AdminKeyValueList
          items={[
            {
              label: 'User ID',
              value: detail.id,
            },
            {
              label: 'Email',
              value:
                typeof authUser.email === 'string'
                  ? authUser.email
                  : 'Unavailable',
            },
            {
              label: 'Created',
              value: formatAdminDateTime(
                typeof authUser.createdAt === 'string'
                  ? authUser.createdAt
                  : null
              ),
            },
          ]}
        />
      </AdminPanel>

      <AdminPanel
        description='Memberships recorded by the Better Auth organization plugin.'
        title={`Memberships (${detail.memberships.length})`}
      >
        {detail.memberships.length === 0 ? (
          <AdminEmptyState
            description='This user is not currently attached to any organization memberships.'
            title='No memberships found'
          />
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full border-separate border-spacing-0 text-sm'>
              <thead>
                <tr className='text-left text-[0.72rem] uppercase tracking-[0.08em] text-[var(--admin-ink-soft)]'>
                  <th className='border-b border-[var(--admin-line)] px-3 py-3 font-semibold'>
                    Organization
                  </th>
                  <th className='border-b border-[var(--admin-line)] px-3 py-3 font-semibold'>
                    Role
                  </th>
                  <th className='border-b border-[var(--admin-line)] px-3 py-3 font-semibold'>
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {detail.memberships.map(membership => (
                  <tr key={membership.id}>
                    <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top'>
                      {formatAdminText(membership.organizationName)}
                    </td>
                    <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top capitalize'>
                      {formatAdminText(membership.role)}
                    </td>
                    <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top'>
                      {formatAdminDateTime(membership.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>

      <div className='grid gap-6 xl:grid-cols-2'>
        <AdminJsonPreview
          description='Serialized Better Auth user document.'
          title='Auth user record'
          value={detail.authUser}
        />
        <AdminJsonPreview
          description='Serialized app-owned profile document from users/{id}.'
          title='App user record'
          value={detail.appUser}
        />
      </div>

      <div>
        <Link
          className='font-semibold text-[var(--admin-primary)]'
          search={{
            page: 1,
            search: '',
          }}
          to={ADMIN_USERS_ROUTE_PATH}
        >
          Return to user directory
        </Link>
      </div>
    </div>
  );
}
