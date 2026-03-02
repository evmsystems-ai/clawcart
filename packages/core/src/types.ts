/**
 * ClawCart Core Types
 */

// ============================================
// Cart Types
// ============================================

export type CartStatus = 'draft' | 'shared' | 'approved' | 'purchased' | 'expired';

export interface Cart {
  id: string;
  name?: string;
  status: CartStatus;
  items: CartItem[];
  
  // Computed totals
  subtotal: number;
  estimatedShipping: number;
  estimatedTax: number;
  total: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface CartItem {
  id: string;
  retailer: string;
  productId: string;
  
  // Product info
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  
  // Media
  imageUrl: string;
  productUrl: string;
  
  // Availability
  inStock: boolean;
  estimatedDelivery?: string;
  
  // Alternatives at other retailers
  alternatives: ProductMatch[];
}

export interface CartItemInput {
  query?: string;
  productId?: string;
  asin?: string;
  upc?: string;
  quantity?: number;
  retailer?: string;
}

// ============================================
// Product Types
// ============================================

export interface Product {
  id: string;
  retailer: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  currency: string;
  imageUrl: string;
  productUrl: string;
  inStock: boolean;
  rating?: number;
  reviewCount?: number;
  category?: string;
  brand?: string;
}

export interface ProductMatch {
  retailer: string;
  productId: string;
  name: string;
  price: number;
  inStock: boolean;
  url: string;
  confidence: number; // 0-1, how confident this is the same product
}

export interface SearchOptions {
  maxResults?: number;
  priceRange?: { min?: number; max?: number };
  sortBy?: 'relevance' | 'price_low' | 'price_high' | 'rating';
  inStockOnly?: boolean;
}

// ============================================
// Retailer Adapter Types
// ============================================

export interface RetailerAdapter {
  readonly name: string;
  readonly displayName: string;
  readonly supportsApi: boolean;
  
  // Search
  search(query: string, options?: SearchOptions): Promise<Product[]>;
  
  // Single product
  getProduct(productId: string): Promise<Product | null>;
  
  // Build cart URL for checkout
  buildCartUrl(items: CartItem[]): Promise<string>;
  
  // Check availability
  checkAvailability(productId: string): Promise<AvailabilityStatus>;
}

export interface AvailabilityStatus {
  inStock: boolean;
  quantity?: number;
  estimatedDelivery?: string;
  price?: number; // Current price (may differ from cached)
}

// ============================================
// Price Optimizer Types
// ============================================

export interface OptimizedCart {
  // Best single-retailer option
  singleRetailer: {
    retailer: string;
    items: CartItem[];
    total: number;
    savings: number;
  };
  
  // Best multi-retailer option
  multiRetailer: {
    byRetailer: Record<string, CartItem[]>;
    total: number;
    savings: number;
  };
  
  // Recommendation
  recommended: 'single' | 'multi';
  reason: string;
}

// ============================================
// Share Service Types
// ============================================

export interface ShareLink {
  id: string;
  url: string;
  shortUrl?: string;
  expiresAt: Date;
  cart: Cart;
}

export interface ShareOptions {
  expiresIn?: number; // seconds
  requireApproval?: boolean;
  notifyEmail?: string[];
  message?: string;
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'modified' | 'purchased';

export interface SharedCart extends ShareLink {
  status: ApprovalStatus;
  sharedWith: string[];
  approvedBy?: string;
  approvedAt?: Date;
}

// ============================================
// Intent Parser Types
// ============================================

export interface ShoppingIntent {
  intent: 'build_cart' | 'add_item' | 'find_product' | 'compare_prices';
  constraints?: {
    budget?: { max?: number; currency?: string };
    retailer?: string;
    context?: string;
  };
  items: CartItemInput[];
  rawPrompt: string;
}

// ============================================
// Configuration Types
// ============================================

export type BrowserMode = 'none' | 'local' | 'remote' | 'deferred' | 'hybrid';

export interface BrowserConfig {
  mode: BrowserMode;
  local?: {
    headless?: boolean;
    timeout?: number;
    userAgent?: string;
  };
  remote?: {
    endpoint: string;
    apiKey?: string;
  };
  retries?: number;
  retryDelay?: number;
}

export interface ClawCartConfig {
  retailers?: string[];
  defaultRetailer?: string;
  browser?: BrowserConfig;
  apiKeys?: Record<string, string>;
}
