/**
 * Firestore value serialization helpers for admin route loaders.
 */
import { Timestamp } from 'firebase-admin/firestore';

export type SerializedFirestoreValue =
  | boolean
  | number
  | string
  | null
  | SerializedFirestoreValue[]
  | SerializedFirestoreRecord;

export interface SerializedFirestoreRecord {
  [key: string]: SerializedFirestoreValue;
}

/**
 * Converts common Firestore timestamp shapes into ISO strings.
 */
export function toIsoString(value: unknown): string | null {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'string') {
    return value;
  }

  return null;
}

/**
 * Recursively serializes Firestore-friendly values into plain JSON data.
 */
export function serializeFirestoreValue(
  value: unknown
): SerializedFirestoreValue {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value === null) {
    return null;
  }

  if (
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    typeof value === 'string'
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(entry => serializeFirestoreValue(entry));
  }

  if (typeof value !== 'object') {
    return null;
  }

  if ('path' in value && typeof value.path === 'string') {
    return value.path;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      serializeFirestoreValue(entry),
    ])
  );
}

/**
 * Serializes an unknown Firestore document into a plain object.
 */
export function serializeFirestoreRecord(
  value: Record<string, unknown> | null | undefined
): SerializedFirestoreRecord | null {
  if (!value) {
    return null;
  }

  return serializeFirestoreValue(value) as SerializedFirestoreRecord;
}
