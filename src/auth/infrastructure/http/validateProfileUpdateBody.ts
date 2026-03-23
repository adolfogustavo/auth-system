import { DomainError } from '../../../shared/domain/DomainError';

const allowedProfileFieldNames = ['name', 'lastName', 'phone'] as const;
type ProfileFieldName = (typeof allowedProfileFieldNames)[number];
const allowedProfileKeys = new Set<string>(allowedProfileFieldNames);

export interface ProfileUpdateBodyPayload {
  name?: string;
  lastName?: string;
  phone?: string;
}

export function validateProfileUpdateBody(body: unknown): ProfileUpdateBodyPayload {
  const record = toPlainObjectRecordOrThrow(body);
  const keys = Object.keys(record);
  assertHasNoUnexpectedKeys(keys);
  assertIncludesAtLeastOneProfileField(keys);
  return extractProfilePayload(record);
}

function toPlainObjectRecordOrThrow(body: unknown): Record<string, unknown> {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw DomainError.createValidation('Invalid request body');
  }
  return body as Record<string, unknown>;
}

function assertHasNoUnexpectedKeys(keys: string[]): void {
  const unexpectedKeys = keys.filter((key) => !allowedProfileKeys.has(key));
  if (unexpectedKeys.length === 0) {
    return;
  }
  const sortedUnexpected = [...unexpectedKeys].sort();
  throw DomainError.createValidation(`Unexpected fields: ${sortedUnexpected.join(', ')}`);
}

function assertIncludesAtLeastOneProfileField(keys: string[]): void {
  const includesProfileField = keys.some((key) => allowedProfileKeys.has(key));
  if (!includesProfileField) {
    throw DomainError.createValidation('At least one of name, lastName, or phone is required');
  }
}

function extractProfilePayload(record: Record<string, unknown>): ProfileUpdateBodyPayload {
  const payload: Partial<Record<ProfileFieldName, string>> = {};
  for (const fieldName of allowedProfileFieldNames) {
    if (!(fieldName in record)) {
      continue;
    }
    const value = record[fieldName];
    if (typeof value !== 'string') {
      throw DomainError.createValidation(`Invalid value for ${fieldName}`);
    }
    payload[fieldName] = value;
  }
  return payload as ProfileUpdateBodyPayload;
}
