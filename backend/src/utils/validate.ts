// backend/src/utils/validate.ts
export type EventType = "product_view" | "product_click" | "add_to_cart";

export interface SanitizedEventPayload {
  sessionId: string;
  productId: number;
  eventType: EventType;
  userId?: string | null;
}

/**
 * Enklare helper för att kolla tomma strängar/null/undefined.
 */
function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Tillåtna event-typer i systemet.
 */
const ALLOWED_EVENT_TYPES: EventType[] = [
  "product_view",
  "product_click",
  "add_to_cart",
];

/**
 * Säkerställ att eventType är en av de tillåtna typerna.
 */
function normalizeEventType(value: unknown): EventType {
  if (!isNonEmptyString(value)) {
    throw new Error("eventType is required and must be a non-empty string");
  }

  const lower = value.toLowerCase() as EventType;
  if (!ALLOWED_EVENT_TYPES.includes(lower)) {
    throw new Error(
      `eventType must be one of: ${ALLOWED_EVENT_TYPES.join(", ")}`
    );
  }

  return lower;
}

/**
 * Försök parsa ett produkt-id till ett positivt heltal.
 */
function normalizeProductId(value: unknown): number {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
  }

  throw new Error("productId must be a positive integer");
}

/**
 * Sanerar och validerar inkommande event-payload från req.body.
 *
 * - Säkerställer att sessionId är en icke-tom sträng
 * - Säkerställer att productId är ett positivt heltal
 * - Säkerställer att eventType är en tillåten typ
 * - userId är valfri, men om den skickas måste den vara en icke-tom sträng
 */
export function sanitizeEventPayload(body: unknown): SanitizedEventPayload {
  if (body === null || typeof body !== "object") {
    throw new Error("Body must be a JSON object");
  }

  const raw = body as Record<string, unknown>;

  const sessionIdRaw = raw.sessionId ?? raw.session_id;
  if (!isNonEmptyString(sessionIdRaw)) {
    throw new Error("sessionId is required and must be a non-empty string");
  }
  const sessionId = sessionIdRaw.trim();

  const productId = normalizeProductId(raw.productId ?? raw.product_id);

  const eventType = normalizeEventType(raw.eventType ?? raw.event_type);

  let userId: string | null | undefined;
  if (raw.userId ?? raw.user_id) {
    if (!isNonEmptyString(raw.userId ?? raw.user_id)) {
      throw new Error("userId must be a non-empty string if provided");
    }
    userId = String(raw.userId ?? raw.user_id).trim();
  }

  return {
    sessionId,
    productId,
    eventType,
    userId,
  };
}
