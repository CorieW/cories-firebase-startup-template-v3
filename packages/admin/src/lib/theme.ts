/**
 * Theme state and document helpers for the admin app.
 */
export type ThemeMode = 'light' | 'dark' | 'system';

export const THEME_STORAGE_KEY = 'theme';
export const THEME_INIT_SCRIPT = `(function(){var root=document.documentElement;var parse=function(value){return value==='light'||value==='dark'||value==='system'?value:null;};var fromPreference=parse(root.getAttribute('data-theme-preference'));var fromResolved=(root.getAttribute('data-theme')==='light'||root.getAttribute('data-theme')==='dark')?root.getAttribute('data-theme'):null;var fromClass=root.classList.contains('light')?'light':(root.classList.contains('dark')?'dark':null);var fromStorage=null;try{fromStorage=parse(window.localStorage.getItem('theme'));}catch(e){fromStorage=null;}var pref=fromPreference||fromResolved||fromClass||fromStorage||'system';var systemDark=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;var mode=pref==='system'?(systemDark?'dark':'light'):pref;root.classList.remove('light','dark');root.classList.add(mode);root.setAttribute('data-theme',mode);root.setAttribute('data-theme-preference',pref);root.style.colorScheme=mode;})();`;

