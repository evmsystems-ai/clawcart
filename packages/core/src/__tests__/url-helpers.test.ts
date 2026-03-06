import { describe, it, expect, beforeEach } from 'vitest';
import { AmazonUrls } from '../adapters/amazon';
import { MockUrls } from '../adapters/mock';
import { WalmartUrls } from '../adapters/walmart';
import { TargetUrls } from '../adapters/target';
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

describe('WalmartUrls', () => {
  let walmart: WalmartUrls;

  beforeEach(() => {
    walmart = new WalmartUrls();
  });

  describe('properties', () => {
    it('should have correct name', () => {
      expect(walmart.name).toBe('walmart');
    });

    it('should have correct display name', () => {
      expect(walmart.displayName).toBe('Walmart');
    });
  });

  describe('getHomeUrl', () => {
    it('should return Walmart homepage', () => {
      expect(walmart.getHomeUrl()).toBe('https://www.walmart.com');
    });
  });

  describe('getCartUrl', () => {
    it('should return Walmart cart URL', () => {
      expect(walmart.getCartUrl()).toBe('https://www.walmart.com/cart');
    });
  });

  describe('getProductUrl', () => {
    it('should build product URL from numeric ID', () => {
      const url = walmart.getProductUrl('123456789');
      expect(url).toBe('https://www.walmart.com/ip/123456789');
    });

    it('should extract product ID from /ip/{slug}/{id} URL', () => {
      const url = walmart.getProductUrl('https://www.walmart.com/ip/some-product-name/123456789');
      expect(url).toBe('https://www.walmart.com/ip/123456789');
    });

    it('should extract product ID from /ip/{id} URL', () => {
      const url = walmart.getProductUrl('https://www.walmart.com/ip/123456789');
      expect(url).toBe('https://www.walmart.com/ip/123456789');
    });
  });

  describe('getSearchUrl', () => {
    it('should build search URL', () => {
      const url = walmart.getSearchUrl('crayons');
      expect(url).toContain('walmart.com/search');
      expect(url).toContain('q=crayons');
    });

    it('should encode search query', () => {
      const url = walmart.getSearchUrl('art supplies');
      // URLSearchParams encodes spaces as + (which is valid)
      expect(url).toContain('q=art+supplies');
    });
  });

  describe('getAddToCartUrl', () => {
    it('should build add-to-cart URL for single item', () => {
      const url = walmart.getAddToCartUrl([
        { productId: '123456789', quantity: 2 },
      ]);
      
      expect(url).toContain('walmart.com/cart');
      expect(url).toContain('action=AddToCart');
      expect(url).toContain('items=123456789%2C2');
    });

    it('should build add-to-cart URL for multiple items', () => {
      const url = walmart.getAddToCartUrl([
        { productId: '123456789', quantity: 1 },
        { productId: '987654321', quantity: 3 },
      ]);
      
      expect(url).toContain('action=AddToCart');
      // Items should be separated by ; (encoded as %3B)
      expect(url).toContain('items=123456789%2C1%3B987654321%2C3');
    });

    it('should default quantity to 1', () => {
      const url = walmart.getAddToCartUrl([
        { productId: '123456789' },
      ]);
      
      expect(url).toContain('items=123456789%2C1');
    });
  });

  describe('parseProductFromHtml', () => {
    it('should extract product ID from canonical URL', () => {
      const html = `
        <html>
          <head>
            <link rel="canonical" href="https://www.walmart.com/ip/some-product/123456789" />
          </head>
        </html>
      `;
      const result = walmart.parseProductFromHtml(html);
      expect(result.productId).toBe('123456789');
    });

    it('should extract product info from JSON-LD', () => {
      const html = `
        <html>
          <head>
            <script type="application/ld+json">
              {
                "@type": "Product",
                "name": "Test Product",
                "image": "https://example.com/image.jpg",
                "offers": {
                  "price": "19.99",
                  "availability": "https://schema.org/InStock"
                }
              }
            </script>
          </head>
        </html>
      `;
      const result = walmart.parseProductFromHtml(html);
      expect(result.name).toBe('Test Product');
      expect(result.price).toBe(19.99);
      expect(result.imageUrl).toBe('https://example.com/image.jpg');
      expect(result.inStock).toBe(true);
    });

    it('should extract from og:title if JSON-LD not available', () => {
      const html = `
        <html>
          <head>
            <meta property="og:title" content="Product Name" />
            <meta property="og:image" content="https://example.com/og-image.jpg" />
          </head>
        </html>
      `;
      const result = walmart.parseProductFromHtml(html);
      expect(result.name).toBe('Product Name');
      expect(result.imageUrl).toBe('https://example.com/og-image.jpg');
    });

    it('should handle malformed JSON-LD gracefully', () => {
      const html = `
        <html>
          <head>
            <script type="application/ld+json">{ invalid json </script>
            <meta property="og:title" content="Fallback Name" />
          </head>
        </html>
      `;
      const result = walmart.parseProductFromHtml(html);
      expect(result.name).toBe('Fallback Name');
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

describe('TargetUrls', () => {
  let target: TargetUrls;

  beforeEach(() => {
    target = new TargetUrls();
  });

  describe('properties', () => {
    it('should have correct name', () => {
      expect(target.name).toBe('target');
    });

    it('should have correct display name', () => {
      expect(target.displayName).toBe('Target');
    });
  });

  describe('getHomeUrl', () => {
    it('should return Target homepage', () => {
      expect(target.getHomeUrl()).toBe('https://www.target.com');
    });
  });

  describe('getCartUrl', () => {
    it('should return Target cart URL', () => {
      expect(target.getCartUrl()).toBe('https://www.target.com/cart');
    });
  });

  describe('getProductUrl', () => {
    it('should build product URL from TCIN', () => {
      const url = target.getProductUrl('12345678');
      expect(url).toBe('https://www.target.com/p/-/A-12345678');
    });

    it('should extract TCIN from product URL', () => {
      const url = target.getProductUrl('https://www.target.com/p/crayons-24ct/-/A-12345678');
      expect(url).toBe('https://www.target.com/p/-/A-12345678');
    });

    it('should extract TCIN from short URL', () => {
      const url = target.getProductUrl('https://www.target.com/p/-/A-87654321');
      expect(url).toBe('https://www.target.com/p/-/A-87654321');
    });

    it('should handle TCIN with query params', () => {
      const url = target.getProductUrl('https://www.target.com/p/-/A-12345678?preselect=54321');
      expect(url).toBe('https://www.target.com/p/-/A-12345678');
    });
  });

  describe('getSearchUrl', () => {
    it('should build search URL', () => {
      const url = target.getSearchUrl('crayons');
      expect(url).toContain('target.com/s');
      expect(url).toContain('searchTerm=crayons');
    });

    it('should encode search query', () => {
      const url = target.getSearchUrl('art supplies');
      expect(url).toContain('searchTerm=art+supplies');
    });
  });

  describe('getAddToCartUrl', () => {
    it('should build co-cart URL for single item', () => {
      const url = target.getAddToCartUrl([
        { tcin: '12345678', quantity: 2 },
      ]);
      
      expect(url).toBe('https://www.target.com/co-cart?items=12345678|2');
    });

    it('should build co-cart URL for multiple items', () => {
      const url = target.getAddToCartUrl([
        { tcin: '12345678', quantity: 1 },
        { tcin: '87654321', quantity: 3 },
      ]);
      
      expect(url).toBe('https://www.target.com/co-cart?items=12345678|1,87654321|3');
    });

    it('should default quantity to 1', () => {
      const url = target.getAddToCartUrl([
        { tcin: '12345678' },
      ]);
      
      expect(url).toBe('https://www.target.com/co-cart?items=12345678|1');
    });

    it('should extract TCIN from URLs in items', () => {
      const url = target.getAddToCartUrl([
        { tcin: 'https://www.target.com/p/-/A-12345678', quantity: 2 },
      ]);
      
      expect(url).toBe('https://www.target.com/co-cart?items=12345678|2');
    });
  });
});
