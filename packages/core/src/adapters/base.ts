/**
 * Base class for retailer URL helpers
 * 
 * These are NOT adapters for scraping - they just provide URL building utilities.
 * Actual cart sharing is done via the Share a Cart browser extension.
 */

import type { RetailerUrls } from '../types';

export abstract class RetailerUrlHelper implements RetailerUrls {
  abstract readonly name: string;
  abstract readonly displayName: string;

  abstract getHomeUrl(): string;
  abstract getCartUrl(): string;
  abstract getProductUrl(productId: string): string;
  abstract getSearchUrl(query: string): string;

  /**
   * Helper: Build URL with query params
   */
  protected buildUrl(base: string, params: Record<string, string | number>): string {
    const url = new URL(base);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }
    return url.toString();
  }

  /**
   * Helper: Normalize search query (trim only, URL encoding is handled by buildUrl)
   */
  protected encodeQuery(query: string): string {
    return query.trim();
  }
}
