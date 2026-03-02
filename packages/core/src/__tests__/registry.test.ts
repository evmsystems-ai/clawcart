import { describe, it, expect, beforeEach } from 'vitest';
import { AdapterRegistry } from '../adapters/registry';
import { MockAdapter } from '../adapters/mock';
import { BaseAdapter } from '../adapters/base';
import type { Product, CartItem, SearchOptions } from '../types';

// Create a simple test adapter
class TestAdapter extends BaseAdapter {
  readonly name = 'test';
  readonly displayName = 'Test Store';
  readonly supportsApi = true;

  async search(_query: string, _options?: SearchOptions): Promise<Product[]> {
    return [];
  }

  async getProduct(_productId: string): Promise<Product | null> {
    return null;
  }

  async buildCartUrl(_items: CartItem[]): Promise<string> {
    return 'https://test.com/cart';
  }
}

describe('AdapterRegistry', () => {
  let registry: AdapterRegistry;

  beforeEach(() => {
    registry = new AdapterRegistry();
  });

  describe('register', () => {
    it('should register an adapter', () => {
      const adapter = new MockAdapter();
      registry.register(adapter);
      
      expect(registry.has('mock')).toBe(true);
    });

    it('should allow registering multiple adapters', () => {
      const mockAdapter = new MockAdapter();
      const testAdapter = new TestAdapter();
      
      registry.register(mockAdapter);
      registry.register(testAdapter);
      
      expect(registry.has('mock')).toBe(true);
      expect(registry.has('test')).toBe(true);
    });

    it('should overwrite existing adapter with same name', () => {
      const adapter1 = new MockAdapter();
      const adapter2 = new MockAdapter();
      
      registry.register(adapter1);
      registry.register(adapter2);
      
      // Should still only have one mock adapter
      expect(registry.list()).toHaveLength(1);
    });
  });

  describe('get', () => {
    it('should return registered adapter', () => {
      const adapter = new MockAdapter();
      registry.register(adapter);
      
      const retrieved = registry.get('mock');
      
      expect(retrieved).toBe(adapter);
    });

    it('should return undefined for unregistered adapter', () => {
      const retrieved = registry.get('nonexistent');
      
      expect(retrieved).toBeUndefined();
    });

    it('should be case-insensitive', () => {
      const adapter = new MockAdapter();
      registry.register(adapter);
      
      expect(registry.get('mock')).toBe(adapter);
      expect(registry.get('MOCK')).toBe(adapter);
      expect(registry.get('Mock')).toBe(adapter);
    });
  });

  describe('has', () => {
    it('should return true for registered adapter', () => {
      registry.register(new MockAdapter());
      
      expect(registry.has('mock')).toBe(true);
    });

    it('should return false for unregistered adapter', () => {
      expect(registry.has('mock')).toBe(false);
    });

    it('should be case-insensitive', () => {
      registry.register(new MockAdapter());
      
      expect(registry.has('mock')).toBe(true);
      expect(registry.has('MOCK')).toBe(true);
      expect(registry.has('MoCk')).toBe(true);
    });
  });

  describe('list', () => {
    it('should return empty array when no adapters registered', () => {
      expect(registry.list()).toEqual([]);
    });

    it('should return list of registered adapter names', () => {
      registry.register(new MockAdapter());
      registry.register(new TestAdapter());
      
      const names = registry.list();
      
      expect(names).toContain('mock');
      expect(names).toContain('test');
      expect(names).toHaveLength(2);
    });

    it('should return lowercase names', () => {
      registry.register(new MockAdapter());
      
      const names = registry.list();
      
      expect(names[0]).toBe('mock');
    });
  });

  describe('all', () => {
    it('should return empty array when no adapters registered', () => {
      expect(registry.all()).toEqual([]);
    });

    it('should return all registered adapters', () => {
      const mockAdapter = new MockAdapter();
      const testAdapter = new TestAdapter();
      
      registry.register(mockAdapter);
      registry.register(testAdapter);
      
      const adapters = registry.all();
      
      expect(adapters).toContain(mockAdapter);
      expect(adapters).toContain(testAdapter);
      expect(adapters).toHaveLength(2);
    });
  });
});

describe('BaseAdapter', () => {
  let adapter: TestAdapter;

  beforeEach(() => {
    adapter = new TestAdapter();
  });

  describe('normalizeQuery', () => {
    it('should lowercase query', () => {
      // Access protected method via test adapter
      const normalized = (adapter as any).normalizeQuery('HELLO World');
      
      expect(normalized).toBe('hello world');
    });

    it('should trim whitespace', () => {
      const normalized = (adapter as any).normalizeQuery('  hello  ');
      
      expect(normalized).toBe('hello');
    });

    it('should collapse multiple spaces', () => {
      const normalized = (adapter as any).normalizeQuery('hello    world');
      
      expect(normalized).toBe('hello world');
    });
  });

  describe('buildUrl', () => {
    it('should build URL with params', () => {
      const url = (adapter as any).buildUrl('https://example.com/search', {
        q: 'test',
        page: 1,
      });
      
      expect(url).toContain('https://example.com/search');
      expect(url).toContain('q=test');
      expect(url).toContain('page=1');
    });

    it('should handle empty params', () => {
      const url = (adapter as any).buildUrl('https://example.com/search', {});
      
      expect(url).toBe('https://example.com/search');
    });
  });

  describe('checkAvailability', () => {
    it('should return inStock false for null product', async () => {
      const status = await adapter.checkAvailability('nonexistent');
      
      expect(status.inStock).toBe(false);
      expect(status.price).toBeUndefined();
    });
  });
});
