import { ethiopianPhoneSchema, ethiopianAddressSchema } from '../schemas/ethiopian.schemas';

/**
 * Validate Ethiopian phone number (simple version)
 */
export function validateEthiopianPhone(phone: string): { isValid: boolean; normalized?: string; error?: string } {
  try {
    const result = ethiopianPhoneSchema.parse(phone);
    return { 
      isValid: true, 
      normalized: result.formatted 
    };
  } catch (error: any) {
    return {
      isValid: false,
      error: error.errors?.[0]?.message || 'Invalid phone number'
    };
  }
}

/**
 * Validate Ethiopian ID number (basic format check)
 */
export function validateEthiopianId(idNumber: string): { isValid: boolean; error?: string } {
  // Basic Ethiopian ID validation (10 digits)
  if (!/^\d{10}$/.test(idNumber)) {
    return {
      isValid: false,
      error: 'Ethiopian ID must be exactly 10 digits'
    };
  }

  // Add more sophisticated validation here if needed
  // (e.g., checksum validation, regional codes, etc.)
  
  return { isValid: true };
}

/**
 * Format Ethiopian currency
 */
export function formatEthiopianCurrency(amount: number): string {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 2
  }).format(amount);
}

/**
 * Validate Ethiopian business hours
 */
export function validateBusinessHours(hours: {
  opensAt: string;
  closesAt: string;
  lunchStart?: string;
  lunchEnd?: string;
}): { isValid: boolean; error?: string } {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  
  if (!timeRegex.test(hours.opensAt) || !timeRegex.test(hours.closesAt)) {
    return {
      isValid: false,
      error: 'Invalid time format. Use HH:MM (24-hour format)'
    };
  }

  // Validate lunch hours if provided
  if (hours.lunchStart && hours.lunchEnd) {
    if (!timeRegex.test(hours.lunchStart) || !timeRegex.test(hours.lunchEnd)) {
      return {
        isValid: false,
        error: 'Invalid lunch time format. Use HH:MM'
      };
    }
  }

  return { isValid: true };
}
