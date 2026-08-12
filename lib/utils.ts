/**
 * Format amount as Nigerian Naira currency
 * @param amount Amount in Naira
 * @returns Formatted string with Naira symbol
 */
export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

/**
 * Discount % from regular price → sale price.
 * Returns 0 if sale is missing or not actually cheaper.
 */
export function calcDiscountPercentage(
  price: number,
  salePrice: number | null | undefined,
): number {
  if (
    salePrice == null ||
    !Number.isFinite(price) ||
    !Number.isFinite(salePrice) ||
    price <= 0 ||
    salePrice <= 0 ||
    salePrice >= price
  ) {
    return 0;
  }
  return Math.round(((price - salePrice) / price) * 100);
}

/**
 * Convert Naira to Kobo (Paystack uses kobo)
 * 1 Naira = 100 Kobo
 * @param naira Amount in Naira
 * @returns Amount in Kobo
 */
export function convertToKobo(naira: number): number {
  return naira * 100;
}

/**
 * Convert Kobo to Naira
 * @param kobo Amount in Kobo
 * @returns Amount in Naira
 */
export function convertFromKobo(kobo: number): number {
  return kobo / 100;
}

export function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

/**
 * Generate a slug from a string (e.g. product title)
 */
export function generateSlug(text: string): string {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")           // Replace spaces with -
    .replace(/[^\w\-]+/g, "")       // Remove all non-word chars
    .replace(/\-\-+/g, "-")         // Replace multiple - with single -
    .replace(/^-+/, "")             // Trim - from start of text
    .replace(/-+$/, "");            // Trim - from end of text
}
