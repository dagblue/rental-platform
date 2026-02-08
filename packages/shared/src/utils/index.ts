export * from './formatters';
export * from './validators';
export * from './calculators';
export * from './constants';
export * from './ethiopian.utils';

// packages/shared/src/utils/formatters.ts
import { format } from 'date-fns';

export const formatCurrency = (amount: number, currency: 'ETB' | 'USD' = 'ETB'): string => {
  if (currency === 'ETB') {
    // Ethiopian formatting: ETB 1,234.56
    return `ETB ${amount.toLocaleString('en-ET', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatPhoneNumber = (phone: string): string => {
  // Convert +251911223344 to +251 91 122 3344
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('251') && cleaned.length === 12) {
    const part1 = cleaned.substring(3, 5); // 91
    const part2 = cleaned.substring(5, 8); // 122
    const part3 = cleaned.substring(8, 12); // 3344
    return `+251 ${part1} ${part2} ${part3}`;
  }
  
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    const part1 = cleaned.substring(1, 3); // 91
    const part2 = cleaned.substring(3, 6); // 122
    const part3 = cleaned.substring(6, 10); // 3344
    return `+251 ${part1} ${part2} ${part3}`;
  }
  
  return phone;
};

export const formatDate = (date: Date | string, formatStr: string = 'PPP'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, formatStr);
};

export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'PPpp');
};

export const formatRelativeTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return format(d, 'PP');
};

export const truncateText = (text: string, maxLength: number, addEllipsis: boolean = true): string => {
  if (text.length <= maxLength) return text;
  return addEllipsis ? `${text.substring(0, maxLength)}...` : text.substring(0, maxLength);
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
};

export const generateBookingCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous characters
  let code = 'BOOK-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const generatePaymentReference = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PAY-${timestamp}-${random}`;
};

export const generateVerificationCode = (length: number = 6): string => {
  const chars = '0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};