// backend/src/utils/validate.ts
import { badRequest } from "./errors.js";
import type { EventType } from "../models/eventModel.js";

export function requireString(
  value: unknown,
  field: string
): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw badRequest(`Field "${field}" must be a non-empty string`);
  }
  return value.trim();
}

export function optionalString(
  value: unknown,
  field: string
): string | null {
  if (value == null) return null;
  if (typeof value !== "string") {
    throw badRequest(`Field "${field}" must be a string or null`);
  }
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function requireNumber(
  value: unknown,
  field: string
): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw badRequest(`Field "${field}" must be a valid number`);
  }
  return value;
}

export function requirePositiveInt(
  value: unknown,
  field: string
): number {
  const n = requireNumber(value, field);
  if (!Number.isInteger(n) || n <= 0) {
    throw badRequest(`Field "${field}" must be a positive integer`);
  }
  return n;
}

export function requireEnum<T extends string>(
  value: unknown,
  field: string,
  allowed: readonly T[]
): T {
  if (typeof value !== "string") {
    throw badRequest(
      `Field "${field}" must be one of: ${allowed.join(", ")}`
    );
  }
  if (!allowed.includes(value as T)) {
    throw badRequest(
      `Field "${field}" must be one of: ${allowed.join(", ")}`
    );
  }
  return value as T;
}

const ALLOWED_EVENT_TYPES: EventType[] = ["view", "click", "add_to_cart"];

export interface RawEventPayload {
  sessionId?: unknown;
  productId?: unknown;
  eventType?: unknown;
  userId?: unknown;
  metadata?: unknown;
}

export interface ValidEventPayload {
  sessionId: string;
  productId: number;
  eventType: EventType;
  userId: string | null;
  metadata: Record<string, unknown> | null;
}

export function validateEventPayload(
  body: unknown
): ValidEventPayload {
  if (body == null || typeof body !== "object") {
    throw badRequest("Request body must be a JSON object");
  }

  const raw = body as RawEventPayload;

  const sessionId = requireString(raw.sessionId, "sessionId");
  const productId = requirePositiveInt(raw.productId, "productId");
  const eventType = requireEnum<EventType>(
    raw.eventType,
    "eventType",
    ALLOWED_EVENT_TYPES
  );

  const userId = optionalString(raw.userId, "userId");

  let metadata: Record<string, unknown> | null = null;
  if (raw.metadata != null) {
    if (typeof raw.metadata !== "object" || Array.isArray(raw.metadata)) {
      throw badRequest('Field "metadata" must be an object if provided');
    }
    metadata = raw.metadata as Record<string, unknown>;
  }

  return {
    sessionId,
    productId,
    eventType,
    userId,
    metadata,
  };
}
