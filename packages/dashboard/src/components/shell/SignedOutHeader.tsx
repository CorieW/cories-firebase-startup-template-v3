/**
 * Signed-out header variant.
 */
import AppBrand from '../AppBrand';
import ThemeToggle from '../ThemeToggle';

interface SignedOutHeaderProps {
  isAuthRoute: boolean;
}

/**
 * Header content shown only when users are signed out.
 */
export default function SignedOutHeader({ isAuthRoute }: SignedOutHeaderProps) {
  if (!isAuthRoute) {
    return null;
  }

  return (
    <>
      <div className='fixed left-4 top-4 z-40'>
        <AppBrand to={null} />
      </div>
      <div className='fixed right-4 top-4 z-40'>
        <ThemeToggle />
      </div>
    </>
  );
}
