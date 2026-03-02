# ClawCart PRD
## Voice-First Multi-Retailer Cart Building & Sharing

**Version:** 1.0  
**Date:** February 26, 2026  
**Status:** Discovery/Spec  
**Team:** Papi (Spec), Stu (Backend), Frontend TBD

---

## Executive Summary

ClawCart is an OpenClaw-powered shopping assistant that lets users build, optimize, and share shopping carts across 200+ retailers through natural language. Instead of browsing multiple sites, users simply describe what they need — the agent handles product discovery, price optimization, and cart sharing.

**Inspiration:** Share-a-Cart (share-a-cart.com) — Chrome extension with 200+ retailer support and cart sharing. Their biggest market is schools (back-to-school supply lists).

---

## Problem Statement

**Current pain points:**
1. Shopping across multiple retailers requires opening many tabs, comparing prices manually
2. Shared shopping (families, offices, groups) involves awkward copy-paste of links or screenshots
3. Reordering regular purchases (household supplies, office inventory) is repetitive
4. Teachers send supply lists → parents manually hunt down each item

**Opportunity:** AI agents can automate the research, comparison, and cart-building — users just approve and checkout.

---

## Target Use Cases

### 1. Back-to-School Assistant (Primary — Proven Market)
> "Build my kid's 3rd grade supply list under $50"

- Teacher posts supply list (PDF, text, photo)
- Parent's agent parses list → finds items across Amazon/Target/Walmart
- Optimizes for price, availability, Prime eligibility
- Shares cart for approval → one-click checkout

### 2. Business Procurement
> "Order Q2 office supplies, same as last quarter but swap the coffee brand"

- Office manager describes needs via chat/voice
- Agent builds cart from preferred vendors
- Shares with finance/approver for sign-off
- Tracks spend against budget

### 3. Gift Coordination
> "Coordinate a baby shower gift with these 5 people, $30 each max"

- Agent creates shared cart/registry
- Invites participants, tracks contributions
- Prevents duplicate purchases
- Handles group payment splitting

### 4. Household Restock
> "Reorder our usual Costco run"

- Agent learns household patterns
- Detects low inventory (via integrations or user input)
- Builds restock cart → shares with spouse for approval
- Schedules recurring orders

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLAWCART                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │    INTENT    │───▶│    CART      │───▶│    SHARE     │  │
│  │    PARSER    │    │   BUILDER    │    │   SERVICE    │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                   │                   │           │
│         ▼                   ▼                   ▼           │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   "3rd grade │    │    PRICE     │    │   MULTI-     │  │
│  │  supply list │    │  OPTIMIZER   │    │  RECIPIENT   │  │
│  │   under $50" │    │              │    │   SHARING    │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                             │                               │
│                             ▼                               │
│              ┌─────────────────────────────┐               │
│              │    RETAILER ADAPTER LAYER   │               │
│              │  Amazon │ Walmart │ Target  │               │
│              │  Costco │ 200+ retailers    │               │
│              └─────────────────────────────┘               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Services

| Service | Responsibility |
|---------|----------------|
| **Intent Parser** | NLP layer: natural language → structured product queries |
| **Cart Builder** | Takes product queries, searches retailers, builds optimized cart objects |
| **Price Optimizer** | Compares across retailers, factors shipping/membership/coupons |
| **Share Service** | Stores cart state, generates share links, handles approvals |
| **Retailer Adapters** | Normalize API/scraping interfaces for each retailer |

---

## Share-a-Cart Analysis

### What They Do Well
- 200+ retailer support (see `/assets/logos/` for icons)
- Simple UX: browser extension, one-click share
- Multi-cart merging (combine items from different stores)
- "AI-driven context extraction" for product matching

### Technical Findings (Stu's Reverse Engineering)

**Extension ID:** `hcjohblbkdgcoikaedjndgbcgcfoojmj`

**Key Endpoints:**
- `https://api.share-a-cart.com/v1/carts` — Cart CRUD
- `https://api.share-a-cart.com/v1/share` — Generate share links
- `https://api.share-a-cart.com/v1/import` — Import cart to retailer

**How It Works:**
1. Extension scrapes cart DOM on retailer site
2. Extracts: product name, SKU, price, quantity, image
3. Stores cart object in their backend
4. Share link contains cart ID
5. Recipient opens link → extension injects items into their cart

**Their Moat:**
- 200+ retailer DOM selectors maintained
- Cart injection scripts per retailer
- Years of edge case handling

### Our Angle
We don't need to rebuild their extension — we can:
1. **Use their share links** for checkout (if API allows)
2. **Build our own cart state** and integrate with their sharing
3. **Or** build native retailer integrations for top 10-20 stores

---

## MVP Scope

### Phase 1: Intent Parser + Cart Builder (Week 1-2)
- [ ] NLP intent parsing ("3rd grade supply list" → product queries)
- [ ] Product search integration (Amazon Product API, or scraping)
- [ ] Cart object model (items, quantities, prices, store)
- [ ] Basic price comparison (2-3 stores)

### Phase 2: Share Service (Week 2-3)
- [ ] Cart persistence (DB storage)
- [ ] Share link generation
- [ ] Approval workflow (approve/reject/modify)
- [ ] Multi-recipient support

### Phase 3: OpenClaw Integration (Week 3-4)
- [ ] MCP tools for cart operations
- [ ] Voice interface via OpenClaw
- [ ] Telegram/Discord bot commands
- [ ] Webhook notifications (cart shared, approved, etc.)

### Phase 4: Retailer Expansion (Ongoing)
- [ ] Top 20 retailer adapters
- [ ] Affiliate link integration (monetization)
- [ ] Checkout automation (stretch)

---

## Technical Decisions

### Stack
- **Backend:** Node.js / TypeScript
- **Database:** PostgreSQL (cart state, user prefs)
- **Cache:** Redis (product search cache)
- **Search:** Retailer APIs where available, Playwright scraping fallback
- **Agent Protocol:** MCP + REST API

### Data Model

```typescript
interface Cart {
  id: string
  userId: string
  name: string
  status: 'draft' | 'shared' | 'approved' | 'purchased'
  items: CartItem[]
  totalEstimate: number
  createdAt: Date
  sharedWith: string[] // user IDs or emails
}

interface CartItem {
  id: string
  retailer: string // 'amazon' | 'walmart' | 'target' | ...
  productId: string // retailer-specific SKU
  name: string
  price: number
  quantity: number
  url: string
  imageUrl: string
  alternatives: ProductMatch[] // other retailers with same item
}

interface ProductMatch {
  retailer: string
  productId: string
  price: number
  availability: 'in_stock' | 'limited' | 'out_of_stock'
  primeEligible?: boolean
}
```

---

## Success Metrics

### MVP (Week 4)
- [ ] Parse 10 different supply list formats
- [ ] Search products across Amazon + Walmart + Target
- [ ] Generate shareable cart links
- [ ] Complete 1 end-to-end flow: intent → cart → share → approve

### Month 1
- [ ] 100 carts created
- [ ] 50 shared carts
- [ ] 10 completed purchases
- [ ] 5 retailer adapters

### Month 3
- [ ] 1K MAU
- [ ] 20 retailer adapters
- [ ] Affiliate revenue > $100/mo
- [ ] Back-to-school campaign with 1 school district

---

## Open Questions

1. **Retailer API access** — Do we need affiliate accounts? Amazon Product API requires approval.
2. **Checkout flow** — Do we redirect to retailer, or attempt automated checkout?
3. **Share-a-Cart partnership** — Worth reaching out for API access vs building our own?
4. **Monetization** — Affiliate links? Premium features? B2B licensing?

---

## Appendix

### Supported Retailers (from Share-a-Cart)
Full list: 200+ stores including Amazon, Walmart, Target, Costco, Best Buy, Kroger, Sam's Club, BJ's, Walgreens, CVS, eBay, Apple, Home Depot, Lowe's, and many more.

See: `assets/logos/` for downloaded icons (32x32)

### Links
- Share-a-Cart: https://share-a-cart.com
- Chrome Extension: https://chrome.google.com/webstore/detail/share-a-cart/hcjohblbkdgcoikaedjndgbcgcfoojmj
- Business Solutions: https://share-a-cart.com/business-solutions

---

*Document created: February 26, 2026*
*Last updated: February 26, 2026*
