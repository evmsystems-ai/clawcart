/**
 * Integration Tests: Price Calculation
 * 
 * Tests accurate price totals across various scenarios.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ClawCart } from '../../cart';

describe('Integration: Price Calculation', () => {
  describe('Basic Price Totals', () => {
    it('should calculate total for single item with quantity', () => {
      const cart = ClawCart.fromItems([
        { name: 'Crayons', quantity: 3, price: 5.99 },
      ]);

      expect(cart.total).toBeCloseTo(17.97, 2);
      expect(cart.getCart().subtotal).toBeCloseTo(17.97, 2);
    });

    it('should calculate total for multiple items', () => {
      const cart = ClawCart.fromItems([
        { name: 'Item A', quantity: 2, price: 10.00 },
        { name: 'Item B', quantity: 1, price: 15.50 },
        { name: 'Item C', quantity: 4, price: 3.25 },
      ]);

      // (2 * 10) + (1 * 15.50) + (4 * 3.25) = 20 + 15.50 + 13 = 48.50
      expect(cart.total).toBeCloseTo(48.50, 2);
    });

    it('should handle items without prices', () => {
      const cart = ClawCart.fromItems([
        { name: 'Priced Item', quantity: 2, price: 10.00 },
        { name: 'No Price Item', quantity: 3 },
        { name: 'Another Priced', quantity: 1, price: 5.00 },
      ]);

      // Only priced items count: (2 * 10) + (1 * 5) = 25
      expect(cart.total).toBeCloseTo(25.00, 2);
    });

    it('should handle zero-priced items', () => {
      const cart = ClawCart.fromItems([
        { name: 'Free Item', quantity: 2, price: 0 },
        { name: 'Paid Item', quantity: 1, price: 10.00 },
      ]);

      expect(cart.total).toBeCloseTo(10.00, 2);
    });
  });

  describe('Decimal Precision', () => {
    it('should handle common price endings (.99, .49, etc)', () => {
      const cart = ClawCart.fromItems([
        { name: 'Item 1', quantity: 1, price: 9.99 },
        { name: 'Item 2', quantity: 1, price: 14.49 },
        { name: 'Item 3', quantity: 1, price: 3.99 },
      ]);

      // 9.99 + 14.49 + 3.99 = 28.47
      expect(cart.total).toBeCloseTo(28.47, 2);
    });

    it('should handle many small quantities without floating point errors', () => {
      const cart = new ClawCart();

      // Add 10 items at $0.10 each, quantity 1
      for (let i = 0; i < 10; i++) {
        cart.addItem({ name: `Item ${i}`, quantity: 1, price: 0.10 });
      }

      // Should be exactly $1.00, not 0.9999999... or 1.0000001
      expect(cart.total).toBeCloseTo(1.00, 2);
    });

    it('should maintain precision with large quantities', () => {
      const cart = ClawCart.fromItems([
        { name: 'Bulk Item', quantity: 999, price: 0.03 },
      ]);

      // 999 * 0.03 = 29.97
      expect(cart.total).toBeCloseTo(29.97, 2);
    });

    it('should handle mixed precision prices', () => {
      const cart = ClawCart.fromItems([
        { name: 'Exact', quantity: 1, price: 10.00 },
        { name: 'Cents', quantity: 2, price: 5.99 },
        { name: 'Complex', quantity: 3, price: 7.333 },
      ]);

      // 10.00 + 11.98 + 21.999 = 43.979
      expect(cart.total).toBeCloseTo(43.979, 2);
    });
  });

  describe('Dynamic Total Updates', () => {
    let cart: ClawCart;

    beforeEach(() => {
      cart = new ClawCart();
    });

    it('should update total when adding items', () => {
      expect(cart.total).toBe(0);

      cart.addItem({ name: 'Item 1', price: 10.00 });
      expect(cart.total).toBeCloseTo(10.00, 2);

      cart.addItem({ name: 'Item 2', price: 20.00 });
      expect(cart.total).toBeCloseTo(30.00, 2);

      cart.addItem({ name: 'Item 3', price: 5.00, quantity: 3 });
      expect(cart.total).toBeCloseTo(45.00, 2);
    });

    it('should update total when removing items', () => {
      const item1 = cart.addItem({ name: 'Item 1', price: 10.00 });
      const item2 = cart.addItem({ name: 'Item 2', price: 20.00 });
      cart.addItem({ name: 'Item 3', price: 15.00 });

      expect(cart.total).toBeCloseTo(45.00, 2);

      cart.removeItem(item2.id);
      expect(cart.total).toBeCloseTo(25.00, 2);

      cart.removeItem(item1.id);
      expect(cart.total).toBeCloseTo(15.00, 2);
    });

    it('should update total when changing quantity', () => {
      const item = cart.addItem({ name: 'Variable', price: 5.00, quantity: 1 });
      expect(cart.total).toBeCloseTo(5.00, 2);

      cart.updateQuantity(item.id, 5);
      expect(cart.total).toBeCloseTo(25.00, 2);

      cart.updateQuantity(item.id, 2);
      expect(cart.total).toBeCloseTo(10.00, 2);

      cart.updateQuantity(item.id, 0); // Removes item
      expect(cart.total).toBe(0);
    });

    it('should reset total when clearing cart', () => {
      cart.addItem({ name: 'Item 1', price: 100.00 });
      cart.addItem({ name: 'Item 2', price: 200.00 });
      expect(cart.total).toBeCloseTo(300.00, 2);

      cart.clear();
      expect(cart.total).toBe(0);
    });
  });

  describe('Large Cart Scenarios', () => {
    it('should handle cart with many items efficiently', () => {
      const cart = new ClawCart();
      let expectedTotal = 0;

      // Add 100 items
      for (let i = 0; i < 100; i++) {
        const price = (i % 10) + 0.99; // Prices from 0.99 to 9.99
        const quantity = (i % 5) + 1; // Quantities 1-5
        cart.addItem({ name: `Item ${i}`, price, quantity });
        expectedTotal += price * quantity;
      }

      expect(cart.items).toHaveLength(100);
      expect(cart.total).toBeCloseTo(expectedTotal, 1);
    });

    it('should handle high-value cart', () => {
      const cart = ClawCart.fromItems([
        { name: 'Expensive Item 1', quantity: 1, price: 999.99 },
        { name: 'Expensive Item 2', quantity: 2, price: 1499.99 },
        { name: 'Expensive Item 3', quantity: 1, price: 2999.99 },
      ]);

      // 999.99 + 2999.98 + 2999.99 = 6999.96
      expect(cart.total).toBeCloseTo(6999.96, 2);
    });

    it('should handle bulk quantities', () => {
      const cart = ClawCart.fromItems([
        { name: 'Bulk Item', quantity: 10000, price: 0.01 },
      ]);

      expect(cart.total).toBeCloseTo(100.00, 2);
      expect(cart.itemCount).toBe(10000);
    });
  });

  describe('Subtotal vs Estimated Total', () => {
    it('should have equal subtotal and estimatedTotal by default', () => {
      const cart = ClawCart.fromItems([
        { name: 'Item 1', quantity: 2, price: 10.00 },
        { name: 'Item 2', quantity: 1, price: 5.00 },
      ]);

      const state = cart.getCart();
      expect(state.subtotal).toBeCloseTo(25.00, 2);
      expect(state.estimatedTotal).toBeCloseTo(25.00, 2);
      expect(state.subtotal).toBe(state.estimatedTotal);
    });

    it('should track subtotal changes with cart modifications', () => {
      const cart = new ClawCart();
      
      cart.addItem({ name: 'Item', price: 10.00 });
      expect(cart.getCart().subtotal).toBeCloseTo(10.00, 2);

      cart.addItem({ name: 'Item 2', price: 20.00 });
      expect(cart.getCart().subtotal).toBeCloseTo(30.00, 2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty cart', () => {
      const cart = new ClawCart();
      
      expect(cart.total).toBe(0);
      expect(cart.items).toHaveLength(0);
      expect(cart.itemCount).toBe(0);
    });

    it('should handle single item with quantity 1', () => {
      const cart = ClawCart.fromItems([
        { name: 'Solo', price: 42.00 },
      ]);

      expect(cart.total).toBeCloseTo(42.00, 2);
      expect(cart.itemCount).toBe(1);
    });

    it('should handle all items without prices', () => {
      const cart = ClawCart.fromItems([
        { name: 'No Price 1', quantity: 5 },
        { name: 'No Price 2', quantity: 3 },
      ]);

      expect(cart.total).toBe(0);
      expect(cart.itemCount).toBe(8);
    });

    it('should handle negative-ish scenarios gracefully', () => {
      const cart = new ClawCart();
      const item = cart.addItem({ name: 'Item', price: 10.00, quantity: 5 });
      
      // Try to set negative quantity (should remove)
      cart.updateQuantity(item.id, -1);
      expect(cart.items).toHaveLength(0);
      expect(cart.total).toBe(0);
    });

    it('should preserve accuracy after multiple operations', () => {
      const cart = new ClawCart();
      
      // Complex sequence of operations
      const item1 = cart.addItem({ name: 'A', price: 9.99, quantity: 3 });
      const item2 = cart.addItem({ name: 'B', price: 14.49, quantity: 2 });
      const item3 = cart.addItem({ name: 'C', price: 5.00, quantity: 1 });
      
      // 29.97 + 28.98 + 5.00 = 63.95
      expect(cart.total).toBeCloseTo(63.95, 2);
      
      cart.updateQuantity(item1.id, 5);
      // 49.95 + 28.98 + 5.00 = 83.93
      expect(cart.total).toBeCloseTo(83.93, 2);
      
      cart.removeItem(item2.id);
      // 49.95 + 5.00 = 54.95
      expect(cart.total).toBeCloseTo(54.95, 2);
      
      cart.addItem({ name: 'D', price: 7.77, quantity: 7 });
      // 54.95 + 54.39 = 109.34
      expect(cart.total).toBeCloseTo(109.34, 2);
      
      cart.updateQuantity(item3.id, 3);
      // 49.95 + 15.00 + 54.39 = 119.34
      expect(cart.total).toBeCloseTo(119.34, 2);
    });
  });

  describe('SimpleCart Total Accuracy', () => {
    it('should export accurate total in SimpleCart', () => {
      const cart = ClawCart.fromItems([
        { name: 'Item 1', quantity: 2, price: 9.99 },
        { name: 'Item 2', quantity: 3, price: 4.49 },
      ]);

      const simple = cart.toSimple();
      
      // (2 * 9.99) + (3 * 4.49) = 19.98 + 13.47 = 33.45
      expect(simple.total).toBeCloseTo(33.45, 2);
    });

    it('should restore with same total from SimpleCart', () => {
      const original = ClawCart.fromItems([
        { name: 'A', quantity: 4, price: 12.99 },
        { name: 'B', quantity: 2, price: 8.50 },
      ]);

      const simple = original.toSimple();
      const restored = ClawCart.fromSimple(simple);

      expect(restored.total).toBeCloseTo(original.total, 2);
    });
  });
});
