/**
 * Format price as currency
 * @param price - The price value (can be number, null, or undefined)
 * @param pricingType - Optional pricing type (not currently used but kept for future use)
 * @returns Formatted currency string or 'N/A' if price is invalid
 */
export function formatPrice(
  price: number | null | undefined,
  pricingType?: string | null
): string {
  if (price === null || price === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

/**
 * Format date string to readable format
 * @param dateString - Date string to format (can be string, null, or undefined)
 * @returns Formatted date string or 'N/A' if date is invalid
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'N/A';
  }
}

