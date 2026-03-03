/**
 * Amazon URL helper
 * 
 * Provides URL building utilities for Amazon.
 * Actual cart sharing is done via Share a Cart browser extension.
 */

import { RetailerUrlHelper } from './base';

export class AmazonUrls extends RetailerUrlHelper {
  readonly name = 'amazon';
  readonly displayName = 'Amazon';
  
  private readonly baseUrl = 'https://www.amazon.com';

  getHomeUrl(): string {
    return this.baseUrl;
  }

  getCartUrl(): string {
    return `${this.baseUrl}/cart`;
  }

  getProductUrl(asin: string): string {
    // Normalize ASIN (10 alphanumeric chars)
    const normalizedAsin = this.normalizeAsin(asin);
    return `${this.baseUrl}/dp/${normalizedAsin}`;
  }

  getSearchUrl(query: string): string {
    return this.buildUrl(`${this.baseUrl}/s`, {
      k: this.encodeQuery(query),
    });
  }

  /**
   * Build Amazon's direct "Add to Cart" URL
   * Useful for automation: navigate to this URL to add items
   */
  getAddToCartUrl(items: Array<{ asin: string; quantity?: number }>): string {
    const params: Record<string, string | number> = {};
    
    items.forEach((item, index) => {
      const num = index + 1;
      params[`ASIN.${num}`] = this.normalizeAsin(item.asin);
      params[`Quantity.${num}`] = item.quantity ?? 1;
    });

    return this.buildUrl(`${this.baseUrl}/gp/aws/cart/add.html`, params);
  }

  /**
   * Extract ASIN from product URL or validate raw ASIN
   */
  private normalizeAsin(input: string): string {
    // Already a clean ASIN
    if (/^[A-Z0-9]{10}$/i.test(input)) {
      return input.toUpperCase();
    }

    // Try to extract from URL
    const patterns = [
      /\/dp\/([A-Z0-9]{10})/i,
      /\/gp\/product\/([A-Z0-9]{10})/i,
      /\?.*asin=([A-Z0-9]{10})/i,
    ];

    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) {
        return match[1].toUpperCase();
      }
    }

    // Return as-is (may not be valid)
    return input.toUpperCase();
  }
}
