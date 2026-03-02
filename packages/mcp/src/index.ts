/**
 * ClawCart MCP Server
 * 
 * Implements Model Context Protocol for ClawCart tools.
 */

import { ClawCart } from '@clawcart/core';

export const MCP_TOOLS = [
  {
    name: 'clawcart_search',
    description: 'Search for products across retailers',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Product search query' },
        retailer: { 
          type: 'string', 
          enum: ['amazon', 'walmart', 'target', 'auto'],
          default: 'auto'
        },
        maxResults: { type: 'number', default: 10 },
      },
      required: ['query'],
    },
  },
  {
    name: 'clawcart_add',
    description: 'Add item to shopping cart',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Product search or name' },
        productId: { type: 'string', description: 'Specific product ID' },
        quantity: { type: 'number', default: 1 },
      },
      required: [],
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
    name: 'clawcart_share',
    description: 'Generate shareable cart link',
    inputSchema: {
      type: 'object' as const,
      properties: {
        message: { type: 'string', description: 'Message to include with share' },
      },
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
    case 'clawcart_search': {
      const results = await cart.search(params.query as string, {
        maxResults: (params.maxResults as number) || 10,
      });
      return { products: results };
    }
    
    case 'clawcart_add': {
      const item = await cart.addItem({
        query: params.query as string,
        productId: params.productId as string,
        quantity: (params.quantity as number) || 1,
      });
      return { 
        added: item,
        cartTotal: cart.total,
        itemCount: cart.items.length,
      };
    }
    
    case 'clawcart_cart': {
      return cart.getCart();
    }
    
    case 'clawcart_share': {
      const url = await cart.share({
        message: params.message as string,
      });
      return { shareUrl: url };
    }
    
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

export { ClawCart };
