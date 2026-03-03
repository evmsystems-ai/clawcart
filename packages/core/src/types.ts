/**
 * ClawCart Core Types
 * 
 * Simplified for Share a Cart extension integration.
 * ClawCart = local cart state + browser automation to trigger extension.
 */

// ============================================
// Cart Types
// ============================================

export type CartStatus = 'draft' | 'shared' | 'imported';

export interface Cart {
  id: string;
  name?: string;
  status: CartStatus;
  items: CartItem[];
  retailer?: string;
  
  // Computed totals
  subtotal: number;
  estimatedTotal: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  name: string;
  quantity: number;
  
  // Optional product details (if known)
  price?: number;
  imageUrl?: string;
  productUrl?: string;
  productId?: string;
  
  // Notes for agent/human
  notes?: string;
}

export interface CartItemInput {
  name: string;
  quantity?: number;
  price?: number;
  productUrl?: string;
  productId?: string;
  notes?: string;
}

// ============================================
// Share a Cart Extension Types
// ============================================

export interface ShareResult {
  success: boolean;
  shareUrl?: string;
  error?: string;
}

export interface ImportResult {
  success: boolean;
  itemsImported: number;
  error?: string;
}

// ============================================
// Browser Automation Types
// ============================================

export interface BrowserContext {
  // Browser automation interface (e.g., Playwright, Puppeteer, OpenClaw browser)
  navigate(url: string): Promise<void>;
  click(selector: string): Promise<void>;
  waitForSelector(selector: string, options?: { timeout?: number }): Promise<void>;
  evaluate<T>(fn: () => T): Promise<T>;
  getUrl(): Promise<string>;
}

// ============================================
// Retailer URL Helpers
// ============================================

export interface RetailerUrls {
  readonly name: string;
  readonly displayName: string;
  
  // URL builders
  getHomeUrl(): string;
  getCartUrl(): string;
  getProductUrl(productId: string): string;
  getSearchUrl(query: string): string;
}

// ============================================
// Configuration Types
// ============================================

export interface ClawCartConfig {
  /** Default retailer for new carts */
  retailer?: string;
  
  /** Share a Cart extension settings */
  extension?: {
    /** Button selector to trigger share */
    shareButtonSelector?: string;
    /** How long to wait for extension UI */
    timeoutMs?: number;
  };
}

// ============================================
// Agent-Friendly Types
// ============================================

/** Simple cart for agents to pass around */
export interface SimpleCart {
  items: Array<{
    name: string;
    quantity: number;
    price?: number;
  }>;
  retailer?: string;
  total?: number;
}
