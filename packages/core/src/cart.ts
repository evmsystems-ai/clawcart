/**
 * ClawCart - Local cart state + Share a Cart extension automation
 * 
 * This is a thin wrapper for OpenClaw agents to:
 * 1. Track cart items locally
 * 2. Navigate to retailer and trigger Share a Cart extension
 * 3. Capture the generated share link
 */

import type {
  Cart,
  CartItem,
  CartItemInput,
  CartStatus,
  ClawCartConfig,
  BrowserContext,
  ShareResult,
  SimpleCart,
} from './types';

/**
 * Generate a simple unique ID
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * ClawCart - Simple cart tracking + Share a Cart extension
 */
export class ClawCart {
  private config: ClawCartConfig;
  private cart: Cart;

  constructor(config: ClawCartConfig = {}) {
    this.config = {
      retailer: 'amazon',
      extension: {
        shareButtonSelector: '#share-a-cart-button, .share-a-cart-btn, [data-share-cart]',
        timeoutMs: 10000,
      },
      ...config,
    };
    
    this.cart = this.createEmptyCart();
  }

  // ============================================
  // Static Factory Methods
  // ============================================

  /**
   * Create cart from simple item list (agent-friendly)
   */
  static fromItems(items: CartItemInput[], retailer?: string): ClawCart {
    const cart = new ClawCart({ retailer });
    items.forEach(item => cart.addItem(item));
    return cart;
  }

  /**
   * Create cart from simple object (for deserialization)
   */
  static fromSimple(simple: SimpleCart): ClawCart {
    const cart = new ClawCart({ retailer: simple.retailer });
    simple.items.forEach(item => cart.addItem({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));
    return cart;
  }

  // ============================================
  // Cart Management
  // ============================================

  /**
   * Add item to cart
   */
  addItem(input: CartItemInput): CartItem {
    const item: CartItem = {
      id: generateId(),
      name: input.name,
      quantity: input.quantity ?? 1,
      price: input.price,
      imageUrl: undefined,
      productUrl: input.productUrl,
      productId: input.productId,
      notes: input.notes,
    };
    
    this.cart.items.push(item);
    this.updateTotals();
    
    return item;
  }

  /**
   * Remove item from cart by ID
   */
  removeItem(itemId: string): boolean {
    const index = this.cart.items.findIndex(item => item.id === itemId);
    if (index === -1) return false;
    
    this.cart.items.splice(index, 1);
    this.updateTotals();
    return true;
  }

  /**
   * Update item quantity
   */
  updateQuantity(itemId: string, quantity: number): boolean {
    const item = this.cart.items.find(i => i.id === itemId);
    if (!item) return false;
    
    if (quantity <= 0) {
      return this.removeItem(itemId);
    }
    
    item.quantity = quantity;
    this.updateTotals();
    return true;
  }

  /**
   * Clear all items
   */
  clear(): void {
    this.cart.items = [];
    this.updateTotals();
  }

  /**
   * Set cart name
   */
  setName(name: string): void {
    this.cart.name = name;
  }

  // ============================================
  // Cart Accessors
  // ============================================

  /**
   * Get current cart state
   */
  getCart(): Cart {
    return { ...this.cart };
  }

  /**
   * Get cart items
   */
  get items(): CartItem[] {
    return [...this.cart.items];
  }

  /**
   * Get estimated total
   */
  get total(): number {
    return this.cart.estimatedTotal;
  }

  /**
   * Get item count
   */
  get itemCount(): number {
    return this.cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Get retailer
   */
  get retailer(): string | undefined {
    return this.cart.retailer;
  }

  // ============================================
  // Share a Cart Extension Integration
  // ============================================

  /**
   * Share cart using Share a Cart browser extension
   * 
   * Prerequisites:
   * - Share a Cart extension must be installed in browser
   * - Items should already be in the retailer's cart
   * - Browser should be on a supported retailer page
   * 
   * @param browser - Browser automation context (Playwright, Puppeteer, or OpenClaw)
   * @returns ShareResult with the share URL if successful
   */
  async share(browser: BrowserContext): Promise<ShareResult> {
    try {
      const selector = this.config.extension?.shareButtonSelector ?? 
        '#share-a-cart-button, .share-a-cart-btn, [data-share-cart]';
      const timeout = this.config.extension?.timeoutMs ?? 10000;

      // Wait for Share a Cart extension button to appear
      await browser.waitForSelector(selector, { timeout });
      
      // Click the share button
      await browser.click(selector);
      
      // Wait for the share modal/popup to appear and extract URL
      // The extension typically shows a modal with the share link
      const shareModalSelector = '.share-a-cart-modal, #share-cart-modal, [data-share-modal]';
      await browser.waitForSelector(shareModalSelector, { timeout });
      
      // Extract the share URL from the modal
      const shareUrl = await browser.evaluate(() => {
        // Try common patterns for where the share link appears
        const linkInput = document.querySelector<HTMLInputElement>(
          '.share-a-cart-modal input[type="text"], ' +
          '#share-cart-modal input, ' +
          '[data-share-url]'
        );
        if (linkInput?.value) return linkInput.value;
        
        const linkText = document.querySelector(
          '.share-a-cart-modal .share-link, ' +
          '#share-cart-url'
        );
        if (linkText?.textContent) return linkText.textContent.trim();
        
        return null;
      });

      if (!shareUrl) {
        return {
          success: false,
          error: 'Could not extract share URL from extension modal',
        };
      }

      this.cart.status = 'shared';
      this.cart.updatedAt = new Date();

      return {
        success: true,
        shareUrl,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to share cart',
      };
    }
  }

  /**
   * Generate instructions for manually sharing (no browser automation)
   */
  getShareInstructions(): string {
    const retailerUrl = this.getRetailerUrl();
    return [
      `To share your cart via Share a Cart:`,
      ``,
      `1. Install Share a Cart extension: https://share-a-cart.com`,
      `2. Go to ${retailerUrl}`,
      `3. Add these items to your cart:`,
      ...this.cart.items.map(item => `   - ${item.name} (qty: ${item.quantity})`),
      `4. Click the Share a Cart extension icon`,
      `5. Copy the generated share link`,
    ].join('\n');
  }

  // ============================================
  // Browser Automation Helpers
  // ============================================

  /**
   * Navigate to retailer's cart page
   */
  async navigateToCart(browser: BrowserContext): Promise<void> {
    const cartUrl = this.getRetailerUrl();
    await browser.goto(cartUrl);
  }

  /**
   * Navigate to retailer search for an item
   * Agent should then help user find and add the item
   */
  async searchForItem(browser: BrowserContext, query: string): Promise<string> {
    const searchUrls: Record<string, string> = {
      amazon: `https://www.amazon.com/s?k=${encodeURIComponent(query)}`,
      walmart: `https://www.walmart.com/search?q=${encodeURIComponent(query)}`,
      target: `https://www.target.com/s?searchTerm=${encodeURIComponent(query)}`,
      costco: `https://www.costco.com/CatalogSearch?keyword=${encodeURIComponent(query)}`,
    };
    const url = searchUrls[this.cart.retailer ?? 'amazon'] ?? searchUrls.amazon;
    await browser.goto(url);
    return url;
  }

  /**
   * Build all items in cart - navigates to each search
   * Returns list of search URLs for the agent to process
   */
  getSearchUrls(): Array<{ item: string; url: string }> {
    const retailer = this.cart.retailer ?? 'amazon';
    const baseUrls: Record<string, string> = {
      amazon: 'https://www.amazon.com/s?k=',
      walmart: 'https://www.walmart.com/search?q=',
      target: 'https://www.target.com/s?searchTerm=',
      costco: 'https://www.costco.com/CatalogSearch?keyword=',
    };
    const base = baseUrls[retailer] ?? baseUrls.amazon;
    
    return this.cart.items.map(item => ({
      item: item.name,
      url: `${base}${encodeURIComponent(item.name)}`,
    }));
  }

  // ============================================
  // Serialization
  // ============================================

  /**
   * Export cart as JSON
   */
  toJSON(): string {
    return JSON.stringify(this.cart, null, 2);
  }

  /**
   * Export as simple cart (agent-friendly)
   */
  toSimple(): SimpleCart {
    return {
      items: this.cart.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      retailer: this.cart.retailer,
      total: this.cart.estimatedTotal,
    };
  }

  // ============================================
  // Private Helpers
  // ============================================

  private createEmptyCart(): Cart {
    return {
      id: generateId(),
      status: 'draft' as CartStatus,
      items: [],
      retailer: this.config.retailer,
      subtotal: 0,
      estimatedTotal: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private updateTotals(): void {
    this.cart.subtotal = this.cart.items.reduce(
      (sum, item) => sum + (item.price ?? 0) * item.quantity,
      0
    );
    
    // Simple estimate - actual total depends on retailer (tax, shipping)
    this.cart.estimatedTotal = this.cart.subtotal;
    this.cart.updatedAt = new Date();
  }

  private getRetailerUrl(): string {
    const urls: Record<string, string> = {
      amazon: 'https://www.amazon.com/cart',
      walmart: 'https://www.walmart.com/cart',
      target: 'https://www.target.com/cart',
      costco: 'https://www.costco.com/cart',
    };
    return urls[this.cart.retailer ?? 'amazon'] ?? 'the retailer website';
  }
}
