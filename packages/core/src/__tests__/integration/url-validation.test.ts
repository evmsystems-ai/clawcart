/**
 * Integration Tests: URL Validation
 * 
 * Tests URL generation and validation for each adapter.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AmazonUrls } from '../../adapters/amazon';
import { MockUrls } from '../../adapters/mock';

describe('Integration: URL Validation', () => {
  describe('Amazon URL Validation', () => {
    let amazon: AmazonUrls;

    beforeEach(() => {
      amazon = new AmazonUrls();
    });

    describe('Product URL Generation', () => {
      it('should generate valid product URL from ASIN', () => {
        const url = amazon.getProductUrl('B08N5WRWNW');
        
        expect(url).toBe('https://www.amazon.com/dp/B08N5WRWNW');
        expect(() => new URL(url)).not.toThrow();
      });

      it('should extract ASIN from full product URL', () => {
        const fullUrl = 'https://www.amazon.com/Crayola-Crayons-64-Count-Box/dp/B00000J0S4/ref=sr_1_2';
        const normalized = amazon.getProductUrl(fullUrl);
        
        expect(normalized).toBe('https://www.amazon.com/dp/B00000J0S4');
      });

      it('should extract ASIN from gp/product URL', () => {
        const gpUrl = 'https://www.amazon.com/gp/product/B09XYZ1234?th=1';
        const normalized = amazon.getProductUrl(gpUrl);
        
        expect(normalized).toBe('https://www.amazon.com/dp/B09XYZ1234');
      });

      it('should handle lowercase ASIN', () => {
        const url = amazon.getProductUrl('b08n5wrwnw');
        
        expect(url).toBe('https://www.amazon.com/dp/B08N5WRWNW');
      });

      it('should handle various ASIN formats', () => {
        const testCases = [
          { input: 'B00000J0S4', expected: 'B00000J0S4' },
          { input: '0123456789', expected: '0123456789' }, // 10-digit ISBN
          { input: 'B0D12XY34Z', expected: 'B0D12XY34Z' },
        ];

        testCases.forEach(({ input, expected }) => {
          const url = amazon.getProductUrl(input);
          expect(url).toContain(expected);
        });
      });
    });

    describe('Search URL Generation', () => {
      it('should generate valid search URL', () => {
        const url = amazon.getSearchUrl('crayons 64 count');
        
        expect(url).toContain('amazon.com/s');
        expect(url).toContain('k=');
        expect(() => new URL(url)).not.toThrow();
      });

      it('should properly encode special characters', () => {
        const url = amazon.getSearchUrl('kids\' art supplies');
        
        expect(() => new URL(url)).not.toThrow();
        // Should not have unencoded apostrophe
        expect(url).not.toContain("'");
      });

      it('should handle empty search query', () => {
        const url = amazon.getSearchUrl('');
        
        expect(() => new URL(url)).not.toThrow();
      });

      it('should handle unicode characters', () => {
        const url = amazon.getSearchUrl('日本語 test');
        
        expect(() => new URL(url)).not.toThrow();
      });
    });

    describe('Add to Cart URL Generation', () => {
      it('should generate valid add-to-cart URL for single item', () => {
        const url = amazon.getAddToCartUrl([
          { asin: 'B00000J0S4', quantity: 2 },
        ]);

        expect(url).toContain('amazon.com/gp/aws/cart/add.html');
        expect(url).toContain('ASIN.1=B00000J0S4');
        expect(url).toContain('Quantity.1=2');
        expect(() => new URL(url)).not.toThrow();
      });

      it('should generate valid add-to-cart URL for multiple items', () => {
        const url = amazon.getAddToCartUrl([
          { asin: 'B00000J0S4', quantity: 1 },
          { asin: 'B08N5WRWNW', quantity: 3 },
          { asin: 'B09ABC1234', quantity: 2 },
        ]);

        expect(url).toContain('ASIN.1=B00000J0S4');
        expect(url).toContain('ASIN.2=B08N5WRWNW');
        expect(url).toContain('ASIN.3=B09ABC1234');
        expect(url).toContain('Quantity.1=1');
        expect(url).toContain('Quantity.2=3');
        expect(url).toContain('Quantity.3=2');
        expect(() => new URL(url)).not.toThrow();
      });

      it('should default quantity to 1 if not specified', () => {
        const url = amazon.getAddToCartUrl([
          { asin: 'B00000J0S4' },
        ]);

        expect(url).toContain('Quantity.1=1');
      });

      it('should normalize ASINs in add-to-cart URL', () => {
        const url = amazon.getAddToCartUrl([
          { asin: 'https://amazon.com/dp/B00000J0S4/ref=xyz', quantity: 1 },
        ]);

        expect(url).toContain('ASIN.1=B00000J0S4');
        // The URL itself will start with https://, but ASIN should not contain the original URL
        expect(url).not.toContain('amazon.com%2F'); // No encoded URL parts in params
        expect(url).not.toMatch(/ASIN\.1=https?/i); // ASIN value shouldn't start with http
      });
    });

    describe('Cart and Home URLs', () => {
      it('should return valid cart URL', () => {
        const url = amazon.getCartUrl();
        
        expect(url).toBe('https://www.amazon.com/cart');
        expect(() => new URL(url)).not.toThrow();
      });

      it('should return valid home URL', () => {
        const url = amazon.getHomeUrl();
        
        expect(url).toBe('https://www.amazon.com');
        expect(() => new URL(url)).not.toThrow();
      });
    });
  });

  describe('Mock URL Validation', () => {
    let mock: MockUrls;

    beforeEach(() => {
      mock = new MockUrls();
    });

    it('should generate valid home URL', () => {
      const url = mock.getHomeUrl();
      
      expect(url).toBe('https://example.com');
      expect(() => new URL(url)).not.toThrow();
    });

    it('should generate valid cart URL', () => {
      const url = mock.getCartUrl();
      
      expect(url).toBe('https://example.com/cart');
      expect(() => new URL(url)).not.toThrow();
    });

    it('should generate valid product URL', () => {
      const url = mock.getProductUrl('product-123');
      
      expect(url).toBe('https://example.com/products/product-123');
      expect(() => new URL(url)).not.toThrow();
    });

    it('should generate valid search URL', () => {
      const url = mock.getSearchUrl('test query');
      
      expect(url).toContain('example.com/search');
      expect(url).toContain('q=test+query');
      expect(() => new URL(url)).not.toThrow();
    });

    it('should handle special characters in search', () => {
      const url = mock.getSearchUrl('special & characters + more');
      
      expect(() => new URL(url)).not.toThrow();
    });
  });

  describe('URL Format Consistency', () => {
    it('should use HTTPS for all generated URLs', () => {
      const amazon = new AmazonUrls();
      const mock = new MockUrls();

      const urls = [
        amazon.getHomeUrl(),
        amazon.getCartUrl(),
        amazon.getProductUrl('B12345ABCD'),
        amazon.getSearchUrl('test'),
        amazon.getAddToCartUrl([{ asin: 'B12345ABCD' }]),
        mock.getHomeUrl(),
        mock.getCartUrl(),
        mock.getProductUrl('123'),
        mock.getSearchUrl('test'),
      ];

      urls.forEach(url => {
        expect(url).toMatch(/^https:\/\//);
      });
    });

    it('should not have trailing slashes on base URLs', () => {
      const amazon = new AmazonUrls();
      const mock = new MockUrls();

      expect(amazon.getHomeUrl()).not.toMatch(/\/$/);
      expect(mock.getHomeUrl()).not.toMatch(/\/$/);
    });

    it('should have consistent path structure', () => {
      const amazon = new AmazonUrls();

      // Cart should be under /cart
      expect(amazon.getCartUrl()).toMatch(/\/cart$/);
      
      // Products should be under /dp/
      expect(amazon.getProductUrl('B12345ABCD')).toMatch(/\/dp\/[A-Z0-9]+$/);
      
      // Search should be under /s
      expect(amazon.getSearchUrl('test')).toMatch(/\/s\?/);
    });
  });
});
