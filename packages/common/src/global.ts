/**
 * Shared constants and repo-wide global helpers.
 */
// =============================================================================
// FIRESTORE COLLECTION PATHS
// =============================================================================

/**
 * Private collection path constants
 * These are kept private to enforce using the helper functions below
 * which provide consistency and prevent typos in collection path references
 */
const USERS_COLLECTION = 'users';
const AUTH_ORGANIZATIONS_COLLECTION = 'auth_organizations';

// =============================================================================
// FIRESTORE PATH HELPER FUNCTIONS
// =============================================================================

/**
 * Get the Firestore collection path for users
 * @returns The users collection path string
 */
export function getUsersPath() {
  return USERS_COLLECTION;
}

/**
 * Get the Firestore document path for a specific user
 * @param userUid - The unique identifier for the user
 * @returns The complete document path for the specified user
 */
export function getUserPath(userUid: string) {
  return USERS_COLLECTION + '/' + userUid;
}

/**
 * Get the Firestore collection path for Better Auth organizations.
 * @returns The organization collection path string.
 */
export function getOrganizationsPath() {
  return AUTH_ORGANIZATIONS_COLLECTION;
}

/**
 * Get the Firestore document path for a specific Better Auth organization.
 * @param organizationId - Organization identifier.
 * @returns The complete organization document path.
 */
export function getOrganizationPath(organizationId: string) {
  return AUTH_ORGANIZATIONS_COLLECTION + '/' + organizationId;
}

// ===========================================================================
// NETWORK REQUEST CONFIGURATION
// ===========================================================================

/**
 * Default timeout in milliseconds for client-side network-bound operations.
 * Applies to auth requests and callable function requests handled by common API
 * utilities.
 * @default 30000
 */
export let NETWORK_REQUEST_TIMEOUT_MS = 30_000;

// ===========================================================================
// TESTING CONFIGURATION
// ===========================================================================

/**
 * The delay in milliseconds to add to the response of a callable function
 * This is useful for testing the loading state of the application
 * @default 0
 */
export let ARTIFICIAL_CALLABLE_DELAY = 0;
/**
 * The delay in milliseconds to add before auth client API requests.
 * This is useful for testing auth loading states in the application.
 * @default 0
 */
export let ARTIFICIAL_AUTH_DELAY = 0;
export let DISABLE_CLIENT_SIDE_VALIDATION = false;

/**
 * Set the delay in milliseconds to add to the response of a callable function
 * This is useful for testing the loading state of the application
 * @param delay - The delay in milliseconds
 */
export function setArtificialCallableDelay(delay: number) {
  ARTIFICIAL_CALLABLE_DELAY = delay;
}

/**
 * Set the delay in milliseconds to add before auth client API requests.
 * This is useful for testing auth loading states in the application.
 * @param delay - The delay in milliseconds
 */
export function setArtificialAuthDelay(delay: number) {
  ARTIFICIAL_AUTH_DELAY = delay;
}

/**
 * Set the flag to disable client-side validation
 * This is useful for testing the loading state of the application
 * @param disable - The flag to disable client-side validation
 */
export function setDisableClientSideValidation(disable: boolean) {
  DISABLE_CLIENT_SIDE_VALIDATION = disable;
}

/**
 * Set the timeout in milliseconds for network-bound operations.
 * Useful for tests and local debugging.
 * @param timeoutMs - Timeout in milliseconds
 */
export function setNetworkRequestTimeout(timeoutMs: number) {
  NETWORK_REQUEST_TIMEOUT_MS = timeoutMs;
}
