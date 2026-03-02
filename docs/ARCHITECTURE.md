# ClawCart Architecture

This document describes how ClawCart works under the hood.

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLAWCART                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  User Input                                                          │
│  "Build 3rd grade supply list under $50"                            │
│           │                                                          │
│           ▼                                                          │
│  ┌─────────────────┐                                                │
│  │  Intent Parser  │  NLP → structured queries                      │
│  │   (LLM-based)   │  "3rd grade supply" → [pencils, crayons, ...]  │
│  └────────┬────────┘                                                │
│           │                                                          │
│           ▼                                                          │
│  ┌─────────────────┐     ┌─────────────────────────────────┐       │
│  │  Cart Builder   │────▶│     Retailer Adapter Layer      │       │
│  │                 │     │  ┌─────────┬─────────┬────────┐ │       │
│  │  - Search       │     │  │ Amazon  │ Walmart │ Target │ │       │
│  │  - Compare      │◀────│  │ Adapter │ Adapter │Adapter │ │       │
│  │  - Optimize     │     │  └─────────┴─────────┴────────┘ │       │
│  └────────┬────────┘     └─────────────────────────────────┘       │
│           │                                                          │
│           ▼                                                          │
│  ┌─────────────────┐                                                │
│  │ Price Optimizer │  Compare across retailers                      │
│  │                 │  Factor: shipping, Prime, coupons              │
│  └────────┬────────┘                                                │
│           │                                                          │
│           ▼                                                          │
│  ┌─────────────────┐                                                │
│  │  Share Service  │  Generate link, track approvals                │
│  │                 │  → clawcart.ai/c/abc123                        │
│  └────────┬────────┘                                                │
│           │                                                          │
│           ▼                                                          │
│  ┌─────────────────┐                                                │
│  │ Human Approval  │  Review → Approve → Checkout                   │
│  └─────────────────┘                                                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Intent Parser

Converts natural language into structured shopping intent.

**Input:**
```
"Build my kid's 3rd grade supply list under $50"
```

**Output:**
```typescript
{
  intent: 'build_cart',
  constraints: {
    budget: { max: 50, currency: 'USD' },
    context: '3rd grade supply list'
  },
  items: [
    { query: 'pencils #2', quantity: 24 },
    { query: 'crayons', quantity: 1 },
    { query: 'scissors blunt tip', quantity: 1 },
    { query: 'glue sticks', quantity: 4 },
    { query: 'folders pocket', quantity: 2 },
    // ... derived from "3rd grade supply list" context
  ]
}
```

**Implementation:** LLM-based (GPT-4, Claude) with few-shot examples for common intents.

### 2. Cart Builder

Coordinates product search and cart assembly.

```typescript
interface CartBuilder {
  // Build cart from parsed intent
  fromIntent(intent: ShoppingIntent): Promise<Cart>;
  
  // Build from explicit items
  fromItems(items: CartItemInput[]): Promise<Cart>;
  
  // Add single item to existing cart
  addItem(cart: Cart, item: CartItemInput): Promise<Cart>;
  
  // Remove item
  removeItem(cart: Cart, itemId: string): Promise<Cart>;
}
```

**Responsibilities:**
- Calls retailer adapters for product search
- Handles pagination and rate limiting
- Assembles cart object with alternatives

### 3. Retailer Adapter Layer

Unified interface for different retailers.

```typescript
interface RetailerAdapter {
  // Retailer identification
  readonly name: string;  // 'amazon', 'walmart', etc.
  readonly displayName: string;
  
  // Core operations
  search(query: string, options?: SearchOptions): Promise<Product[]>;
  getProduct(productId: string): Promise<Product | null>;
  
  // Cart operations
  buildCartUrl(items: CartItem[]): Promise<string>;
  
  // Availability check
  checkAvailability(productId: string): Promise<Availability>;
}

interface SearchOptions {
  maxResults?: number;
  priceRange?: { min?: number; max?: number };
  sortBy?: 'relevance' | 'price_low' | 'price_high' | 'rating';
}
```

**Adapter implementations:**

| Retailer | Method | Notes |
|----------|--------|-------|
| Amazon | Product Advertising API | Requires affiliate account |
| Walmart | Affiliate API | Public API available |
| Target | Browser automation | No public API |
| Costco | Browser automation | Membership required |

See [BROWSER-ACCESS.md](BROWSER-ACCESS.md) for browser automation patterns.

### 4. Price Optimizer

Compares prices across retailers and recommends optimal cart.

```typescript
interface PriceOptimizer {
  // Find best price for single item
  findBest(query: string, retailers?: string[]): Promise<ProductMatch[]>;
  
  // Optimize entire cart
  optimizeCart(cart: Cart): Promise<OptimizedCart>;
}

interface OptimizedCart {
  // Best single-retailer option (simpler checkout)
  singleRetailer: {
    retailer: string;
    items: CartItem[];
    total: number;
    savings: number;
  };
  
  // Best multi-retailer option (lowest price)
  multiRetailer: {
    byRetailer: Map<string, CartItem[]>;
    total: number;
    savings: number;
  };
  
  // Recommendation
  recommended: 'single' | 'multi';
  reason: string;
}
```

**Optimization factors:**
- Base price
- Shipping costs (free shipping thresholds)
- Membership benefits (Prime, Walmart+)
- Available coupons
- Estimated delivery time

### 5. Share Service

Handles cart persistence and sharing.

```typescript
interface ShareService {
  // Create shareable cart
  createShare(cart: Cart, options?: ShareOptions): Promise<ShareLink>;
  
  // Get cart by share ID
  getShare(shareId: string): Promise<SharedCart | null>;
  
  // Update approval status
  updateStatus(shareId: string, status: ApprovalStatus): Promise<void>;
  
  // List shares for user
  listShares(userId: string): Promise<SharedCart[]>;
}

interface ShareLink {
  id: string;
  url: string;  // https://clawcart.ai/c/{id}
  expiresAt: Date;
  cart: Cart;
}

type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'modified' | 'purchased';
```

## Data Models

### Cart

```typescript
interface Cart {
  id: string;
  name?: string;
  status: CartStatus;
  items: CartItem[];
  
  // Computed
  subtotal: number;
  estimatedShipping: number;
  estimatedTax: number;
  total: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

type CartStatus = 'draft' | 'shared' | 'approved' | 'purchased' | 'expired';
```

### Cart Item

```typescript
interface CartItem {
  id: string;
  retailer: string;
  productId: string;  // Retailer-specific SKU
  
  // Product info
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;  // If on sale
  quantity: number;
  
  // Media
  imageUrl: string;
  productUrl: string;
  
  // Availability
  inStock: boolean;
  estimatedDelivery?: string;
  
  // Alternatives (same product, different retailers)
  alternatives: ProductMatch[];
}

interface ProductMatch {
  retailer: string;
  productId: string;
  name: string;
  price: number;
  inStock: boolean;
  url: string;
}
```

## Integration Points

### OpenClaw Skill

ClawCart exposes itself as an OpenClaw skill:

```yaml
# skill.yaml
name: clawcart
description: Build and share shopping carts
tools:
  - name: search_products
    description: Search for products across retailers
  - name: add_to_cart
    description: Add item to shopping cart
  - name: optimize_cart
    description: Find best prices across retailers
  - name: share_cart
    description: Generate shareable cart link
  - name: get_cart
    description: Get current cart contents
```

### MCP Server

Standard MCP protocol for tool invocation:

```typescript
// MCP tool definitions
const tools = [
  {
    name: 'clawcart_search',
    description: 'Search for products',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        retailer: { type: 'string', enum: ['amazon', 'walmart', 'target', 'auto'] },
        maxResults: { type: 'number', default: 10 }
      },
      required: ['query']
    }
  },
  // ... more tools
];
```

### REST API

For non-MCP integrations:

```
POST /api/v1/carts              # Create cart
GET  /api/v1/carts/:id          # Get cart
PUT  /api/v1/carts/:id/items    # Update items
POST /api/v1/carts/:id/share    # Generate share link
GET  /api/v1/share/:shareId     # Get shared cart
POST /api/v1/search             # Product search
```

## Deployment

### As a Package

```typescript
import { ClawCart } from '@clawcart/core';

const cart = await ClawCart.fromPrompt({
  prompt: "office supplies for 10 people",
  budget: 200
});
```

### As a Service

```yaml
# docker-compose.yml
services:
  clawcart:
    image: ghcr.io/evmsystems-ai/clawcart:latest
    environment:
      - DATABASE_URL=postgres://...
      - REDIS_URL=redis://...
      - AMAZON_API_KEY=...
    ports:
      - "3000:3000"
```

### As an OpenClaw Skill

```bash
openclaw skills install clawcart
```

## Security Considerations

1. **No payment handling** — ClawCart builds carts, humans complete checkout
2. **No credential storage** — Users authenticate directly with retailers
3. **Cart expiration** — Shared carts expire after 7 days by default
4. **Rate limiting** — Retailer API calls are rate-limited to avoid abuse

## Future Enhancements

- [ ] Cart templates / recipes
- [ ] Recurring orders
- [ ] Group buying coordination
- [ ] Affiliate revenue tracking
- [ ] Checkout automation (with explicit user consent)
