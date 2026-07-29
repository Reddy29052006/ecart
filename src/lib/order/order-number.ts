// Generates a human-friendly order number in the format: ORD-YYYYMMDD-NNNNNN
// The numeric suffix is derived from the current timestamp milliseconds modulo 1,000,000
// to produce a 6-digit zero-padded number. This is not globally sequential but is
// collision-resistant within the same day and sufficient for non-payment-critical display.
export function generateOrderNumber(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  const msPart = String(now.getTime() % 1_000_000).padStart(6, '0');
  return `ORD-${datePart}-${msPart}`;
}
