export function formatPhoneNumber(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }

  if (cleaned.length > 10 && !cleaned.startsWith('+')) {
    return `+${cleaned}`;
  }

  return cleaned;
}
