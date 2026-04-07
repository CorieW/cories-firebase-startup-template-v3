/**
 * Organization detail route for read-only admin inspection.
 */
import { createFileRoute } from '@tanstack/react-router';
import {
  AdminEmptyState,
  AdminJsonPreview,
  AdminKeyValueList,
  AdminPageHeader,
  AdminPanel,
} from '../components/AdminElements';
import { loadOrganizationDetailServer } from '../lib/admin-data';
import { requireActiveAdmin } from '../lib/admin-auth';
import { formatAdminDateTime, formatAdminText } from '../lib/formatting';
import type { AdminOrganizationDetail } from '../lib/server/organization-data';
import { badgeClass } from '../lib/ui';

export const Route = createFileRoute('/organizations/$organizationId')({
  beforeLoad: async ({ location }) => {
    await requireActiveAdmin(location.pathname);
  },
  loader: async ({ params }) =>
    loadOrganizationDetailServer({
      data: {
        organizationId: params.organizationId,
      },
    }),
  component: OrganizationDetailPage,
});

/**
 * Renders the raw organization record and current member list.
 */
function OrganizationDetailPage() {
  const detail = Route.useLoaderData() as AdminOrganizationDetail | null;
  const { organizationId } = Route.useParams();

  if (!detail) {
    return (
      <div className='space-y-6 py-5'>
        <AdminPageHeader
          description='That organization id does not exist in the auth collection.'
          title='Organization not found'
        />
        <AdminEmptyState
          description='Check the organization id and try the directory search again.'
          title='No organization record was found'
          tone='danger'
        />
      </div>
    );
  }

  const organizationRecord =
    detail.organization && typeof detail.organization === 'object'
      ? detail.organization
      : {};

  return (
    <div className='space-y-6 py-5'>
      <AdminPageHeader
        description='Review organization metadata, role distribution, and member details for a single tenant.'
        title={formatAdminText(
          typeof organizationRecord.name === 'string'
            ? organizationRecord.name
            : organizationId
        )}
      />

      <AdminPanel
        description='Core identifiers and top-level organization metadata.'
        title='Organization summary'
      >
        <AdminKeyValueList
          items={[
            {
              label: 'Organization ID',
              value: detail.id,
            },
            {
              label: 'Slug',
              value:
                typeof organizationRecord.slug === 'string'
                  ? organizationRecord.slug
                  : 'Unavailable',
            },
            {
              label: 'Created',
              value: formatAdminDateTime(
                typeof organizationRecord.createdAt === 'string'
                  ? organizationRecord.createdAt
                  : null
              ),
            },
          ]}
        />
      </AdminPanel>

      <AdminPanel
        description='Member roles from the current organization membership snapshot.'
        title='Member roles'
      >
        <div className='flex flex-wrap gap-3'>
          {Object.entries(detail.memberRoleCounts).length === 0 ? (
            <span className={badgeClass}>No roles recorded</span>
          ) : (
            Object.entries(detail.memberRoleCounts).map(([role, count]) => (
              <span key={role} className={badgeClass}>
                {role}: {count}
              </span>
            ))
          )}
        </div>
      </AdminPanel>

      <AdminPanel
        description='Current members ordered by most recent membership creation.'
        title={`Members (${detail.members.length})`}
      >
        {detail.members.length === 0 ? (
          <AdminEmptyState
            description='No organization members were found for this record.'
            title='No members found'
          />
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full border-separate border-spacing-0 text-sm'>
              <thead>
                <tr className='text-left text-[0.72rem] uppercase tracking-[0.08em] text-[var(--admin-ink-soft)]'>
                  <th className='border-b border-[var(--admin-line)] px-3 py-3 font-semibold'>
                    Member
                  </th>
                  <th className='border-b border-[var(--admin-line)] px-3 py-3 font-semibold'>
                    User ID
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
                {detail.members.map(member => (
                  <tr key={member.id}>
                    <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top'>
                      <div className='font-medium'>
                        {formatAdminText(member.name)}
                      </div>
                      <div className='mt-1 text-[var(--admin-ink-soft)]'>
                        {formatAdminText(member.email)}
                      </div>
                    </td>
                    <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top font-mono text-xs'>
                      {formatAdminText(member.userId)}
                    </td>
                    <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top capitalize'>
                      {formatAdminText(member.role)}
                    </td>
                    <td className='border-b border-[var(--admin-line)] px-3 py-3 align-top'>
                      {formatAdminDateTime(member.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>

      <AdminJsonPreview
        description='Serialized Better Auth organization document.'
        title='Organization record'
        value={detail.organization}
      />
    </div>
  );
}
