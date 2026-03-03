import { describe, it, expect, beforeEach } from 'vitest';
import { handleToolCall, MCP_TOOLS } from '../index';

describe('ClawCart MCP Server', () => {
  // Use unique session ID for each test to ensure isolation
  let sessionId: string;

  beforeEach(async () => {
    sessionId = `test-session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  });

  describe('MCP_TOOLS', () => {
    it('should have tools defined', () => {
      expect(MCP_TOOLS.length).toBeGreaterThan(0);
    });

    it('should have add tool', () => {
      const addTool = MCP_TOOLS.find(t => t.name === 'clawcart_add');
      expect(addTool).toBeDefined();
      expect(addTool?.inputSchema.required).toContain('name');
    });

    it('should have cart tool', () => {
      const cartTool = MCP_TOOLS.find(t => t.name === 'clawcart_cart');
      expect(cartTool).toBeDefined();
    });
  });

  describe('clawcart_add', () => {
    it('should add item to cart', async () => {
      const result = await handleToolCall('clawcart_add', {
        name: 'Crayons',
        quantity: 2,
        price: 2.99,
      }, sessionId) as any;

      expect(result.added).toBeDefined();
      expect(result.added.name).toBe('Crayons');
      expect(result.cartTotal).toBeCloseTo(5.98, 2);
      // itemCount is total quantity of all items (not number of line items)
      expect(result.itemCount).toBe(2);
    });

    it('should default quantity to 1', async () => {
      const result = await handleToolCall('clawcart_add', {
        name: 'Pencils',
      }, sessionId) as any;

      expect(result.added.quantity).toBe(1);
    });
  });

  describe('clawcart_remove', () => {
    it('should remove item from cart', async () => {
      const added = await handleToolCall('clawcart_add', { 
        name: 'Item' 
      }, sessionId) as any;
      
      const result = await handleToolCall('clawcart_remove', {
        itemId: added.added.id,
      }, sessionId) as any;

      expect(result.removed).toBe(true);
      expect(result.itemCount).toBe(0);
    });

    it('should return false for non-existent item', async () => {
      const result = await handleToolCall('clawcart_remove', {
        itemId: 'nonexistent',
      }, sessionId) as any;

      expect(result.removed).toBe(false);
    });
  });

  describe('clawcart_cart', () => {
    it('should return simple cart format', async () => {
      await handleToolCall('clawcart_add', { 
        name: 'Item 1', 
        price: 5.00 
      }, sessionId);
      
      await handleToolCall('clawcart_add', { 
        name: 'Item 2', 
        price: 3.00 
      }, sessionId);

      const result = await handleToolCall('clawcart_cart', {}, sessionId) as any;

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(8.00);
    });
  });

  describe('clawcart_clear', () => {
    it('should clear all items', async () => {
      await handleToolCall('clawcart_add', { name: 'Item 1' }, sessionId);
      await handleToolCall('clawcart_add', { name: 'Item 2' }, sessionId);

      const result = await handleToolCall('clawcart_clear', {}, sessionId) as any;
      expect(result.cleared).toBe(true);

      const cart = await handleToolCall('clawcart_cart', {}, sessionId) as any;
      expect(cart.items).toHaveLength(0);
    });
  });

  describe('clawcart_instructions', () => {
    it('should return share instructions', async () => {
      await handleToolCall('clawcart_add', { 
        name: 'Crayons', 
        quantity: 2 
      }, sessionId);

      const result = await handleToolCall('clawcart_instructions', {}, sessionId) as any;

      expect(result.instructions).toContain('Share a Cart');
      expect(result.instructions).toContain('Crayons');
      expect(result.itemCount).toBe(2);
    });
  });

  describe('session isolation', () => {
    it('should isolate carts by session', async () => {
      await handleToolCall('clawcart_add', { name: 'Session 1 Item' }, 'session-1');
      await handleToolCall('clawcart_add', { name: 'Session 2 Item' }, 'session-2');

      const cart1 = await handleToolCall('clawcart_cart', {}, 'session-1') as any;
      const cart2 = await handleToolCall('clawcart_cart', {}, 'session-2') as any;

      expect(cart1.items[0].name).toBe('Session 1 Item');
      expect(cart2.items[0].name).toBe('Session 2 Item');
    });
  });

  describe('unknown tool', () => {
    it('should throw error for unknown tool', async () => {
      await expect(handleToolCall('unknown_tool', {}, sessionId))
        .rejects.toThrow('Unknown tool');
    });
  });
});
