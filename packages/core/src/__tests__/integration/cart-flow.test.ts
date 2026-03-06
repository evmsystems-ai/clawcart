/**
 * Integration Tests: End-to-End Cart Flows
 * 
 * Tests complete user workflows from cart creation through sharing.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ClawCart } from '../../cart';
import { AmazonUrls } from '../../adapters/amazon';
import { MockUrls } from '../../adapters/mock';
import { UrlRegistry } from '../../adapters/registry';
import type { BrowserContext, SimpleCart } from '../../types';

describe('Integration: End-to-End Cart Flow', () => {
  describe('Create Cart → Add Items → Generate Share URL', () => {
    it('should complete full shopping flow with Amazon', async () => {
      // Step 1: Create a cart for school supplies
      const cart = new ClawCart({ retailer: 'amazon' });
      cart.setName('Back to School 2024');

      // Step 2: Add multiple items
      const item1 = cart.addItem({
        name: 'Crayola Crayons 64-count',
        quantity: 2,
        price: 5.99,
        productId: 'B00000J0S4',
        productUrl: 'https://amazon.com/dp/B00000J0S4',
      });

      const item2 = cart.addItem({
        name: 'Ticonderoga Pencils #2 Yellow',
        quantity: 3,
        price: 7.49,
        productUrl: 'https://amazon.com/dp/B00006IFAM',
      });

      const item3 = cart.addItem({
        name: 'Elmers Glue Sticks 6-pack',
        quantity: 1,
        price: 4.29,
      });

      // Verify cart state
      expect(cart.items).toHaveLength(3);
      expect(cart.itemCount).toBe(6); // 2 + 3 + 1
      expect(cart.getCart().name).toBe('Back to School 2024');
      expect(cart.retailer).toBe('amazon');

      // Verify totals are calculated correctly
      // (2 * 5.99) + (3 * 7.49) + (1 * 4.29) = 11.98 + 22.47 + 4.29 = 38.74
      expect(cart.total).toBeCloseTo(38.74, 2);

      // Step 3: Generate share URL (mocked browser)
      const mockBrowser = createMockBrowser('https://share-a-cart.com/c/ABC123');
      const result = await cart.share(mockBrowser);

      // Verify sharing succeeded
      expect(result.success).toBe(true);
      expect(result.shareUrl).toBe('https://share-a-cart.com/c/ABC123');
      expect(cart.getCart().status).toBe('shared');

      // Verify browser interactions
      expect(mockBrowser.waitForSelector).toHaveBeenCalled();
      expect(mockBrowser.click).toHaveBeenCalled();
    });

    it('should handle flow when extension is not available', async () => {
      const cart = ClawCart.fromItems([
        { name: 'Notebook', quantity: 5, price: 2.99 },
        { name: 'Folders', quantity: 4, price: 1.49 },
      ], 'amazon');

      // Extension not found - timeout
      const mockBrowser = createMockBrowserWithError('Extension timeout');
      const result = await cart.share(mockBrowser);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Extension timeout');
      expect(cart.getCart().status).toBe('draft'); // Still draft
    });

    it('should provide manual instructions as fallback', () => {
      const cart = ClawCart.fromItems([
        { name: 'Crayons', quantity: 2 },
        { name: 'Markers', quantity: 1 },
      ], 'amazon');

      const instructions = cart.getShareInstructions();

      expect(instructions).toContain('Share a Cart');
      expect(instructions).toContain('share-a-cart.com');
      expect(instructions).toContain('amazon.com/cart');
      expect(instructions).toContain('Crayons');
      expect(instructions).toContain('qty: 2');
      expect(instructions).toContain('Markers');
      expect(instructions).toContain('qty: 1');
    });
  });

  describe('Cart Serialization and Restoration', () => {
    it('should serialize and restore cart via JSON', () => {
      const original = ClawCart.fromItems([
        { name: 'Item A', quantity: 2, price: 10.00 },
        { name: 'Item B', quantity: 1, price: 15.00 },
      ], 'amazon');
      original.setName('Test Cart');

      // Serialize
      const json = original.toJSON();
      const parsed = JSON.parse(json);

      // Verify serialized data
      expect(parsed.items).toHaveLength(2);
      expect(parsed.name).toBe('Test Cart');
      expect(parsed.retailer).toBe('amazon');
      expect(parsed.subtotal).toBe(35.00);
    });

    it('should serialize and restore via SimpleCart', () => {
      const original = ClawCart.fromItems([
        { name: 'Product 1', quantity: 3, price: 9.99 },
        { name: 'Product 2', quantity: 2, price: 14.99 },
      ], 'target');

      // Convert to simple format
      const simple: SimpleCart = original.toSimple();

      // Verify simple format
      expect(simple.items).toHaveLength(2);
      expect(simple.retailer).toBe('target');
      expect(simple.total).toBeCloseTo(59.95, 2);

      // Restore from simple
      const restored = ClawCart.fromSimple(simple);

      expect(restored.items).toHaveLength(2);
      expect(restored.retailer).toBe('target');
      expect(restored.total).toBeCloseTo(59.95, 2);
    });
  });

  describe('Cart Modifications During Flow', () => {
    it('should handle adding items incrementally', async () => {
      const cart = new ClawCart({ retailer: 'amazon' });

      // Add items one by one, checking state after each
      cart.addItem({ name: 'Item 1', price: 10.00 });
      expect(cart.itemCount).toBe(1);
      expect(cart.total).toBe(10.00);

      cart.addItem({ name: 'Item 2', price: 20.00, quantity: 2 });
      expect(cart.itemCount).toBe(3);
      expect(cart.total).toBe(50.00);

      cart.addItem({ name: 'Item 3', price: 5.00, quantity: 3 });
      expect(cart.itemCount).toBe(6);
      expect(cart.total).toBe(65.00);
    });

    it('should handle removing items mid-flow', async () => {
      const cart = new ClawCart({ retailer: 'amazon' });

      const item1 = cart.addItem({ name: 'Keep This', price: 10.00 });
      const item2 = cart.addItem({ name: 'Remove This', price: 50.00 });
      const item3 = cart.addItem({ name: 'Keep This Too', price: 15.00 });

      expect(cart.total).toBe(75.00);

      // Remove middle item
      const removed = cart.removeItem(item2.id);
      expect(removed).toBe(true);
      expect(cart.items).toHaveLength(2);
      expect(cart.total).toBe(25.00);

      // Verify remaining items
      const itemNames = cart.items.map(i => i.name);
      expect(itemNames).toContain('Keep This');
      expect(itemNames).toContain('Keep This Too');
      expect(itemNames).not.toContain('Remove This');
    });

    it('should handle quantity updates before sharing', async () => {
      const cart = new ClawCart({ retailer: 'amazon' });
      
      const item = cart.addItem({ name: 'Adjustable Item', price: 5.00, quantity: 1 });
      expect(cart.total).toBe(5.00);

      // Increase quantity
      cart.updateQuantity(item.id, 5);
      expect(cart.total).toBe(25.00);
      expect(cart.itemCount).toBe(5);

      // Decrease quantity
      cart.updateQuantity(item.id, 2);
      expect(cart.total).toBe(10.00);
      expect(cart.itemCount).toBe(2);
    });

    it('should handle clearing cart and rebuilding', async () => {
      const cart = new ClawCart({ retailer: 'amazon' });
      cart.setName('Original List');

      cart.addItem({ name: 'Old Item 1', price: 10.00 });
      cart.addItem({ name: 'Old Item 2', price: 20.00 });
      expect(cart.items).toHaveLength(2);

      // Clear and rebuild
      cart.clear();
      expect(cart.items).toHaveLength(0);
      expect(cart.total).toBe(0);
      expect(cart.getCart().name).toBe('Original List'); // Name preserved

      // Add new items
      cart.addItem({ name: 'New Item 1', price: 15.00 });
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].name).toBe('New Item 1');
    });
  });
});

// Helper: Create mock browser that succeeds
function createMockBrowser(shareUrl: string): BrowserContext {
  return {
    goto: vi.fn(),
    navigate: vi.fn(),
    click: vi.fn(),
    waitForSelector: vi.fn().mockResolvedValue(undefined),
    evaluate: vi.fn().mockResolvedValue(shareUrl),
    getUrl: vi.fn().mockResolvedValue('https://www.amazon.com/cart'),
  };
}

// Helper: Create mock browser that fails
function createMockBrowserWithError(errorMessage: string): BrowserContext {
  return {
    goto: vi.fn(),
    navigate: vi.fn(),
    click: vi.fn(),
    waitForSelector: vi.fn().mockRejectedValue(new Error(errorMessage)),
    evaluate: vi.fn(),
    getUrl: vi.fn(),
  };
}
