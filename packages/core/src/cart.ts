import { randomUUID as uuid } from 'crypto';
import type {
  Cart,
  CartItem,
  CartItemInput,
  CartStatus,
  ClawCartConfig,
  Product,
  SearchOptions,
  ShareLink,
  ShareOptions,
  ShoppingIntent,
} from './types';
import { AdapterRegistry } from './adapters/registry';

/**
 * Generate a simple unique ID
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * ClawCart - Main SDK class for building and sharing shopping carts
 */
export class ClawCart {
  private config: ClawCartConfig;
  private cart: Cart;
  private registry: AdapterRegistry;

  constructor(config: ClawCartConfig = {}) {
    this.config = {
      retailers: ['amazon', 'walmart', 'target'],
      defaultRetailer: 'amazon',
      browser: { mode: 'hybrid' },
      ...config,
    };
    
    this.registry = new AdapterRegistry();
    this.cart = this.createEmptyCart();
  }

  /**
   * Create a cart from natural language prompt
   */
  static async fromPrompt(options: {
    prompt: string;
    retailer?: string;
    budget?: number;
  }): Promise<ClawCart> {
    const cart = new ClawCart({
      defaultRetailer: options.retailer,
    });
    
    // Parse intent (simplified - in production, use LLM)
    const intent = await cart.parseIntent(options.prompt);
    
    // Add items from parsed intent
    for (const item of intent.items) {
      await cart.addItem(item);
    }
    
    return cart;
  }

  /**
   * Create a cart from a saved recipe
   */
  static async fromRecipe(recipe: {
    name: string;
    retailer: string;
    items: CartItemInput[];
  }): Promise<ClawCart> {
    const cart = new ClawCart({
      defaultRetailer: recipe.retailer,
    });
    
    cart.cart.name = recipe.name;
    
    for (const item of recipe.items) {
      await cart.addItem(item);
    }
    
    return cart;
  }

  /**
   * Parse natural language into shopping intent
   */
  private async parseIntent(prompt: string): Promise<ShoppingIntent> {
    // Simplified parsing - in production, use LLM
    // Extract budget if mentioned
    const budgetMatch = prompt.match(/\$(\d+)/);
    const budget = budgetMatch ? parseInt(budgetMatch[1]) : undefined;
    
    // For now, return a basic intent
    // Real implementation would use GPT/Claude to parse
    return {
      intent: 'build_cart',
      constraints: {
        budget: budget ? { max: budget, currency: 'USD' } : undefined,
        context: prompt,
      },
      items: [{ query: prompt }],
      rawPrompt: prompt,
    };
  }

  /**
   * Search for products
   */
  async search(query: string, options?: SearchOptions): Promise<Product[]> {
    const retailer = this.config.defaultRetailer || 'amazon';
    const adapter = this.registry.get(retailer);
    
    if (!adapter) {
      throw new Error(`No adapter found for retailer: ${retailer}`);
    }
    
    return adapter.search(query, options);
  }

  /**
   * Add item to cart
   */
  async addItem(input: CartItemInput): Promise<CartItem> {
    const retailer = input.retailer || this.config.defaultRetailer || 'amazon';
    const adapter = this.registry.get(retailer);
    
    if (!adapter) {
      throw new Error(`No adapter found for retailer: ${retailer}`);
    }
    
    let product: Product | null = null;
    
    // Try to find product by ID first
    if (input.productId || input.asin) {
      const id = input.productId || input.asin!;
      product = await adapter.getProduct(id);
    }
    
    // Fall back to search
    if (!product && input.query) {
      const results = await adapter.search(input.query, { maxResults: 1 });
      product = results[0] || null;
    }
    
    if (!product) {
      throw new Error(`Could not find product: ${input.query || input.productId}`);
    }
    
    const cartItem: CartItem = {
      id: generateId(),
      retailer: product.retailer,
      productId: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      quantity: input.quantity || 1,
      imageUrl: product.imageUrl,
      productUrl: product.productUrl,
      inStock: product.inStock,
      alternatives: [],
    };
    
    this.cart.items.push(cartItem);
    this.updateTotals();
    
    return cartItem;
  }

  /**
   * Remove item from cart
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
   * Get current cart
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
   * Get cart total
   */
  get total(): number {
    return this.cart.total;
  }

  /**
   * Generate shareable link
   */
  async share(options?: ShareOptions): Promise<string> {
    // In production, this would call Share Service API
    const shareId = generateId();
    const expiresIn = options?.expiresIn || 7 * 24 * 60 * 60; // 7 days default
    
    const shareLink: ShareLink = {
      id: shareId,
      url: `https://clawcart.io/c/${shareId}`,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      cart: this.cart,
    };
    
    // TODO: Persist to Share Service
    console.log('Share link created:', shareLink.url);
    
    return shareLink.url;
  }

  /**
   * Export cart as JSON
   */
  toJSON(): string {
    return JSON.stringify(this.cart, null, 2);
  }

  /**
   * Create empty cart
   */
  private createEmptyCart(): Cart {
    return {
      id: generateId(),
      status: 'draft' as CartStatus,
      items: [],
      subtotal: 0,
      estimatedShipping: 0,
      estimatedTax: 0,
      total: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Update cart totals
   */
  private updateTotals(): void {
    this.cart.subtotal = this.cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    
    // Estimate shipping (free over $35 for most retailers)
    this.cart.estimatedShipping = this.cart.subtotal >= 35 ? 0 : 5.99;
    
    // Estimate tax (rough average)
    this.cart.estimatedTax = this.cart.subtotal * 0.08;
    
    this.cart.total = 
      this.cart.subtotal + 
      this.cart.estimatedShipping + 
      this.cart.estimatedTax;
    
    this.cart.updatedAt = new Date();
  }
}
