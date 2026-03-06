/**
 * Integration Tests: Multi-Adapter Scenarios
 * 
 * Tests using multiple retailer URL helpers together,
 * registry management, and cross-retailer workflows.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ClawCart } from '../../cart';
import { AmazonUrls } from '../../adapters/amazon';
import { MockUrls } from '../../adapters/mock';
import { UrlRegistry } from '../../adapters/registry';
import type { RetailerUrls } from '../../types';

describe('Integration: Multi-Adapter Scenarios', () => {
  let registry: UrlRegistry;
  let amazonUrls: AmazonUrls;
  let mockUrls: MockUrls;

  beforeEach(() => {
    registry = new UrlRegistry();
    amazonUrls = new AmazonUrls();
    mockUrls = new MockUrls();
    
    registry.register(amazonUrls);
    registry.register(mockUrls);
  });

  describe('Multiple Carts with Different Retailers', () => {
    it('should manage separate carts for Amazon and Mock store', () => {
      // Create Amazon cart
      const amazonCart = ClawCart.fromItems([
        { name: 'Amazon Item 1', quantity: 2, price: 15.99 },
        { name: 'Amazon Item 2', quantity: 1, price: 24.99 },
      ], 'amazon');

      // Create Mock store cart
      const mockCart = ClawCart.fromItems([
        { name: 'Mock Item 1', quantity: 3, price: 9.99 },
        { name: 'Mock Item 2', quantity: 2, price: 12.99 },
      ], 'mock');

      // Verify each cart has correct retailer
      expect(amazonCart.retailer).toBe('amazon');
      expect(mockCart.retailer).toBe('mock');

      // Verify items are isolated
      expect(amazonCart.items).toHaveLength(2);
      expect(mockCart.items).toHaveLength(2);

      // Verify totals are independent
      // Amazon: (2 * 15.99) + (1 * 24.99) = 31.98 + 24.99 = 56.97
      // Mock: (3 * 9.99) + (2 * 12.99) = 29.97 + 25.98 = 55.95
      expect(amazonCart.total).toBeCloseTo(56.97, 2);
      expect(mockCart.total).toBeCloseTo(55.95, 2);
    });

    it('should use correct URL helpers for each retailer', () => {
      const amazonHelper = registry.get('amazon')!;
      const mockHelper = registry.get('mock')!;

      // Amazon URLs
      expect(amazonHelper.getCartUrl()).toBe('https://www.amazon.com/cart');
      expect(amazonHelper.getSearchUrl('crayons')).toContain('amazon.com/s');
      expect(amazonHelper.getProductUrl('B00000J0S4')).toBe('https://www.amazon.com/dp/B00000J0S4');

      // Mock URLs
      expect(mockHelper.getCartUrl()).toBe('https://example.com/cart');
      expect(mockHelper.getSearchUrl('crayons')).toContain('example.com/search');
      expect(mockHelper.getProductUrl('prod-123')).toBe('https://example.com/products/prod-123');
    });

    it('should generate correct search URLs for cart items', () => {
      const amazonCart = ClawCart.fromItems([
        { name: 'School Crayons', quantity: 2 },
        { name: 'Number 2 Pencils', quantity: 1 },
      ], 'amazon');

      const searchUrls = amazonCart.getSearchUrls();

      expect(searchUrls).toHaveLength(2);
      expect(searchUrls[0].item).toBe('School Crayons');
      expect(searchUrls[0].url).toContain('amazon.com/s');
      // URL encoding may use %20 or + for spaces
      expect(searchUrls[0].url).toMatch(/School(\+|%20)Crayons/);
      
      expect(searchUrls[1].item).toBe('Number 2 Pencils');
      expect(searchUrls[1].url).toMatch(/Number(\+|%20)2(\+|%20)Pencils/);
    });
  });

  describe('Registry Operations', () => {
    it('should list all registered adapters', () => {
      const names = registry.list();
      
      expect(names).toHaveLength(2);
      expect(names).toContain('amazon');
      expect(names).toContain('mock');
    });

    it('should retrieve all adapters', () => {
      const all = registry.all();
      
      expect(all).toHaveLength(2);
      expect(all.map(a => a.name)).toContain('amazon');
      expect(all.map(a => a.name)).toContain('mock');
    });

    it('should support case-insensitive lookup', () => {
      expect(registry.get('amazon')).toBe(amazonUrls);
      expect(registry.get('AMAZON')).toBe(amazonUrls);
      expect(registry.get('Amazon')).toBe(amazonUrls);
    });

    it('should return undefined for unregistered retailers', () => {
      expect(registry.get('walmart')).toBeUndefined();
      expect(registry.get('target')).toBeUndefined();
      expect(registry.has('costco')).toBe(false);
    });
  });

  describe('Consolidated Shopping List', () => {
    it('should combine multiple retailer carts into summary', () => {
      // Simulate a multi-retailer shopping scenario
      const carts = new Map<string, ClawCart>();
      
      // Add items from different "sources"
      carts.set('amazon', ClawCart.fromItems([
        { name: 'Echo Dot', quantity: 1, price: 49.99 },
        { name: 'Kindle', quantity: 1, price: 89.99 },
      ], 'amazon'));

      carts.set('mock', ClawCart.fromItems([
        { name: 'Generic Cables', quantity: 3, price: 5.99 },
        { name: 'Phone Case', quantity: 1, price: 12.99 },
      ], 'mock'));

      // Calculate totals across all carts
      let grandTotal = 0;
      let totalItems = 0;

      for (const [retailer, cart] of carts) {
        grandTotal += cart.total;
        totalItems += cart.itemCount;
      }

      expect(grandTotal).toBeCloseTo(170.94, 2); // 139.98 + 30.96
      expect(totalItems).toBe(6); // 1 + 1 + 3 + 1
    });

    it('should track items across retailers with metadata', () => {
      interface TrackedItem {
        retailer: string;
        name: string;
        quantity: number;
        price?: number;
        searchUrl: string;
      }

      const allItems: TrackedItem[] = [];

      // Amazon items with search URLs
      const amazonCart = ClawCart.fromItems([
        { name: 'USB-C Cable', quantity: 2, price: 8.99 },
      ], 'amazon');
      
      amazonCart.items.forEach(item => {
        allItems.push({
          retailer: 'amazon',
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          searchUrl: amazonUrls.getSearchUrl(item.name),
        });
      });

      // Mock items with search URLs
      const mockCart = ClawCart.fromItems([
        { name: 'Budget USB-C Cable', quantity: 3, price: 3.99 },
      ], 'mock');
      
      mockCart.items.forEach(item => {
        allItems.push({
          retailer: 'mock',
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          searchUrl: mockUrls.getSearchUrl(item.name),
        });
      });

      expect(allItems).toHaveLength(2);
      expect(allItems[0].searchUrl).toContain('amazon.com');
      expect(allItems[1].searchUrl).toContain('example.com');
    });
  });

  describe('Adapter Extensibility', () => {
    it('should allow registering custom adapter at runtime', () => {
      // Create a custom adapter
      class CustomRetailerUrls implements RetailerUrls {
        readonly name = 'custom';
        readonly displayName = 'Custom Store';

        getHomeUrl(): string {
          return 'https://custom-store.com';
        }
        getCartUrl(): string {
          return 'https://custom-store.com/shopping-cart';
        }
        getProductUrl(productId: string): string {
          return `https://custom-store.com/item/${productId}`;
        }
        getSearchUrl(query: string): string {
          return `https://custom-store.com/find?term=${encodeURIComponent(query)}`;
        }
      }

      // Register it
      registry.register(new CustomRetailerUrls());

      // Verify it works
      expect(registry.has('custom')).toBe(true);
      const custom = registry.get('custom')!;
      expect(custom.getCartUrl()).toBe('https://custom-store.com/shopping-cart');
      expect(custom.getSearchUrl('test item')).toContain('term=test%20item');
    });

    it('should allow replacing existing adapter', () => {
      // Create a custom Amazon adapter with different URLs
      class CustomAmazonUrls implements RetailerUrls {
        readonly name = 'amazon';
        readonly displayName = 'Amazon (Custom)';

        getHomeUrl(): string {
          return 'https://smile.amazon.com';
        }
        getCartUrl(): string {
          return 'https://smile.amazon.com/cart';
        }
        getProductUrl(productId: string): string {
          return `https://smile.amazon.com/dp/${productId}`;
        }
        getSearchUrl(query: string): string {
          return `https://smile.amazon.com/s?k=${encodeURIComponent(query)}`;
        }
      }

      // Replace the existing Amazon adapter
      registry.register(new CustomAmazonUrls());

      // Verify it was replaced
      const amazon = registry.get('amazon')!;
      expect(amazon.displayName).toBe('Amazon (Custom)');
      expect(amazon.getHomeUrl()).toBe('https://smile.amazon.com');
    });
  });

  describe('ClawCart Search URL Generation', () => {
    it('should generate correct search URLs for default retailers', () => {
      const retailers = ['amazon', 'walmart', 'target', 'costco'];
      const testQuery = 'colored pencils';

      retailers.forEach(retailer => {
        const cart = ClawCart.fromItems([{ name: testQuery }], retailer);
        const urls = cart.getSearchUrls();
        
        expect(urls).toHaveLength(1);
        expect(urls[0].item).toBe(testQuery);
        expect(urls[0].url).toContain(encodeURIComponent('colored').replace(/%20/g, '+'));
      });
    });

    it('should handle special characters in search queries', () => {
      const cart = ClawCart.fromItems([
        { name: 'Kids\' Scissors (Safety)' },
        { name: 'Art & Crafts Supplies' },
        { name: '3M Post-It Notes' },
      ], 'amazon');

      const urls = cart.getSearchUrls();

      expect(urls).toHaveLength(3);
      // All URLs should be valid (properly encoded)
      urls.forEach(({ url }) => {
        expect(() => new URL(url)).not.toThrow();
      });
    });
  });
});
