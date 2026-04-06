/**
 * Reusable signed-in sidebar navigation link renderer.
 */
import { Link } from '@tanstack/react-router';
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

  return (
    <Link
      to={item.to}
      className={`${baseClass} ${stateClass}`}
      onClick={onClick}
    >
      <Icon aria-hidden='true' className='h-4 w-4 shrink-0' />
      <span className='truncate whitespace-nowrap'>{item.label}</span>
    </Link>
  );
}
