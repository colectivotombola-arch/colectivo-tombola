/**
 * Safe number conversion utilities for form handling
 * These helpers convert string values to numbers ONLY when saving to API
 * During editing, values should remain as strings to prevent NaN/reset issues
 */

/**
 * Safely converts a string or number to a float
 * Use ONLY when saving data to the API, not in onChange handlers
 */
export const toFloat = (value: string | number | null | undefined, fallback: number = 0): number => {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  
  const parsed = typeof value === 'number' ? value : parseFloat(value);
  
  if (isNaN(parsed)) {
    return fallback;
  }
  
  return parsed;
};

/**
 * Safely converts a string or number to an integer
 * Use ONLY when saving data to the API, not in onChange handlers
 */
export const toInt = (value: string | number | null | undefined, fallback: number = 0): number => {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  
  const parsed = typeof value === 'number' ? Math.floor(value) : parseInt(value, 10);
  
  if (isNaN(parsed)) {
    return fallback;
  }
  
  return parsed;
};

/**
 * Format a number or string for display with fixed decimals
 */
export const formatPrice = (value: string | number | null | undefined, decimals: number = 2): string => {
  const num = toFloat(value, 0);
  return num.toFixed(decimals);
};

/**
 * Normalize WhatsApp number with country code
 */
export const normalizeWhatsApp = (phone: string, defaultCountryCode: string = '+593'): string => {
  if (!phone) return '';
  
  let normalized = phone.trim();
  
  // If it already starts with +, return as is
  if (normalized.startsWith('+')) {
    return normalized;
  }
  
  // Remove leading 0 if present
  if (normalized.startsWith('0')) {
    normalized = normalized.substring(1);
  }
  
  // Add country code
  return `${defaultCountryCode}${normalized}`;
};
