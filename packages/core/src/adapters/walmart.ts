/**
 * Walmart URL helper
 *
 * Provides URL building utilities for Walmart.
 * Actual cart sharing is done via Share a Cart browser extension.
 */

import { RetailerUrlHelper } from './base';

export class WalmartUrls extends RetailerUrlHelper {
  readonly name = 'walmart';
  readonly displayName = 'Walmart';

  private readonly baseUrl = 'https://www.walmart.com';

  getHomeUrl(): string {
    return this.baseUrl;
  }

  getCartUrl(): string {
    return `${this.baseUrl}/cart`;
  }

  getProductUrl(productId: string): string {
    // Walmart product URLs use /ip/{slug}/{productId} or /ip/{productId}
    const normalizedId = this.normalizeProductId(productId);
    return `${this.baseUrl}/ip/${normalizedId}`;
  }

  getSearchUrl(query: string): string {
    return this.buildUrl(`${this.baseUrl}/search`, {
      q: this.encodeQuery(query),
    });
  }

  /**
   * Build Walmart's direct "Add to Cart" URL
   * Format: https://www.walmart.com/cart?action=AddToCart&items={productId},{qty}
   * Multiple items: items={id1},{qty1};{id2},{qty2}
   */
  getAddToCartUrl(items: Array<{ productId: string; quantity?: number }>): string {
    const itemsParam = items
      .map((item) => {
        const id = this.normalizeProductId(item.productId);
        const qty = item.quantity ?? 1;
        return `${id},${qty}`;
      })
      .join(';');

    return this.buildUrl(`${this.baseUrl}/cart`, {
      action: 'AddToCart',
      items: itemsParam,
    });
  }

  /**
   * Extract product ID from Walmart URL or validate raw ID
   * Walmart product IDs are typically numeric (e.g., 123456789)
   */
  private normalizeProductId(input: string): string {
    // Already a clean numeric ID
    if (/^\d+$/.test(input)) {
      return input;
    }

    // Try to extract from URL patterns
    const patterns = [
      /\/ip\/[^/]+\/(\d+)/, // /ip/{slug}/{productId}
      /\/ip\/(\d+)/, // /ip/{productId}
      /[?&](?:item|product)=(\d+)/i, // Query param
    ];

    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) {
        return match[1];
      }
    }

    // Return as-is (may not be valid)
    return input;
  }

  /**
   * Parse product info from Walmart HTML (for browser layer)
   * Extracts basic product data from page HTML
   */
  parseProductFromHtml(html: string): {
    productId?: string;
    name?: string;
    price?: number;
    imageUrl?: string;
    inStock?: boolean;
  } {
    const result: {
      productId?: string;
      name?: string;
      price?: number;
      imageUrl?: string;
      inStock?: boolean;
    } = {};

    // Try to extract product ID from canonical URL or data attributes
    const canonicalMatch = html.match(/<link[^>]+rel="canonical"[^>]+href="[^"]*\/ip\/[^"]*?(\d+)"/i);
    if (canonicalMatch) {
      result.productId = canonicalMatch[1];
    }

    // Try JSON-LD structured data first (most reliable)
    const jsonLdMatch = html.match(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
    if (jsonLdMatch) {
      try {
        const data = JSON.parse(jsonLdMatch[1]);
        if (data['@type'] === 'Product' || data.name) {
          result.name = data.name;
          if (data.offers) {
            const offer = Array.isArray(data.offers) ? data.offers[0] : data.offers;
            if (offer.price) {
              result.price = parseFloat(offer.price);
            }
            if (offer.availability) {
              result.inStock = offer.availability.includes('InStock');
            }
          }
          if (data.image) {
            result.imageUrl = Array.isArray(data.image) ? data.image[0] : data.image;
          }
        }
      } catch {
        // JSON parse failed, continue with regex fallback
      }
    }

    // Fallback: Extract from meta tags
    if (!result.name) {
      const titleMatch = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i);
      if (titleMatch) {
        result.name = titleMatch[1];
      }
    }

    if (!result.imageUrl) {
      const imageMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i);
      if (imageMatch) {
        result.imageUrl = imageMatch[1];
      }
    }

    // Try to extract price from common patterns
    if (result.price === undefined) {
      const priceMatch = html.match(/\$(\d+(?:\.\d{2})?)/);
      if (priceMatch) {
        result.price = parseFloat(priceMatch[1]);
      }
    }

    return result;
  }
}
