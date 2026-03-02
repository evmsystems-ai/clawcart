import type { Product, CartItem, SearchOptions } from '../types';
import { BaseAdapter } from './base';

/**
 * Amazon adapter for product search and cart building
 * 
 * Note: This adapter builds URLs for browser-based interactions
 * since Amazon's Product Advertising API requires approval.
 * The SDK's browser layer handles actual scraping when needed.
 */
export class AmazonAdapter extends BaseAdapter {
  readonly name = 'amazon';
  readonly displayName = 'Amazon';
  readonly supportsApi = false; // No direct API - uses browser scraping

  private readonly baseUrl = 'https://www.amazon.com';

  /**
   * Build Amazon search URL
   * Returns empty array - actual search requires browser layer
   */
  async search(query: string, options?: SearchOptions): Promise<Product[]> {
    // Amazon search requires browser-based scraping
    // This adapter provides URL building; the browser layer does extraction
    // For now, return empty - SDK orchestrator will use browser if available
    return [];
  }

  /**
   * Get Amazon search URL for browser layer
   */
  getSearchUrl(query: string, options?: SearchOptions): string {
    const params: Record<string, string | number> = {
      k: this.normalizeQuery(query),
    };

    // Add sort parameter
    if (options?.sortBy === 'price_low') {
      params['s'] = 'price-asc-rank';
    } else if (options?.sortBy === 'price_high') {
      params['s'] = 'price-desc-rank';
    } else if (options?.sortBy === 'rating') {
      params['s'] = 'review-rank';
    }

    // Price range filters
    if (options?.priceRange?.min !== undefined) {
      params['rh'] = `p_36:${Math.floor(options.priceRange.min * 100)}-`;
    }
    if (options?.priceRange?.max !== undefined) {
      const existing = params['rh'] || 'p_36:';
      params['rh'] = `${existing}${Math.floor(options.priceRange.max * 100)}`;
    }

    return this.buildUrl(`${this.baseUrl}/s`, params);
  }

  /**
   * Get product by ASIN
   * Returns null - actual fetch requires browser layer
   */
  async getProduct(productId: string): Promise<Product | null> {
    // Product details require browser-based scraping
    // This method is used for cache lookups; browser layer does extraction
    return null;
  }

  /**
   * Get Amazon product URL
   */
  getProductUrl(asin: string): string {
    return `${this.baseUrl}/dp/${asin}`;
  }

  /**
   * Build Amazon "Add to Cart" URL
   * Uses Amazon's direct cart add endpoint with ASIN parameters
   * 
   * @see https://www.amazon.com/gp/aws/cart/add.html
   */
  async buildCartUrl(items: CartItem[]): Promise<string> {
    if (items.length === 0) {
      throw new Error('Cannot build cart URL with no items');
    }

    // Filter to only Amazon items
    const amazonItems = items.filter(item => 
      item.retailer === 'amazon' || item.retailer === this.name
    );

    if (amazonItems.length === 0) {
      throw new Error('No Amazon items in cart');
    }

    // Amazon's cart add URL format uses numbered ASIN/Quantity params
    // ASIN.1, Quantity.1, ASIN.2, Quantity.2, etc.
    const params: Record<string, string | number> = {};
    
    amazonItems.forEach((item, index) => {
      const num = index + 1;
      // Product ID is expected to be an ASIN
      const asin = this.extractAsin(item.productId);
      params[`ASIN.${num}`] = asin;
      params[`Quantity.${num}`] = item.quantity;
    });

    return this.buildUrl(`${this.baseUrl}/gp/aws/cart/add.html`, params);
  }

  /**
   * Extract ASIN from various product ID formats
   * Handles: raw ASIN, Amazon URLs, dp/ASIN format
   */
  private extractAsin(productId: string): string {
    // If it's already a clean ASIN (10 alphanumeric chars)
    if (/^[A-Z0-9]{10}$/i.test(productId)) {
      return productId.toUpperCase();
    }

    // Try to extract from URL patterns
    const patterns = [
      /\/dp\/([A-Z0-9]{10})/i,           // /dp/ASIN
      /\/gp\/product\/([A-Z0-9]{10})/i,  // /gp/product/ASIN
      /\/product\/([A-Z0-9]{10})/i,      // /product/ASIN
      /\?.*asin=([A-Z0-9]{10})/i,        // ?asin=ASIN
      /\/([A-Z0-9]{10})(?:\/|\?|$)/i,    // Fallback: any 10-char segment
    ];

    for (const pattern of patterns) {
      const match = productId.match(pattern);
      if (match) {
        return match[1].toUpperCase();
      }
    }

    // Return as-is if no pattern matches (may fail at checkout)
    return productId;
  }

  /**
   * Parse Amazon product data from page HTML
   * Used by browser layer after page load
   */
  parseProductFromHtml(html: string, asin: string): Product | null {
    try {
      // Title extraction
      const titleMatch = html.match(/<span[^>]*id="productTitle"[^>]*>([^<]+)<\/span>/i);
      const name = titleMatch ? titleMatch[1].trim() : '';

      if (!name) return null;

      // Price extraction (handles various formats)
      let price = 0;
      const pricePatterns = [
        /<span[^>]*class="[^"]*a-price-whole[^"]*"[^>]*>([0-9,]+)<\/span>/i,
        /data-a-color="price"[^>]*>.*?\$([0-9,]+\.?\d*)/i,
        /"priceAmount":\s*([0-9.]+)/i,
      ];
      
      for (const pattern of pricePatterns) {
        const match = html.match(pattern);
        if (match) {
          price = parseFloat(match[1].replace(/,/g, ''));
          break;
        }
      }

      // Image extraction
      const imageMatch = html.match(/<img[^>]*id="landingImage"[^>]*src="([^"]+)"/i)
        || html.match(/"hiRes":\s*"([^"]+)"/i)
        || html.match(/"large":\s*"([^"]+)"/i);
      const imageUrl = imageMatch ? imageMatch[1] : '';

      // Rating extraction
      const ratingMatch = html.match(/([0-9.]+) out of 5 stars/i);
      const rating = ratingMatch ? parseFloat(ratingMatch[1]) : undefined;

      // Review count
      const reviewMatch = html.match(/([0-9,]+)\s*(?:global\s*)?ratings/i);
      const reviewCount = reviewMatch ? parseInt(reviewMatch[1].replace(/,/g, ''), 10) : undefined;

      // Stock status
      const inStock = !html.includes('Currently unavailable') 
        && !html.includes('Out of Stock')
        && (html.includes('In Stock') || html.includes('Add to Cart'));

      return {
        id: asin,
        retailer: 'amazon',
        name,
        price,
        currency: 'USD',
        imageUrl,
        productUrl: this.getProductUrl(asin),
        inStock,
        rating,
        reviewCount,
      };
    } catch (error) {
      console.error('Failed to parse Amazon product HTML:', error);
      return null;
    }
  }

  /**
   * Parse search results from page HTML
   * Used by browser layer after search page load
   */
  parseSearchResultsFromHtml(html: string, maxResults?: number): Product[] {
    const products: Product[] = [];
    
    // Match product cards in search results using exec loop for ES5 compat
    const cardPattern = /<div[^>]*data-asin="([A-Z0-9]{10})"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/gi;
    let match: RegExpExecArray | null;

    while ((match = cardPattern.exec(html)) !== null) {
      if (maxResults && products.length >= maxResults) break;

      const asin = match[1];
      const cardHtml = match[0];

      // Extract product details from card
      const titleMatch = cardHtml.match(/<span[^>]*class="[^"]*a-text-normal[^"]*"[^>]*>([^<]+)<\/span>/i)
        || cardHtml.match(/<h2[^>]*>[\s\S]*?<span>([^<]+)<\/span>/i);
      const name = titleMatch ? titleMatch[1].trim() : '';

      if (!name) continue;

      const priceMatch = cardHtml.match(/<span[^>]*class="[^"]*a-price-whole[^"]*"[^>]*>([0-9,]+)<\/span>/i);
      const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : 0;

      const imageMatch = cardHtml.match(/<img[^>]*src="([^"]+)"[^>]*class="[^"]*s-image[^"]*"/i);
      const imageUrl = imageMatch ? imageMatch[1] : '';

      const ratingMatch = cardHtml.match(/([0-9.]+) out of 5 stars/i);
      const rating = ratingMatch ? parseFloat(ratingMatch[1]) : undefined;

      products.push({
        id: asin,
        retailer: 'amazon',
        name,
        price,
        currency: 'USD',
        imageUrl,
        productUrl: this.getProductUrl(asin),
        inStock: true, // Assume in stock if in search results
        rating,
      });
    }

    return products;
  }
}
