import { describe, it, expect, beforeEach } from 'vitest';
import { AmazonUrls } from '../adapters/amazon';
import { MockUrls } from '../adapters/mock';
import { UrlRegistry } from '../adapters/registry';

describe('AmazonUrls', () => {
  let amazon: AmazonUrls;

  beforeEach(() => {
    amazon = new AmazonUrls();
  });

  describe('properties', () => {
    it('should have correct name', () => {
      expect(amazon.name).toBe('amazon');
    });

    it('should have correct display name', () => {
      expect(amazon.displayName).toBe('Amazon');
    });
  });

  describe('getHomeUrl', () => {
    it('should return Amazon homepage', () => {
      expect(amazon.getHomeUrl()).toBe('https://www.amazon.com');
    });
  });

  describe('getCartUrl', () => {
    it('should return Amazon cart URL', () => {
      expect(amazon.getCartUrl()).toBe('https://www.amazon.com/cart');
    });
  });

  describe('getProductUrl', () => {
    it('should build product URL from ASIN', () => {
      const url = amazon.getProductUrl('B08N5WRWNW');
      expect(url).toBe('https://www.amazon.com/dp/B08N5WRWNW');
    });

    it('should normalize lowercase ASIN', () => {
      const url = amazon.getProductUrl('b08n5wrwnw');
      expect(url).toBe('https://www.amazon.com/dp/B08N5WRWNW');
    });

    it('should extract ASIN from product URL', () => {
      const url = amazon.getProductUrl('https://www.amazon.com/dp/B08N5WRWNW/ref=sr_1_1');
      expect(url).toBe('https://www.amazon.com/dp/B08N5WRWNW');
    });

    it('should extract ASIN from gp/product URL', () => {
      const url = amazon.getProductUrl('https://www.amazon.com/gp/product/B08N5WRWNW');
      expect(url).toBe('https://www.amazon.com/dp/B08N5WRWNW');
    });
  });

  describe('getSearchUrl', () => {
    it('should build search URL', () => {
      const url = amazon.getSearchUrl('crayons');
      expect(url).toContain('amazon.com/s');
      expect(url).toContain('k=crayons');
    });

    it('should encode search query', () => {
      const url = amazon.getSearchUrl('art supplies');
      // URLSearchParams encodes spaces as + (which is valid)
      expect(url).toContain('k=art+supplies');
    });
  });

  describe('getAddToCartUrl', () => {
    it('should build add-to-cart URL for single item', () => {
      const url = amazon.getAddToCartUrl([
        { asin: 'B08N5WRWNW', quantity: 2 },
      ]);
      
      expect(url).toContain('amazon.com/gp/aws/cart/add.html');
      expect(url).toContain('ASIN.1=B08N5WRWNW');
      expect(url).toContain('Quantity.1=2');
    });

    it('should build add-to-cart URL for multiple items', () => {
      const url = amazon.getAddToCartUrl([
        { asin: 'B08N5WRWNW', quantity: 1 },
        { asin: 'B09ABC1234', quantity: 3 },
      ]);
      
      expect(url).toContain('ASIN.1=B08N5WRWNW');
      expect(url).toContain('Quantity.1=1');
      expect(url).toContain('ASIN.2=B09ABC1234');
      expect(url).toContain('Quantity.2=3');
    });

    it('should default quantity to 1', () => {
      const url = amazon.getAddToCartUrl([
        { asin: 'B08N5WRWNW' },
      ]);
      
      expect(url).toContain('Quantity.1=1');
    });
  });
});

describe('MockUrls', () => {
  let mock: MockUrls;

  beforeEach(() => {
    mock = new MockUrls();
  });

  describe('properties', () => {
    it('should have correct name', () => {
      expect(mock.name).toBe('mock');
    });

    it('should have correct display name', () => {
      expect(mock.displayName).toBe('Mock Store');
    });
  });

  describe('URLs', () => {
    it('should return home URL', () => {
      expect(mock.getHomeUrl()).toBe('https://example.com');
    });

    it('should return cart URL', () => {
      expect(mock.getCartUrl()).toBe('https://example.com/cart');
    });

    it('should return product URL', () => {
      expect(mock.getProductUrl('prod-123')).toBe('https://example.com/products/prod-123');
    });

    it('should return search URL', () => {
      const url = mock.getSearchUrl('test query');
      expect(url).toContain('example.com/search');
      // URLSearchParams encodes spaces as + (which is valid)
      expect(url).toContain('q=test+query');
    });
  });
});

describe('UrlRegistry', () => {
  let registry: UrlRegistry;

  beforeEach(() => {
    registry = new UrlRegistry();
  });

  describe('register', () => {
    it('should register a URL helper', () => {
      registry.register(new MockUrls());
      expect(registry.has('mock')).toBe(true);
    });

    it('should allow multiple helpers', () => {
      registry.register(new MockUrls());
      registry.register(new AmazonUrls());
      
      expect(registry.has('mock')).toBe(true);
      expect(registry.has('amazon')).toBe(true);
    });
  });

  describe('get', () => {
    it('should return registered helper', () => {
      const helper = new MockUrls();
      registry.register(helper);
      
      expect(registry.get('mock')).toBe(helper);
    });

    it('should return undefined for unknown', () => {
      expect(registry.get('unknown')).toBeUndefined();
    });

    it('should be case-insensitive', () => {
      registry.register(new MockUrls());
      
      expect(registry.get('mock')).toBeDefined();
      expect(registry.get('MOCK')).toBeDefined();
      expect(registry.get('Mock')).toBeDefined();
    });
  });

  describe('has', () => {
    it('should return true for registered', () => {
      registry.register(new MockUrls());
      expect(registry.has('mock')).toBe(true);
    });

    it('should return false for unregistered', () => {
      expect(registry.has('mock')).toBe(false);
    });
  });

  describe('list', () => {
    it('should return empty array initially', () => {
      expect(registry.list()).toEqual([]);
    });

    it('should return registered names', () => {
      registry.register(new MockUrls());
      registry.register(new AmazonUrls());
      
      const names = registry.list();
      expect(names).toContain('mock');
      expect(names).toContain('amazon');
    });
  });

  describe('all', () => {
    it('should return all helpers', () => {
      const mock = new MockUrls();
      const amazon = new AmazonUrls();
      
      registry.register(mock);
      registry.register(amazon);
      
      const all = registry.all();
      expect(all).toContain(mock);
      expect(all).toContain(amazon);
    });
  });
});
