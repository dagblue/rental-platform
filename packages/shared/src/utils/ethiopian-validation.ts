/**
 * Normalize Ethiopian phone number to standard format (+251XXXXXXXXX)
 */
export function normalizeEthiopianPhone(phone: string): string {
  // Remove all spaces and special characters
  let cleaned = phone.replace(/\s+/g, '').replace(/-/g, '');
  
  // If starts with 0, replace with +251
  if (cleaned.startsWith('0')) {
    return '+251' + cleaned.slice(1);
  }
  
  // If starts with 9 (no country code), add +251
  if (cleaned.startsWith('9') && cleaned.length === 9) {
    return '+251' + cleaned;
  }
  
  // If starts with +251 but has spaces or format issues, clean it
  if (cleaned.startsWith('+251')) {
    return cleaned;
  }
  
  // If no prefix, assume it's a local number
  if (/^\d{9}$/.test(cleaned)) {
    return '+251' + cleaned;
  }
  
  return cleaned;
}

/**
 * Validate Ethiopian phone number
 */
export function isValidEthiopianPhone(phone: string): boolean {
  const normalized = normalizeEthiopianPhone(phone);
  const regex = /^\+251[0-9]{9}$/;
  return regex.test(normalized);
}

/**
 * Check if input is an email
 */
export function isEmail(input: string): boolean {
  const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
  return emailRegex.test(input);
}

/**
 * Validate Ethiopian phone or email
 */
export function isValidIdentifier(identifier: string): { isValid: boolean; type: 'phone' | 'email' | 'invalid' } {
  if (isEmail(identifier)) {
    return { isValid: true, type: 'email' };
  }
  if (isValidEthiopianPhone(identifier)) {
    return { isValid: true, type: 'phone' };
  }
  return { isValid: false, type: 'invalid' };
}
