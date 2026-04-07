/**
 * Shared English message catalog used across frontend and backend packages.
 */
export const commonMessages = {
  'errors.auth.account-exists-with-different-credential':
    'Account exists with different credentials. Sign in using the associated provider.',
  'errors.auth.admin-restricted-operation':
    'Operation restricted to administrators only.',
  'errors.auth.app-deleted': 'This Firebase app instance has been deleted.',
  'errors.auth.app-not-authorized':
    'App is not authorized to use this API key. Check your API key settings.',
  'errors.auth.app-not-installed': 'App is not installed on this device.',
  'errors.auth.argument-error': 'Invalid or missing argument.',
  'errors.auth.auth-domain-config-required':
    'authDomain missing in firebase.initializeApp().',
  'errors.auth.cancelled-popup-request':
    'Operation cancelled due to another open popup.',
  'errors.auth.captcha-check-failed':
    'Invalid or expired reCAPTCHA token, or domain not allowed.',
  'errors.auth.code-expired':
    'Verification code expired. Please request a new one.',
  'errors.auth.cordova-not-ready': 'Cordova framework is not ready.',
  'errors.auth.cors-unsupported': 'Browser does not support CORS.',
  'errors.auth.credential-already-in-use':
    'This credential is already linked to another account.',
  'errors.auth.custom-token-mismatch': 'Custom token audience mismatch.',
  'errors.auth.dynamic-link-not-activated':
    'Dynamic Links not enabled. Activate it in the console.',
  'errors.auth.email-already-in-use':
    'Email already in use by another account.',
  'errors.auth.email-change-needs-verification':
    'Email must be verified for multi-factor users.',
  'errors.auth.expired-action-code': 'Action code expired.',
  'errors.auth.forbidden': 'Forbidden',
  'errors.auth.internal-error': 'An internal error occurred.',
  'errors.auth.invalid-action-code': 'Action code invalid or already used.',
  'errors.auth.invalid-api-key': 'API key is invalid. Please verify it.',
  'errors.auth.invalid-app-credential':
    'Invalid application verifier or reCAPTCHA token.',
  'errors.auth.invalid-app-id':
    'App identifier not registered for this project.',
  'errors.auth.invalid-auth-event': 'An authentication error occurred.',
  'errors.auth.invalid-cert-hash': 'SHA-1 certificate hash is invalid.',
  'errors.auth.invalid-continue-uri': 'Invalid redirect URL.',
  'errors.auth.invalid-cordova-configuration':
    'Missing required Cordova plugins for OAuth sign-in.',
  'errors.auth.invalid-credential': 'Invalid credentials provided.',
  'errors.auth.invalid-custom-token': 'Custom token format is incorrect.',
  'errors.auth.invalid-dynamic-link-domain':
    'Dynamic link domain not configured for this project.',
  'errors.auth.invalid-email': 'Email address format is invalid.',
  'errors.auth.invalid-message-payload':
    'Invalid characters in email template.',
  'errors.auth.invalid-multi-factor-session':
    'Invalid multi-factor session. Complete first-factor sign-in.',
  'errors.auth.invalid-oauth-client-id':
    'OAuth client ID invalid or mismatched.',
  'errors.auth.invalid-oauth-provider':
    'OAuth provider not supported for this operation.',
  'errors.auth.invalid-persistence-type':
    "Persistence type must be 'local', 'session', or 'none'.",
  'errors.auth.invalid-phone-number':
    'Phone number format is invalid. Use E.164 format.',
  'errors.auth.invalid-provider-id': 'Provider ID is invalid.',
  'errors.auth.invalid-recipient-email': 'Recipient email address is invalid.',
  'errors.auth.invalid-sender': 'Invalid sender email or name in template.',
  'errors.auth.invalid-tenant-id': 'Tenant ID is invalid.',
  'errors.auth.invalid-user-token': 'User credential invalid for this project.',
  'errors.auth.invalid-verification-code':
    'Invalid verification code. Request a new one.',
  'errors.auth.invalid-verification-id': 'Verification ID is invalid.',
  'errors.auth.maximum-second-factor-count-exceeded':
    'Maximum number of second factors exceeded.',
  'errors.auth.missing-android-pkg-name': 'Android package name is required.',
  'errors.auth.missing-app-credential':
    'Missing application verifier assertion.',
  'errors.auth.missing-continue-uri': 'Redirect URL is required.',
  'errors.auth.missing-iframe-start': 'An internal error occurred.',
  'errors.auth.missing-ios-bundle-id':
    'iOS bundle ID is required when App Store ID is provided.',
  'errors.auth.missing-multi-factor-info':
    'Second-factor identifier is required.',
  'errors.auth.missing-multi-factor-session':
    'First-factor authentication proof is missing.',
  'errors.auth.missing-or-invalid-nonce': 'Nonce is missing or invalid.',
  'errors.auth.missing-phone-number': 'Phone number is required.',
  'errors.auth.missing-verification-code': 'SMS verification code is required.',
  'errors.auth.missing-verification-id': 'Verification ID is required.',
  'errors.auth.multi-factor-auth-required':
    'Multi-factor authentication required.',
  'errors.auth.multi-factor-info-not-found':
    'No matching multi-factor info found.',
  'errors.auth.network-request-failed': 'Network error. Please try again.',
  'errors.auth.no-auth-event': 'An authentication error occurred.',
  'errors.auth.no-such-provider': 'User not linked to the specified provider.',
  'errors.auth.null-user': 'User object cannot be null.',
  'errors.auth.operation-not-allowed':
    'Sign-in method disabled. Enable it in the console.',
  'errors.auth.operation-not-supported-in-this-environment':
    'Operation not supported in this environment.',
  'errors.auth.popup-blocked': 'Popup blocked by the browser.',
  'errors.auth.popup-closed-by-user': 'Popup closed before completion.',
  'errors.auth.provider-already-linked':
    'User already linked to this provider.',
  'errors.auth.quota-exceeded': 'Quota exceeded. Please try again later.',
  'errors.auth.redirect-cancelled-by-user': 'Redirect cancelled by the user.',
  'errors.auth.redirect-operation-pending':
    'Redirect sign-in operation already pending.',
  'errors.auth.rejected-credential': 'Malformed or mismatched credentials.',
  'errors.auth.requires-recent-login':
    'Recent login required. Please sign in again.',
  'errors.auth.second-factor-already-in-use':
    'This second factor is already in use.',
  'errors.auth.tenant-id-mismatch': 'Provided tenant ID does not match.',
  'errors.auth.timeout': 'Operation timed out.',
  'errors.auth.too-many-requests': 'Too many requests. Please try again later.',
  'errors.auth.unauthorized': 'Unauthorized',
  'errors.auth.unauthorized-continue-uri':
    'Continue URL domain not authorized.',
  'errors.auth.unauthorized-domain':
    'Domain not authorized for OAuth operations.',
  'errors.auth.unsupported-first-factor':
    'Unsupported first factor for multi-factor sign-in.',
  'errors.auth.unsupported-persistence-type':
    'Persistence type not supported in this environment.',
  'errors.auth.unsupported-tenant-operation':
    'Operation not supported in multi-tenant context.',
  'errors.auth.unverified-email': 'Email address is not verified.',
  'errors.auth.user-cancelled': 'User cancelled the operation.',
  'errors.auth.user-disabled': 'User account has been disabled.',
  'errors.auth.user-mismatch': 'Credentials do not match the signed-in user.',
  'errors.auth.user-not-found': 'User not found.',
  'errors.auth.user-signed-out': 'User has been signed out.',
  'errors.auth.user-token-expired':
    'User credential expired. Please sign in again.',
  'errors.auth.userAlreadyAuthenticated': 'User is already authenticated',
  'errors.auth.userNotAuthenticated': 'User is not authenticated',
  'errors.auth.weak-password': 'Password must be at least six characters long.',
  'errors.auth.web-storage-unsupported':
    'Web storage or third-party cookies are not supported.',
  'errors.auth.wrong-password': 'Incorrect password.',
  'errors.backend.auth.clerkClientFactoryMissing':
    'Failed to initialize the backend auth client',
  'errors.backend.env.clerkSecretOrPublishableKeyMissing':
    'Missing backend auth configuration',
  'errors.backend.firebase.initializationFailed':
    'Firebase app initialization failed',
  'errors.backend.upstreamUnavailable': 'A backend dependency is unavailable',
  'errors.billing.accountNotFound': 'Billing account not found',
  'errors.billing.cancelUrlRequired': 'Cancel URL is required',
  'errors.billing.checkoutIntentRequired': 'Checkout intent is required',
  'errors.billing.checkoutUrlMissing':
    'Checkout URL was not returned by the billing provider',
  'errors.billing.currencyMismatch': 'Currency mismatch',
  'errors.billing.idempotencyKeyRequired': 'Idempotency key is required',
  'errors.billing.insufficientFunds': 'Insufficient wallet funds',
  'errors.billing.invalidRedirectUrl': 'A valid redirect URL is required',
  'errors.billing.invalidScope': 'Billing scope must be user or organization',
  'errors.billing.invalidSubjectId': 'Billing subject ID is invalid',
  'errors.billing.invalidTopUpAmount': 'Top-up amount is invalid',
  'errors.billing.invalidUsageAmount': 'Usage amount is invalid',
  'errors.billing.organizationAccessDenied':
    'You do not belong to this organization',
  'errors.billing.organizationAdminRequired':
    'Organization admin access is required',
  'errors.billing.organizationRequired': 'Organization ID is required',
  'errors.billing.portalUrlMissing':
    'Portal URL was not returned by the billing provider',
  'errors.billing.returnUrlRequired': 'Return URL is required',
  'errors.billing.subscriptionPriceRequired':
    'Subscription price ID is required',
  'errors.billing.successUrlRequired': 'Success URL is required',
  'errors.billing.topUpAmountOutOfRange': 'Top-up amount is out of range',
  'errors.billing.usageReasonRequired': 'Usage reason is required',
  'errors.callable.createPaymentIntentFailed':
    'Failed to create payment intent',
  'errors.callable.createBillingPortalSessionFailed':
    'Failed to create billing portal session',
  'errors.callable.createCheckoutSessionFailed':
    'Failed to create checkout session',
  'errors.callable.deletePaymentMethodFailed':
    'Failed to delete payment method',
  'errors.callable.getBillingOverviewFailed': 'Failed to get billing overview',
  'errors.callable.getBillingPlansFailed': 'Failed to get billing plans',
  'errors.callable.getUserFailed': 'Failed to get user',
  'errors.callable.invalidDataReceived': 'Invalid response data received',
  'errors.callable.paymentMethodNotFound': 'Payment method not found',
  'errors.callable.paymentMethodRequiredForSubscription':
    'A saved payment method is required to start this subscription',
  'errors.callable.recordUsageFailed': 'Failed to record usage',
  'errors.callable.updateUserSettingsFailed': 'Failed to update user settings',
  'errors.callable.upsertSubscriptionFailed': 'Failed to update subscription',
  'errors.callable.userNotFound': 'User not found',
  'errors.network.generic': 'Network error. Please try again.',
  'errors.unknown': 'An unknown error occurred. Please try again.',
  'errors.validation.failed': 'Validation failed',
  'success.billing.checkoutSessionCreated': 'Checkout session created',
  'success.billing.portalSessionCreated': 'Billing portal session created',
  'success.billing.subscriptionPlansListed': 'Billing plans listed',
  'success.billing.summaryRetrieved': 'Billing summary retrieved',
  'success.common.ok': 'ok',
  'validation.payment.priceId.required': 'Price ID is required',
  'validation.username.minLength':
    'Username must be at least {usernameMinLength} characters long',
} as const satisfies Record<string, string>;
