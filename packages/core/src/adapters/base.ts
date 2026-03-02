import type {
  RetailerAdapter,
  Product,
  CartItem,
  SearchOptions,
  AvailabilityStatus,
} from '../types';

/**
 * Base adapter class with common functionality
 */
export abstract class BaseAdapter implements RetailerAdapter {
  abstract readonly name: string;
  abstract readonly displayName: string;
  abstract readonly supportsApi: boolean;

  /**
   * Search for products
   */
  abstract search(query: string, options?: SearchOptions): Promise<Product[]>;

  /**
   * Get single product by ID
   */
  abstract getProduct(productId: string): Promise<Product | null>;

  /**
   * Build cart URL for checkout
   */
  abstract buildCartUrl(items: CartItem[]): Promise<string>;

  /**
   * Check product availability
   */
  async checkAvailability(productId: string): Promise<AvailabilityStatus> {
    const product = await this.getProduct(productId);
    
    if (!product) {
      return { inStock: false };
    }
    
    return {
      inStock: product.inStock,
      price: product.price,
    };
  }

  /**
   * Helper: Normalize search query
   */
  protected normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');
  }

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
}
