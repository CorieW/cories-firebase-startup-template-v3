/**
 * Shared document-level loading overlay used while app shells finish bootstrapping.
 */
import { useEffect } from 'react';

declare global {
  interface Window {
    __dismissSharedPageLoader?: () => void;
  }
}

const sharedPageLoaderId = 'shared-page-loader';
const sharedPageLoaderReadyState = 'ready';
const sharedPageLoaderRemovalDelayMs = 360;

const sharedPageLoaderStyles = `
#${sharedPageLoaderId} {
  position: fixed;
  inset: 0;
  z-index: 2147483646;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background:
    radial-gradient(circle at top, color-mix(in srgb, var(--primary, #c7a03b) 10%, transparent), transparent 48%),
    color-mix(in srgb, var(--bg, #f4f0e8) 88%, transparent);
  backdrop-filter: blur(14px);
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transition:
    opacity 320ms ease,
    visibility 320ms ease;
}

#${sharedPageLoaderId}[data-state="${sharedPageLoaderReadyState}"] {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

#${sharedPageLoaderId}__spinner {
  height: 54px;
  width: 54px;
  border: 4px solid color-mix(in srgb, var(--line, #ece4d9) 84%, transparent);
  border-top-color: var(--primary, #c7a03b);
  border-radius: 999px;
  transition:
    opacity 320ms ease,
    transform 320ms ease;
  animation: shared-page-loader-spin 900ms linear infinite;
}

#${sharedPageLoaderId}[data-state="${sharedPageLoaderReadyState}"] #${sharedPageLoaderId}__spinner {
  opacity: 0;
  transform: translateY(10px) scale(0.985);
}

@keyframes shared-page-loader-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  #${sharedPageLoaderId},
  #${sharedPageLoaderId}__spinner {
    transition: none;
  }

  #${sharedPageLoaderId}__spinner {
    animation: none;
  }
}
`;

const sharedPageLoaderScript = `
(() => {
  const overlayId = "${sharedPageLoaderId}";
  const readyState = "${sharedPageLoaderReadyState}";
  const removalDelayMs = ${sharedPageLoaderRemovalDelayMs};

  function dismissSharedPageLoader() {
    const overlay = document.getElementById(overlayId);
    if (!overlay || overlay.dataset.state === readyState) {
      return;
    }

    overlay.dataset.state = readyState;

    window.setTimeout(() => {
      overlay.remove();
    }, removalDelayMs);
  }

  window.__dismissSharedPageLoader = dismissSharedPageLoader;
})();
`;

const sharedPageLoaderNoScriptStyles = `
#${sharedPageLoaderId} {
  display: none !important;
}
`;

/**
 * Renders the shared head assets that power the loading overlay animation.
 */
export function SharedPageLoaderHead() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: sharedPageLoaderStyles }} />
      <script dangerouslySetInnerHTML={{ __html: sharedPageLoaderScript }} />
      <noscript>
        <style>{sharedPageLoaderNoScriptStyles}</style>
      </noscript>
    </>
  );
}

/**
 * Renders the shared loading overlay before the app shell dismisses it.
 */
export function SharedPageLoader() {
  return (
    <div
      id={sharedPageLoaderId}
      aria-busy='true'
      aria-label='Loading page'
      aria-live='polite'
      data-state='pending'
      role='status'
    >
      <div id={`${sharedPageLoaderId}__spinner`} />
    </div>
  );
}

/**
 * Dismisses the shared page loader once the caller decides the shell is ready.
 */
export function useSharedPageLoaderDismiss(isReady: boolean) {
  useEffect(() => {
    if (!isReady || typeof window === 'undefined') {
      return;
    }

    window.__dismissSharedPageLoader?.();
  }, [isReady]);
}
