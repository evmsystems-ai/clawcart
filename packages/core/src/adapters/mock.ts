import type { Product, CartItem, SearchOptions } from '../types';
import { BaseAdapter } from './base';

/**
 * Mock adapter for testing and development
 */
export class MockAdapter extends BaseAdapter {
  readonly name = 'mock';
  readonly displayName = 'Mock Store';
  readonly supportsApi = true;

  private products: Product[] = [
    {
      id: 'mock-1',
      retailer: 'mock',
      name: 'Crayons 24-Count',
      description: 'Classic crayons in 24 vibrant colors',
      price: 2.99,
      currency: 'USD',
      imageUrl: 'https://example.com/crayons.jpg',
      productUrl: 'https://example.com/products/crayons',
      inStock: true,
      rating: 4.5,
      reviewCount: 1234,
      category: 'School Supplies',
      brand: 'Crayola',
    },
    {
      id: 'mock-2',
      retailer: 'mock',
      name: '#2 Pencils 12-Pack',
      description: 'Classic yellow #2 pencils',
      price: 3.49,
      currency: 'USD',
      imageUrl: 'https://example.com/pencils.jpg',
      productUrl: 'https://example.com/products/pencils',
      inStock: true,
      rating: 4.7,
      reviewCount: 567,
      category: 'School Supplies',
      brand: 'Dixon',
    },
    {
      id: 'mock-3',
      retailer: 'mock',
      name: 'Pocket Folders 6-Pack',
      description: 'Assorted color pocket folders',
      price: 4.99,
      currency: 'USD',
      imageUrl: 'https://example.com/folders.jpg',
      productUrl: 'https://example.com/products/folders',
      inStock: true,
      rating: 4.2,
      reviewCount: 234,
      category: 'School Supplies',
      brand: 'Five Star',
    },
    {
      id: 'mock-4',
      retailer: 'mock',
      name: 'Glue Sticks 4-Pack',
      description: 'Washable school glue sticks',
      price: 2.49,
      currency: 'USD',
      imageUrl: 'https://example.com/glue.jpg',
      productUrl: 'https://example.com/products/glue',
      inStock: true,
      rating: 4.6,
      reviewCount: 890,
      category: 'School Supplies',
      brand: 'Elmers',
    },
    {
      id: 'mock-5',
      retailer: 'mock',
      name: 'Scissors - Blunt Tip',
      description: 'Safety scissors for kids',
      price: 1.99,
      currency: 'USD',
      imageUrl: 'https://example.com/scissors.jpg',
      productUrl: 'https://example.com/products/scissors',
      inStock: false,
      rating: 4.3,
      reviewCount: 456,
      category: 'School Supplies',
      brand: 'Fiskars',
    },
  ];

  async search(query: string, options?: SearchOptions): Promise<Product[]> {
    const normalized = this.normalizeQuery(query);
    
    let results = this.products.filter(p => 
      p.name.toLowerCase().includes(normalized) ||
      p.description?.toLowerCase().includes(normalized) ||
      p.category?.toLowerCase().includes(normalized)
    );
    
    // Apply filters
    if (options?.inStockOnly) {
      results = results.filter(p => p.inStock);
    }
    
    if (options?.priceRange) {
      if (options.priceRange.min !== undefined) {
        results = results.filter(p => p.price >= options.priceRange!.min!);
      }
      if (options.priceRange.max !== undefined) {
        results = results.filter(p => p.price <= options.priceRange!.max!);
      }
    }
    
    // Sort
    if (options?.sortBy === 'price_low') {
      results.sort((a, b) => a.price - b.price);
    } else if (options?.sortBy === 'price_high') {
      results.sort((a, b) => b.price - a.price);
    } else if (options?.sortBy === 'rating') {
      results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    
    // Limit
    if (options?.maxResults) {
      results = results.slice(0, options.maxResults);
    }
    
    return results;
  }

  async getProduct(productId: string): Promise<Product | null> {
    return this.products.find(p => p.id === productId) || null;
  }

  async buildCartUrl(items: CartItem[]): Promise<string> {
    const itemParams = items
      .map(item => `${item.productId}:${item.quantity}`)
      .join(',');
    
    return `https://example.com/cart/add?items=${encodeURIComponent(itemParams)}`;
  }
}
