export function normalizePhone(input: string): string[] {
  const cleaned = input.replace(/\s+/g, '');
  const local = cleaned.startsWith('+250') ? '0' + cleaned.slice(4) : cleaned;
  const international = cleaned.startsWith('0') ? '+250' + cleaned.slice(1) : cleaned;
  return [local, international];
}
