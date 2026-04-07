/**
 * Message export helpers.
 */
import { commonMessages } from './messages.js';

export type CommonMessageValues = Record<
  string,
  string | number | boolean | null | undefined
>;
export type CommonMessages = Record<string, string>;

const messageCatalog: CommonMessages = commonMessages;

/**
 * Returns whether the English message catalog includes the provided key.
 */
export function hasCommonMessage(key: string): boolean {
  return Object.prototype.hasOwnProperty.call(messageCatalog, key);
}

/**
 * Resolves a message key from the English message catalog.
 */
export function resolveCommonMessage(key: string): string | undefined {
  return messageCatalog[key];
}

/**
 * Resolves and formats an English message template.
 * If the key is unknown, returns the input string unchanged.
 */
export function translateCommonMessage(
  keyOrMessage: string,
  values?: CommonMessageValues
): string {
  const template = resolveCommonMessage(keyOrMessage) ?? keyOrMessage;
  return formatMessageTemplate(template, values);
}

/**
 * Returns the full English message map used at runtime.
 */
export function getCommonMessages(): Readonly<CommonMessages> {
  return messageCatalog;
}

function formatMessageTemplate(
  template: string,
  values?: CommonMessageValues
): string {
  if (!values) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (fullMatch, variableName: string) => {
    const value = values[variableName];
    return value === undefined || value === null ? fullMatch : String(value);
  });
}
