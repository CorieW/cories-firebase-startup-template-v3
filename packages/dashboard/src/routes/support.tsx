/**
 * Support route module.
 */
import { createFileRoute, redirect } from '@tanstack/react-router';
import { SUPPORT_ROUTE_PATH, SUPPORT_ROUTE_PATHS } from '../lib/route-paths';

export const Route = createFileRoute(SUPPORT_ROUTE_PATH)({
  beforeLoad: ({ location }) => {
    const isSupportIndexPath =
      location.pathname === SUPPORT_ROUTE_PATH ||
      location.pathname === `${SUPPORT_ROUTE_PATH}/`;

    if (isSupportIndexPath) {
      throw redirect({
        to: SUPPORT_ROUTE_PATHS.docs,
      });
    }
  },
});
