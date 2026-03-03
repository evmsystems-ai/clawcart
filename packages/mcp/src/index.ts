/**
 * ClawCart MCP Server
 * 
 * Implements Model Context Protocol for ClawCart tools.
 * Simple cart tracking + Share a Cart extension integration.
 */

import { ClawCart } from '@clawcart/core';

export const MCP_TOOLS = [
  {
    name: 'clawcart_add',
    description: 'Add item to shopping cart',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Item name' },
        quantity: { type: 'number', default: 1 },
        price: { type: 'number', description: 'Price per item (optional)' },
        notes: { type: 'string', description: 'Notes for the item (optional)' },
      },
      required: ['name'],
    },
  },
  {
    name: 'clawcart_remove',
    description: 'Remove item from cart by ID',
    inputSchema: {
      type: 'object' as const,
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
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'clawcart_clear',
    description: 'Clear all items from cart',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'clawcart_instructions',
    description: 'Get instructions for sharing cart via Share a Cart extension',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
];

// Cart state per session
const carts = new Map<string, ClawCart>();

function getCart(sessionId: string = 'default'): ClawCart {
  if (!carts.has(sessionId)) {
    carts.set(sessionId, new ClawCart());
  }
  return carts.get(sessionId)!;
}

/**
 * Handle MCP tool call
 */
export async function handleToolCall(
  toolName: string,
  params: Record<string, unknown>,
  sessionId?: string
): Promise<unknown> {
  const cart = getCart(sessionId);
  
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
        cartTotal: cart.total,
        itemCount: cart.itemCount,
      };
    }
    
    case 'clawcart_remove': {
      const removed = cart.removeItem(params.itemId as string);
      return { 
        removed,
        itemCount: cart.itemCount,
      };
    }
    
    case 'clawcart_cart': {
      return cart.toSimple();
    }
    
    case 'clawcart_clear': {
      cart.clear();
      return { cleared: true };
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
