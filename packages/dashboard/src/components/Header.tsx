/**
 * Top navigation or header component.
 */
import { useRouterState } from '@tanstack/react-router';
import { isAuthRoutePath } from '../lib/route-paths';
import SignedInSidebar from './shell/SignedInSidebar';
import SignedOutHeader from './shell/SignedOutHeader';

interface HeaderProps {
  isSessionPending: boolean;
  showSignedInShell: boolean;
}

export default function Header({
  isSessionPending,
  showSignedInShell,
}: HeaderProps) {
  const pathname = useRouterState({
    select: state => state.location.pathname,
  });
  const isAuthRoute = isAuthRoutePath(pathname);

  if (showSignedInShell) {
    return <SignedInSidebar isSessionPending={isSessionPending} />;
  }

  return <SignedOutHeader isAuthRoute={isAuthRoute} />;
}
