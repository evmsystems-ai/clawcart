/**
 * ClawCart OpenClaw Skill
 * 
 * Exposes ClawCart functionality as OpenClaw tools.
 */

import { ClawCart } from '@clawcart/core';

export const skillConfig = {
  name: 'clawcart',
  description: 'Build and share shopping carts across 200+ retailers',
  version: '0.1.0',
  
  tools: [
    {
      name: 'clawcart_search',
      description: 'Search for products across retailers',
      inputSchema: {
        type: 'object',
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
        type: 'object',
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
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'clawcart_share',
      description: 'Generate shareable cart link',
      inputSchema: {
        type: 'object',
        properties: {
          message: { type: 'string', description: 'Message to include with share' },
        },
      },
    },
    {
      name: 'clawcart_clear',
      description: 'Clear the cart',
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
  params: Record<string, unknown>
): Promise<unknown> {
  const cart = getCart();
  
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
        cart: cart.getCart(),
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
    
    case 'clawcart_clear': {
      currentCart = new ClawCart();
      return { cleared: true };
    }
    
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

export { ClawCart };
