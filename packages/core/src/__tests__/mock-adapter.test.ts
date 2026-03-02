import { describe, it, expect, beforeEach } from 'vitest';
import { MockAdapter } from '../adapters/mock';
import type { Product, CartItem, SearchOptions } from '../types';

describe('MockAdapter', () => {
  let adapter: MockAdapter;

  beforeEach(() => {
    adapter = new MockAdapter();
  });

  describe('properties', () => {
    it('should have correct name', () => {
      expect(adapter.name).toBe('mock');
    });

    it('should have correct display name', () => {
      expect(adapter.displayName).toBe('Mock Store');
    });

    it('should support API', () => {
      expect(adapter.supportsApi).toBe(true);
    });
  });

  describe('search', () => {
    it('should find products by name', async () => {
      const results = await adapter.search('crayons');
      
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Crayons 24-Count');
    });

    it('should find products by description', async () => {
      const results = await adapter.search('vibrant colors');
      
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('mock-1');
    });

    it('should find products by category', async () => {
      const results = await adapter.search('school supplies');
      
      expect(results.length).toBeGreaterThan(0);
      results.forEach(product => {
        expect(product.category).toBe('School Supplies');
      });
    });

    it('should be case-insensitive', async () => {
      const results1 = await adapter.search('CRAYONS');
      const results2 = await adapter.search('crayons');
      const results3 = await adapter.search('CrAyOnS');
      
      expect(results1).toEqual(results2);
      expect(results2).toEqual(results3);
    });

    it('should handle whitespace in query', async () => {
      const results = await adapter.search('  crayons  ');
      
      expect(results).toHaveLength(1);
    });

    it('should return empty array for no matches', async () => {
      const results = await adapter.search('nonexistent product xyz');
      
      expect(results).toEqual([]);
    });

    describe('search options', () => {
      it('should filter by inStockOnly', async () => {
        const results = await adapter.search('school supplies', { inStockOnly: true });
        
        results.forEach(product => {
          expect(product.inStock).toBe(true);
        });
        
        // Scissors (mock-5) is out of stock, should not be in results
        const scissorsInResults = results.some(p => p.id === 'mock-5');
        expect(scissorsInResults).toBe(false);
      });

      it('should filter by minimum price', async () => {
        const results = await adapter.search('school', {
          priceRange: { min: 3 },
        });
        
        results.forEach(product => {
          expect(product.price).toBeGreaterThanOrEqual(3);
        });
      });

      it('should filter by maximum price', async () => {
        const results = await adapter.search('school', {
          priceRange: { max: 3 },
        });
        
        results.forEach(product => {
          expect(product.price).toBeLessThanOrEqual(3);
        });
      });

      it('should filter by price range', async () => {
        const results = await adapter.search('school', {
          priceRange: { min: 2, max: 4 },
        });
        
        results.forEach(product => {
          expect(product.price).toBeGreaterThanOrEqual(2);
          expect(product.price).toBeLessThanOrEqual(4);
        });
      });

      it('should sort by price low to high', async () => {
        const results = await adapter.search('school', { sortBy: 'price_low' });
        
        for (let i = 1; i < results.length; i++) {
          expect(results[i].price).toBeGreaterThanOrEqual(results[i - 1].price);
        }
      });

      it('should sort by price high to low', async () => {
        const results = await adapter.search('school', { sortBy: 'price_high' });
        
        for (let i = 1; i < results.length; i++) {
          expect(results[i].price).toBeLessThanOrEqual(results[i - 1].price);
        }
      });

      it('should sort by rating', async () => {
        const results = await adapter.search('school', { sortBy: 'rating' });
        
        for (let i = 1; i < results.length; i++) {
          expect(results[i].rating || 0).toBeLessThanOrEqual(results[i - 1].rating || 0);
        }
      });

      it('should limit results with maxResults', async () => {
        const results = await adapter.search('school', { maxResults: 2 });
        
        expect(results.length).toBeLessThanOrEqual(2);
      });

      it('should combine multiple options', async () => {
        const results = await adapter.search('school', {
          inStockOnly: true,
          priceRange: { max: 5 },
          sortBy: 'price_low',
          maxResults: 3,
        });
        
        expect(results.length).toBeLessThanOrEqual(3);
        results.forEach(product => {
          expect(product.inStock).toBe(true);
          expect(product.price).toBeLessThanOrEqual(5);
        });
        
        // Check sorting
        for (let i = 1; i < results.length; i++) {
          expect(results[i].price).toBeGreaterThanOrEqual(results[i - 1].price);
        }
      });
    });
  });

  describe('getProduct', () => {
    it('should return product by ID', async () => {
      const product = await adapter.getProduct('mock-1');
      
      expect(product).not.toBeNull();
      expect(product!.id).toBe('mock-1');
      expect(product!.name).toBe('Crayons 24-Count');
      expect(product!.price).toBe(2.99);
      expect(product!.retailer).toBe('mock');
    });

    it('should return null for non-existent product', async () => {
      const product = await adapter.getProduct('nonexistent');
      
      expect(product).toBeNull();
    });

    it('should return complete product data', async () => {
      const product = await adapter.getProduct('mock-2');
      
      expect(product).toMatchObject({
        id: 'mock-2',
        retailer: 'mock',
        name: '#2 Pencils 12-Pack',
        description: 'Classic yellow #2 pencils',
        price: 3.49,
        currency: 'USD',
        imageUrl: expect.any(String),
        productUrl: expect.any(String),
        inStock: true,
        rating: 4.7,
        reviewCount: 567,
        category: 'School Supplies',
        brand: 'Dixon',
      });
    });

    it('should return out-of-stock product correctly', async () => {
      const product = await adapter.getProduct('mock-5');
      
      expect(product!.inStock).toBe(false);
    });
  });

  describe('buildCartUrl', () => {
    it('should build cart URL with single item', async () => {
      const items: CartItem[] = [
        {
          id: 'item-1',
          retailer: 'mock',
          productId: 'mock-1',
          name: 'Crayons',
          price: 2.99,
          quantity: 2,
          imageUrl: 'https://example.com/img.jpg',
          productUrl: 'https://example.com/product',
          inStock: true,
          alternatives: [],
        },
      ];
      
      const url = await adapter.buildCartUrl(items);
      
      expect(url).toContain('https://example.com/cart/add');
      // URL encoding converts : to %3A
      expect(url).toContain('mock-1%3A2');
    });

    it('should build cart URL with multiple items', async () => {
      const items: CartItem[] = [
        {
          id: 'item-1',
          retailer: 'mock',
          productId: 'mock-1',
          name: 'Crayons',
          price: 2.99,
          quantity: 1,
          imageUrl: '',
          productUrl: '',
          inStock: true,
          alternatives: [],
        },
        {
          id: 'item-2',
          retailer: 'mock',
          productId: 'mock-2',
          name: 'Pencils',
          price: 3.49,
          quantity: 3,
          imageUrl: '',
          productUrl: '',
          inStock: true,
          alternatives: [],
        },
      ];
      
      const url = await adapter.buildCartUrl(items);
      
      // URL encoding converts : to %3A and , to %2C
      expect(url).toContain('mock-1%3A1');
      expect(url).toContain('mock-2%3A3');
    });

    it('should handle empty cart', async () => {
      const url = await adapter.buildCartUrl([]);
      
      expect(url).toContain('https://example.com/cart/add');
    });
  });

  describe('checkAvailability (inherited from BaseAdapter)', () => {
    it('should return availability for existing product', async () => {
      const status = await adapter.checkAvailability('mock-1');
      
      expect(status.inStock).toBe(true);
      expect(status.price).toBe(2.99);
    });

    it('should return out-of-stock for unavailable product', async () => {
      const status = await adapter.checkAvailability('mock-5');
      
      expect(status.inStock).toBe(false);
      expect(status.price).toBe(1.99);
    });

    it('should return not in stock for non-existent product', async () => {
      const status = await adapter.checkAvailability('nonexistent');
      
      expect(status.inStock).toBe(false);
      expect(status.price).toBeUndefined();
    });
  });

  describe('mock data integrity', () => {
    it('should have all required product fields', async () => {
      const results = await adapter.search('school');
      
      results.forEach(product => {
        expect(product.id).toBeDefined();
        expect(product.retailer).toBe('mock');
        expect(product.name).toBeDefined();
        expect(typeof product.price).toBe('number');
        expect(product.currency).toBe('USD');
        expect(product.imageUrl).toBeDefined();
        expect(product.productUrl).toBeDefined();
        expect(typeof product.inStock).toBe('boolean');
      });
    });

    it('should have all 5 mock products', async () => {
      const allProducts = await adapter.search('');
      
      // Empty search should match nothing based on current implementation
      // Let's search for something broad
      const categoryResults = await adapter.search('school supplies');
      expect(categoryResults.length).toBe(5);
    });

    it('should have unique product IDs', async () => {
      const results = await adapter.search('school supplies');
      const ids = results.map(p => p.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});
