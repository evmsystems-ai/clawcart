/**
 * Mock retailer URL helper for testing
 */

import { RetailerUrlHelper } from './base';

export class MockUrls extends RetailerUrlHelper {
  readonly name = 'mock';
  readonly displayName = 'Mock Store';
  
  private readonly baseUrl = 'https://example.com';

  getHomeUrl(): string {
    return this.baseUrl;
  }

  getCartUrl(): string {
    return `${this.baseUrl}/cart`;
  }

  getProductUrl(productId: string): string {
    return `${this.baseUrl}/products/${productId}`;
  }

  getSearchUrl(query: string): string {
    return this.buildUrl(`${this.baseUrl}/search`, {
      q: this.encodeQuery(query),
    });
  }
}
