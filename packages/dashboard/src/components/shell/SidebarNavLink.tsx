/**
 * Reusable signed-in sidebar navigation link renderer.
 */
import { Link } from '@tanstack/react-router';
import type { LucideIcon } from 'lucide-react';
import {
  type NavItem,
  sidebarNavItemActiveClass,
  sidebarNavItemBaseClass,
  sidebarNavItemInactiveClass,
  sidebarNestedNavItemActiveClass,
  sidebarNestedNavItemBaseClass,
  sidebarNestedNavItemInactiveClass,
} from './signed-in-sidebar.constants';

export default function SidebarNavLink({
  isActive,
  item,
  nested = false,
  onClick,
}: {
  isActive: boolean;
  item: NavItem;
  nested?: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  const baseClass = nested
    ? sidebarNestedNavItemBaseClass
    : `${sidebarNavItemBaseClass} h-10`;
  const stateClass = isActive
    ? nested
      ? sidebarNestedNavItemActiveClass
      : sidebarNavItemActiveClass
    : nested
      ? sidebarNestedNavItemInactiveClass
      : sidebarNavItemInactiveClass;
  const ExternalIcon = item.externalIcon as LucideIcon | undefined;
  const content = (
    <>
      <Icon aria-hidden='true' className='h-4 w-4 shrink-0' />
      <span className='truncate whitespace-nowrap'>{item.label}</span>
      {ExternalIcon ? (
        <ExternalIcon
          aria-hidden='true'
          className='ml-auto h-3.5 w-3.5 shrink-0'
        />
      ) : null}
    </>
  );

  if (item.external) {
    return (
      <a
        href={item.to}
        target='_blank'
        rel='noreferrer'
        className={`${baseClass} ${stateClass}`}
        onClick={onClick}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      to={item.to}
      search={item.search}
      className={`${baseClass} ${stateClass}`}
      onClick={onClick}
    >
      {content}
    </Link>
  );
}
