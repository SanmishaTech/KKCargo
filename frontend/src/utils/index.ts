/**
 * Format a date string to a readable format
 * @param dateString The date string to format
 * @returns Formatted date string
 */
export const formattedDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    // Format as "DD Month, YYYY (hh:mm AM/PM)"
    const d = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
    const t = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${d}, ${date.getFullYear()} (${t})`;
  } catch {
    return dateString || '-';
  }
};

/**
 * Format currency value with Indian Rupee symbol
 * @param value Numeric value to format
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return '₹0.00';
  }
  
  return `₹${numValue.toFixed(2)}`;
};

/**
 * Check if a value is empty (null, undefined, empty string, empty array, or empty object)
 * @param value Value to check
 * @returns Boolean indicating if value is empty
 */
export const isEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) {
    return true;
  }
  
  if (typeof value === 'string' && value.trim() === '') {
    return true;
  }
  
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }
  
  if (
    typeof value === 'object' && 
    value !== null && 
    !Array.isArray(value) && 
    Object.keys(value).length === 0
  ) {
    return true;
  }
  
  return false;
}; 