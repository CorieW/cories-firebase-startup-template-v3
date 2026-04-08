/**
 * Common auth entrypoint with shared Better Auth constants and search helpers.
 */
import {
  BETTER_AUTH_COLLECTIONS,
  BETTER_AUTH_ORGANIZATION_COLLECTIONS,
} from './global.js';
import {
  buildAuthOrganizationSearchFields,
  buildAuthUserSearchFields,
  getSearchPrefixBounds,
  normalizeSearchValue,
} from './utils/search.js';

export {
  BETTER_AUTH_COLLECTIONS,
  BETTER_AUTH_ORGANIZATION_COLLECTIONS,
} from './global.js';
export type {
  AuthOrganizationSearchFields,
  AuthUserSearchFields,
} from './utils/search.js';
export {
  buildAuthOrganizationSearchFields,
  buildAuthUserSearchFields,
  getSearchPrefixBounds,
  normalizeSearchValue,
} from './utils/search.js';

const auth = {
  BETTER_AUTH_COLLECTIONS,
  BETTER_AUTH_ORGANIZATION_COLLECTIONS,
  buildAuthOrganizationSearchFields,
  buildAuthUserSearchFields,
  getSearchPrefixBounds,
  normalizeSearchValue,
};

export default auth;
