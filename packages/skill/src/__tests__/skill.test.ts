import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleTool, skillConfig } from '../index';

describe('ClawCart Skill', () => {
  beforeEach(() => {
    // Clear cart state between tests by calling clear
    handleTool('clawcart_clear', {});
  });

  describe('skillConfig', () => {
    it('should have correct name', () => {
      expect(skillConfig.name).toBe('clawcart');
    });

    it('should have tools defined', () => {
      expect(skillConfig.tools.length).toBeGreaterThan(0);
    });

    it('should have add tool', () => {
      const addTool = skillConfig.tools.find(t => t.name === 'clawcart_add');
      expect(addTool).toBeDefined();
      expect(addTool?.inputSchema.required).toContain('name');
    });
  });

  describe('clawcart_add', () => {
    it('should add item to cart', async () => {
      const result = await handleTool('clawcart_add', {
        name: 'Crayons',
        quantity: 2,
        price: 2.99,
      }) as any;

      expect(result.added).toBeDefined();
      expect(result.added.name).toBe('Crayons');
      expect(result.added.quantity).toBe(2);
      expect(result.cart.items).toHaveLength(1);
    });

    it('should default quantity to 1', async () => {
      const result = await handleTool('clawcart_add', {
        name: 'Pencils',
      }) as any;

      expect(result.added.quantity).toBe(1);
    });

    it('should include notes', async () => {
      const result = await handleTool('clawcart_add', {
        name: 'Art supplies',
        notes: 'Any brand',
      }) as any;

      expect(result.added.notes).toBe('Any brand');
    });
  });

  describe('clawcart_remove', () => {
    it('should remove item from cart', async () => {
      const added = await handleTool('clawcart_add', { name: 'Item' }) as any;
      
      const result = await handleTool('clawcart_remove', {
        itemId: added.added.id,
      }) as any;

      expect(result.removed).toBe(true);
    });

    it('should return false for non-existent item', async () => {
      const result = await handleTool('clawcart_remove', {
        itemId: 'nonexistent',
      }) as any;

      expect(result.removed).toBe(false);
    });
  });

  describe('clawcart_cart', () => {
    it('should return cart contents', async () => {
      await handleTool('clawcart_add', { name: 'Item 1' });
      await handleTool('clawcart_add', { name: 'Item 2' });

      const result = await handleTool('clawcart_cart', {}) as any;

      expect(result.items).toHaveLength(2);
    });

    it('should return empty cart initially', async () => {
      const result = await handleTool('clawcart_cart', {}) as any;
      expect(result.items).toHaveLength(0);
    });
  });

  describe('clawcart_clear', () => {
    it('should clear all items', async () => {
      await handleTool('clawcart_add', { name: 'Item 1' });
      await handleTool('clawcart_add', { name: 'Item 2' });

      const result = await handleTool('clawcart_clear', {}) as any;
      expect(result.cleared).toBe(true);

      const cart = await handleTool('clawcart_cart', {}) as any;
      expect(cart.items).toHaveLength(0);
    });
  });

  describe('clawcart_share', () => {
    it('should return error without browser context', async () => {
      await handleTool('clawcart_add', { name: 'Item' });

      const result = await handleTool('clawcart_share', {}) as any;

      expect(result.success).toBe(false);
      expect(result.error).toContain('Browser context required');
      expect(result.instructions).toBeDefined();
    });
  });

  describe('clawcart_instructions', () => {
    it('should return share instructions', async () => {
      await handleTool('clawcart_add', { name: 'Crayons', quantity: 2 });

      const result = await handleTool('clawcart_instructions', {}) as any;

      expect(result.instructions).toContain('Share a Cart');
      expect(result.instructions).toContain('Crayons');
      expect(result.itemCount).toBe(2);
    });
  });

  describe('unknown tool', () => {
    it('should throw error for unknown tool', async () => {
      await expect(handleTool('unknown_tool', {}))
        .rejects.toThrow('Unknown tool');
    });
  });
});
