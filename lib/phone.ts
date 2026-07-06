export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

/** Formats a stored digits-only phone (10 or 11 digits, DDD included) for display. */
export function formatPhone(value: string) {
  const digits = digitsOnly(value);
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return value;
}
