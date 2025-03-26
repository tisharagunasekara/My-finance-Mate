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
