import validator from 'validator';

export const isValidEthiopianPhone = (phone: string): boolean => {
  // Accepts: +251911223344, 0911223344, 911223344
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('251') && cleaned.length === 12) {
    return /^2519[0-9]{8}$/.test(cleaned);
  }
  
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return /^09[0-9]{8}$/.test(cleaned);
  }
  
  if (cleaned.length === 9) {
    return /^9[0-9]{8}$/.test(cleaned);
  }
  
  return false;
};

export const isValidEmail = (email: string): boolean => {
  return validator.isEmail(email);
};

export const isValidEthiopianID = (id: string): boolean => {
  // Basic Ethiopian ID validation (Kebele ID format)
  // This is a simplified version - adjust based on actual ID formats
  return /^[A-Za-z0-9]{6,20}$/.test(id);
};

export const isValidPassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const isValidLocation = (lat: number, lng: number): boolean => {
  // Ethiopia coordinates bounds
  const minLat = 3.4; // Southernmost
  const maxLat = 14.9; // Northernmost
  const minLng = 33.0; // Westernmost
  const maxLng = 48.0; // Easternmost
  
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
};

export const validatePrice = (price: number, currency: 'ETB' | 'USD'): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (price <= 0) {
    errors.push('Price must be greater than 0');
  }
  
  if (currency === 'ETB' && price > 1000000) {
    errors.push('Price is too high for Ethiopian Birr');
  }
  
  if (currency === 'USD' && price > 50000) {
    errors.push('Price is too high for USD');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateDates = (startDate: Date, endDate: Date): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  const now = new Date();
  
  if (startDate < now) {
    errors.push('Start date cannot be in the past');
  }
  
  if (endDate <= startDate) {
    errors.push('End date must be after start date');
  }
  
  const maxRentalDays = 365; // 1 year maximum
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
  
  if (daysDiff > maxRentalDays) {
    errors.push(`Maximum rental period is ${maxRentalDays} days`);
  }
  
  if (daysDiff < 1) {
    errors.push('Minimum rental period is 1 day');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};