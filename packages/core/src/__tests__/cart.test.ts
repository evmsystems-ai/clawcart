import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ClawCart } from '../cart';
import type { Cart, CartItem, BrowserContext } from '../types';

describe('ClawCart', () => {
  let cart: ClawCart;

  beforeEach(() => {
    cart = new ClawCart({ retailer: 'amazon' });
  });

  describe('constructor', () => {
    it('should create cart with default config', () => {
      const defaultCart = new ClawCart();
      const state = defaultCart.getCart();
      
      expect(state).toBeDefined();
      expect(state.id).toBeDefined();
      expect(state.status).toBe('draft');
      expect(state.items).toEqual([]);
      expect(state.subtotal).toBe(0);
      expect(state.estimatedTotal).toBe(0);
    });

    it('should create cart with custom retailer', () => {
      const customCart = new ClawCart({ retailer: 'target' });
      expect(customCart.retailer).toBe('target');
    });

    it('should initialize with empty items', () => {
      expect(cart.items).toEqual([]);
      expect(cart.total).toBe(0);
      expect(cart.itemCount).toBe(0);
    });
  });

  describe('fromItems (static)', () => {
    it('should create cart from item list', () => {
      const cart = ClawCart.fromItems([
        { name: 'Crayons', quantity: 2, price: 2.99 },
        { name: 'Pencils', quantity: 1, price: 3.49 },
      ], 'walmart');

      expect(cart.items).toHaveLength(2);
      expect(cart.retailer).toBe('walmart');
      expect(cart.itemCount).toBe(3);
    });

    it('should default quantity to 1', () => {
      const cart = ClawCart.fromItems([{ name: 'Notebook' }]);
      expect(cart.items[0].quantity).toBe(1);
    });
  });

  describe('fromSimple (static)', () => {
    it('should create cart from simple object', () => {
      const cart = ClawCart.fromSimple({
        items: [
          { name: 'Glue', quantity: 2, price: 1.99 },
        ],
        retailer: 'target',
        total: 3.98,
      });

      expect(cart.items).toHaveLength(1);
      expect(cart.retailer).toBe('target');
    });
  });

  describe('addItem', () => {
    it('should add item with name and quantity', () => {
      const item = cart.addItem({ name: 'Crayons', quantity: 2 });
      
      expect(item).toBeDefined();
      expect(item.name).toBe('Crayons');
      expect(item.quantity).toBe(2);
      expect(item.id).toBeDefined();
      expect(cart.items).toHaveLength(1);
    });

    it('should default quantity to 1', () => {
      const item = cart.addItem({ name: 'Pencils' });
      expect(item.quantity).toBe(1);
    });

    it('should include optional price', () => {
      const item = cart.addItem({ name: 'Folders', price: 4.99 });
      expect(item.price).toBe(4.99);
    });

    it('should include optional product URL', () => {
      const item = cart.addItem({
        name: 'Scissors',
        productUrl: 'https://amazon.com/dp/B123',
      });
      expect(item.productUrl).toBe('https://amazon.com/dp/B123');
    });

    it('should include notes', () => {
      const item = cart.addItem({
        name: 'Art supplies',
        notes: 'Any brand is fine',
      });
      expect(item.notes).toBe('Any brand is fine');
    });

    it('should update totals after adding item', () => {
      cart.addItem({ name: 'Item 1', price: 10.00, quantity: 2 });
      cart.addItem({ name: 'Item 2', price: 5.00, quantity: 1 });
      
      const state = cart.getCart();
      expect(state.subtotal).toBe(25.00);
      expect(state.estimatedTotal).toBe(25.00);
    });

    it('should generate unique item IDs', () => {
      const item1 = cart.addItem({ name: 'Item 1' });
      const item2 = cart.addItem({ name: 'Item 2' });
      
      expect(item1.id).not.toBe(item2.id);
    });
  });

  describe('removeItem', () => {
    it('should remove existing item', () => {
      const item = cart.addItem({ name: 'Crayons' });
      
      const result = cart.removeItem(item.id);
      
      expect(result).toBe(true);
      expect(cart.items).toHaveLength(0);
    });

    it('should return false for non-existent item', () => {
      const result = cart.removeItem('nonexistent');
      expect(result).toBe(false);
    });

    it('should update totals after removal', () => {
      const item = cart.addItem({ name: 'Crayons', price: 2.99, quantity: 2 });
      cart.removeItem(item.id);
      
      expect(cart.total).toBe(0);
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', () => {
      const item = cart.addItem({ name: 'Crayons' });
      
      const result = cart.updateQuantity(item.id, 5);
      
      expect(result).toBe(true);
      expect(cart.items[0].quantity).toBe(5);
    });

    it('should remove item when quantity is 0', () => {
      const item = cart.addItem({ name: 'Crayons' });
      cart.updateQuantity(item.id, 0);
      
      expect(cart.items).toHaveLength(0);
    });

    it('should remove item when quantity is negative', () => {
      const item = cart.addItem({ name: 'Crayons' });
      cart.updateQuantity(item.id, -1);
      
      expect(cart.items).toHaveLength(0);
    });

    it('should return false for non-existent item', () => {
      const result = cart.updateQuantity('nonexistent', 5);
      expect(result).toBe(false);
    });

    it('should update totals after quantity change', () => {
      const item = cart.addItem({ name: 'Crayons', price: 2.99 });
      cart.updateQuantity(item.id, 3);
      
      expect(cart.total).toBeCloseTo(8.97, 2);
    });
  });

  describe('clear', () => {
    it('should remove all items', () => {
      cart.addItem({ name: 'Item 1' });
      cart.addItem({ name: 'Item 2' });
      
      cart.clear();
      
      expect(cart.items).toHaveLength(0);
      expect(cart.total).toBe(0);
    });
  });

  describe('setName', () => {
    it('should set cart name', () => {
      cart.setName('Back to School');
      expect(cart.getCart().name).toBe('Back to School');
    });
  });

  describe('getCart', () => {
    it('should return copy of cart state', () => {
      const state = cart.getCart();
      
      expect(state.id).toBeDefined();
      expect(state.status).toBe('draft');
      expect(state.createdAt).toBeInstanceOf(Date);
      expect(state.updatedAt).toBeInstanceOf(Date);
    });

    it('should return immutable copy', () => {
      const state1 = cart.getCart();
      const state2 = cart.getCart();
      
      expect(state1).not.toBe(state2);
    });
  });

  describe('items getter', () => {
    it('should return copy of items array', () => {
      cart.addItem({ name: 'Crayons' });
      
      const items1 = cart.items;
      const items2 = cart.items;
      
      expect(items1).not.toBe(items2);
      expect(items1).toEqual(items2);
    });
  });

  describe('itemCount getter', () => {
    it('should return total quantity', () => {
      cart.addItem({ name: 'Item 1', quantity: 2 });
      cart.addItem({ name: 'Item 2', quantity: 3 });
      
      expect(cart.itemCount).toBe(5);
    });
  });

  describe('share', () => {
    it('should trigger Share a Cart extension and return URL', async () => {
      cart.addItem({ name: 'Crayons' });
      
      const mockBrowser: BrowserContext = {
        navigate: vi.fn(),
        click: vi.fn(),
        waitForSelector: vi.fn(),
        evaluate: vi.fn().mockResolvedValue('https://share-a-cart.com/c/abc123'),
        getUrl: vi.fn().mockResolvedValue('https://amazon.com/cart'),
      };

      const result = await cart.share(mockBrowser);

      expect(result.success).toBe(true);
      expect(result.shareUrl).toBe('https://share-a-cart.com/c/abc123');
      expect(mockBrowser.waitForSelector).toHaveBeenCalled();
      expect(mockBrowser.click).toHaveBeenCalled();
    });

    it('should handle extension not found', async () => {
      const mockBrowser: BrowserContext = {
        navigate: vi.fn(),
        click: vi.fn(),
        waitForSelector: vi.fn().mockRejectedValue(new Error('Timeout')),
        evaluate: vi.fn(),
        getUrl: vi.fn(),
      };

      const result = await cart.share(mockBrowser);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Timeout');
    });

    it('should handle missing share URL', async () => {
      const mockBrowser: BrowserContext = {
        navigate: vi.fn(),
        click: vi.fn(),
        waitForSelector: vi.fn(),
        evaluate: vi.fn().mockResolvedValue(null),
        getUrl: vi.fn(),
      };

      const result = await cart.share(mockBrowser);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Could not extract share URL');
    });

    it('should update cart status on success', async () => {
      cart.addItem({ name: 'Crayons' });
      
      const mockBrowser: BrowserContext = {
        navigate: vi.fn(),
        click: vi.fn(),
        waitForSelector: vi.fn(),
        evaluate: vi.fn().mockResolvedValue('https://share-a-cart.com/c/xyz'),
        getUrl: vi.fn(),
      };

      await cart.share(mockBrowser);

      expect(cart.getCart().status).toBe('shared');
    });
  });

  describe('getShareInstructions', () => {
    it('should return manual share instructions', () => {
      cart.addItem({ name: 'Crayons', quantity: 2 });
      cart.addItem({ name: 'Pencils', quantity: 1 });
      
      const instructions = cart.getShareInstructions();
      
      expect(instructions).toContain('Share a Cart');
      expect(instructions).toContain('Crayons');
      expect(instructions).toContain('qty: 2');
      expect(instructions).toContain('Pencils');
      expect(instructions).toContain('amazon.com/cart');
    });
  });

  describe('toJSON', () => {
    it('should export cart as JSON string', () => {
      cart.addItem({ name: 'Crayons', quantity: 2, price: 2.99 });
      
      const json = cart.toJSON();
      const parsed = JSON.parse(json);
      
      expect(parsed.id).toBeDefined();
      expect(parsed.items).toHaveLength(1);
      expect(parsed.items[0].name).toBe('Crayons');
    });
  });

  describe('toSimple', () => {
    it('should export as simple cart object', () => {
      cart.addItem({ name: 'Crayons', quantity: 2, price: 2.99 });
      
      const simple = cart.toSimple();
      
      expect(simple.items).toHaveLength(1);
      expect(simple.items[0]).toEqual({
        name: 'Crayons',
        quantity: 2,
        price: 2.99,
      });
      expect(simple.retailer).toBe('amazon');
      expect(simple.total).toBeCloseTo(5.98, 2);
    });
  });

  describe('totals calculation', () => {
    it('should calculate subtotal correctly', () => {
      cart.addItem({ name: 'Item 1', price: 10.00, quantity: 2 });
      cart.addItem({ name: 'Item 2', price: 5.50, quantity: 3 });
      
      const state = cart.getCart();
      expect(state.subtotal).toBeCloseTo(36.50, 2);
    });

    it('should handle items without price', () => {
      cart.addItem({ name: 'Item 1', quantity: 2 });
      cart.addItem({ name: 'Item 2', price: 5.00, quantity: 1 });
      
      const state = cart.getCart();
      expect(state.subtotal).toBe(5.00);
    });

    it('should update timestamp on changes', async () => {
      const before = cart.getCart().updatedAt;
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      cart.addItem({ name: 'Item' });
      const after = cart.getCart().updatedAt;
      
      expect(after.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });
});
