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
      <div className='fixed top-4 left-4 z-40'>
        <AppBrand to={null} />
      </div>
      <div className='fixed top-4 right-4 z-40'>
        <ThemeToggle />
      </div>
    </>
  );
}
