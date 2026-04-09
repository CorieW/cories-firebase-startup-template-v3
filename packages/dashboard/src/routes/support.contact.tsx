/**
 * Support contact route module.
 */
import { createFileRoute, redirect } from '@tanstack/react-router';
import { SUPPORT_ROUTE_PATHS } from '../lib/route-paths';
import { CHAT_ROUTE_PATH } from './chat';

export const Route = createFileRoute(SUPPORT_ROUTE_PATHS.contact)({
  beforeLoad: () => {
    throw redirect({
      to: CHAT_ROUTE_PATH,
      search: { source: 'contact-support' },
    });
  },
});
