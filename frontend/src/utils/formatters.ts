/**
 * Format a number as USD currency
 * @param value - The numeric value to format
 * @returns Formatted currency string (e.g. $123.45)
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

/**
 * Format a date string for Sri Lankan timezone
 * @returns Date string in YYYY-MM-DD format
 */
export const getSriLankaDate = (): string => {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Colombo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  
  const dateFormatter = new Intl.DateTimeFormat('en-LK', options);
  const parts = dateFormatter.formatToParts(new Date());
  
  const year = parts.find(part => part.type === 'year')?.value;
  const month = parts.find(part => part.type === 'month')?.value;
  const day = parts.find(part => part.type === 'day')?.value;
  
  return `${year}-${month}-${day}`;
};

/**
 * Validate and format a date string
 * @param dateString - The date string to validate
 * @param minDate - Optional minimum allowed date
 * @param maxDate - Optional maximum allowed date
 * @returns Object containing validity and formatted date
 */
export const validateDate = (
  dateString: string, 
  minDate?: Date, 
  maxDate?: Date
): { isValid: boolean; formattedDate: string; errorMessage?: string } => {
  try {
    // Try to parse the date
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return { 
        isValid: false, 
        formattedDate: '', 
        errorMessage: 'Invalid date format'
      };
    }
    
    // Check min date if provided
    if (minDate && date < minDate) {
      return { 
        isValid: false, 
        formattedDate: date.toISOString().split('T')[0],
        errorMessage: 'Date cannot be earlier than the minimum allowed date'
      };
    }
    
    // Check max date if provided
    if (maxDate && date > maxDate) {
      return { 
        isValid: false, 
        formattedDate: date.toISOString().split('T')[0],
        errorMessage: 'Date cannot be later than the maximum allowed date'
      };
    }
    
    // Format the date as YYYY-MM-DD
    const formattedDate = date.toISOString().split('T')[0];
    
    return { isValid: true, formattedDate };
  } catch (error) {
    return { 
      isValid: false, 
      formattedDate: '', 
      errorMessage: 'Failed to process date'
    };
  }
};

/**
 * Formats a number with specified decimal places and adds thousands separators
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string
 */
export const formatNumber = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};
