/**
 * ClawCart OpenClaw Skill
 * 
 * Simple cart tracking + Share a Cart extension integration.
 */

import { ClawCart } from '@clawcart/core';

export const skillConfig = {
  name: 'clawcart',
  description: 'Build and share shopping carts via Share a Cart extension',
  version: '0.2.0',
  
  tools: [
    {
      name: 'clawcart_add',
      description: 'Add item to shopping cart',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Item name' },
          quantity: { type: 'number', default: 1 },
          price: { type: 'number', description: 'Price per item (optional)' },
          notes: { type: 'string', description: 'Notes about the item' },
        },
        required: ['name'],
      },
    },
    {
      name: 'clawcart_remove',
      description: 'Remove item from cart by ID',
      inputSchema: {
        type: 'object',
        properties: {
          itemId: { type: 'string', description: 'Item ID to remove' },
        },
        required: ['itemId'],
      },
    },
    {
      name: 'clawcart_cart',
      description: 'Get current cart contents',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'clawcart_clear',
      description: 'Clear all items from cart',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'clawcart_share',
      description: 'Share cart via Share a Cart extension (requires browser)',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'clawcart_instructions',
      description: 'Get manual instructions for sharing cart',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
  ],
};

// Skill state
let currentCart: ClawCart | null = null;

function getCart(): ClawCart {
  if (!currentCart) {
    currentCart = new ClawCart();
  }
  return currentCart;
}

/**
 * Tool handlers
 */
export async function handleTool(
  toolName: string,
  params: Record<string, unknown>,
  context?: { browser?: unknown }
): Promise<unknown> {
  const cart = getCart();
  
  switch (toolName) {
    case 'clawcart_add': {
      const item = cart.addItem({
        name: params.name as string,
        quantity: (params.quantity as number) || 1,
        price: params.price as number | undefined,
        notes: params.notes as string | undefined,
      });
      return { 
        added: item,
        cart: cart.toSimple(),
      };
    }
    
    case 'clawcart_remove': {
      const removed = cart.removeItem(params.itemId as string);
      return {
        removed,
        cart: cart.toSimple(),
      };
    }
    
    case 'clawcart_cart': {
      return cart.toSimple();
    }
    
    case 'clawcart_clear': {
      cart.clear();
      return { cleared: true };
    }
    
    case 'clawcart_share': {
      if (!context?.browser) {
        return {
          success: false,
          error: 'Browser context required for share. Use clawcart_instructions for manual steps.',
          instructions: cart.getShareInstructions(),
        };
      }
      // Cast to BrowserContext - OpenClaw provides compatible interface
      const result = await cart.share(context.browser as any);
      return result;
    }
    
    case 'clawcart_instructions': {
      return {
        instructions: cart.getShareInstructions(),
        itemCount: cart.itemCount,
      };
    }
    
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

export { ClawCart };
