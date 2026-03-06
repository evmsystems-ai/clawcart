/**
 * Target URL helper
 * 
 * Provides URL building utilities for Target.
 * Target uses TCIN (Target.com Item Number) for product identification.
 */

import { RetailerUrlHelper } from './base';

export class TargetUrls extends RetailerUrlHelper {
  readonly name = 'target';
  readonly displayName = 'Target';
  
  private readonly baseUrl = 'https://www.target.com';

  getHomeUrl(): string {
    return this.baseUrl;
  }

  getCartUrl(): string {
    return `${this.baseUrl}/cart`;
  }

  getProductUrl(tcin: string): string {
    // Normalize TCIN (numeric, typically 8-9 digits)
    const normalizedTcin = this.normalizeTcin(tcin);
    return `${this.baseUrl}/p/-/A-${normalizedTcin}`;
  }

  getSearchUrl(query: string): string {
    return this.buildUrl(`${this.baseUrl}/s`, {
      searchTerm: this.encodeQuery(query),
    });
  }

  /**
   * Build Target's "co-cart" URL for adding items
   * Format: https://www.target.com/co-cart?items={tcin}|{qty},{tcin}|{qty}
   */
  getAddToCartUrl(items: Array<{ tcin: string; quantity?: number }>): string {
    const itemStrings = items.map(item => {
      const tcin = this.normalizeTcin(item.tcin);
      const qty = item.quantity ?? 1;
      return `${tcin}|${qty}`;
    });

    return `${this.baseUrl}/co-cart?items=${itemStrings.join(',')}`;
  }

  /**
   * Extract TCIN from product URL or validate raw TCIN
   */
  private normalizeTcin(input: string): string {
    // Already a clean TCIN (numeric string)
    if (/^\d{6,10}$/.test(input)) {
      return input;
    }

    // Try to extract from URL patterns
    const patterns = [
      /\/A-(\d{6,10})/i,           // /A-12345678
      /[?&]tcin=(\d{6,10})/i,      // ?tcin=12345678
      /\/p\/[^/]+\/-\/A-(\d{6,10})/i, // /p/product-name/-/A-12345678
    ];

    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) {
        return match[1];
      }
    }

    // Return as-is (may not be valid)
    return input.replace(/\D/g, '');
  }
}
