/**
 * ClawCart Core
 * 
 * Simple cart tracking + Share a Cart browser extension integration.
 * 
 * @example
 * ```typescript
 * import { ClawCart } from '@clawcart/core';
 * 
 * // Create a cart with items
 * const cart = ClawCart.fromItems([
 *   { name: 'Crayons 24-count', quantity: 2 },
 *   { name: '#2 Pencils', quantity: 1 },
 * ], 'amazon');
 * 
 * // Get share instructions (manual approach)
 * console.log(cart.getShareInstructions());
 * 
 * // Or with browser automation:
 * // const result = await cart.share(browserContext);
 * ```
 */

// Main class
export { ClawCart } from './cart';

// Types
export type {
  Cart,
  CartItem,
  CartItemInput,
  CartStatus,
  ShareResult,
  ImportResult,
  BrowserContext,
  RetailerUrls,
  ClawCartConfig,
  SimpleCart,
} from './types';

// URL helpers
export {
  UrlRegistry,
  urlRegistry,
  RetailerUrlHelper,
  MockUrls,
  AmazonUrls,
} from './adapters';
