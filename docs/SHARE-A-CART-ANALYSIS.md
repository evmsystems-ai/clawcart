# Share-a-Cart Technical Analysis

**Date:** February 26, 2026  
**Analyst:** Stu (Backend)

## Overview

Share-a-Cart is a Chrome extension that enables sharing shopping carts across 200+ retailers.

- **Website:** https://share-a-cart.com
- **Chrome Extension ID:** `hcjohblbkdgcoikaedjndgbcgcfoojmj`
- **Business Solutions:** https://share-a-cart.com/business-solutions

## How It Works

### Cart Extraction
1. User browses retailer site with extension installed
2. Extension scrapes cart page DOM
3. Extracts: product name, SKU/ID, price, quantity, image URL
4. Stores cart object in Share-a-Cart backend

### Cart Sharing
1. User clicks "Share Cart" in extension
2. Backend generates unique share link
3. Recipient opens link (must have extension installed)
4. Extension injects cart items into recipient's cart on retailer site

### Cart Injection
- Extension has retailer-specific scripts
- Knows how to add items to cart via DOM manipulation or retailer APIs
- Handles quantity, variants (size/color), etc.

## API Endpoints (Observed)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v1/carts` | POST | Create new cart |
| `/v1/carts/:id` | GET | Retrieve cart |
| `/v1/share` | POST | Generate share link |
| `/v1/import` | POST | Import cart to retailer |

*Note: API may require authentication or extension-only access*

## Supported Retailers (200+)

### Major Retailers
- Amazon, Walmart, Target, Costco
- Best Buy, eBay, Apple
- Kroger, Sam's Club, BJ's
- Home Depot, Lowe's
- Walgreens, CVS

### Full List
See https://share-a-cart.com/supported

Downloaded favicons (32x32) to: `../assets/logos/`

## Technical Moat

1. **200+ retailer DOM selectors** — Years of maintenance
2. **Cart injection scripts** — Per-retailer implementation
3. **Edge case handling** — Variants, bundles, discounts
4. **"AI-driven context extraction"** — Product matching across retailers

## Integration Options

### Option A: Partnership
- Reach out for API access
- Use their infrastructure, pay for usage
- Fastest path but dependency risk

### Option B: Hybrid
- Build our own cart state
- Use their share links for checkout
- Requires understanding their share link format

### Option C: Native Build
- Build our own retailer adapters
- Full control, no dependencies
- Highest effort, but owns the stack

## Recommended Approach

Start with **Option C** for top 3 retailers (Amazon, Walmart, Target):
- Build native adapters using their APIs or Playwright scraping
- Own the cart state in our DB
- Implement our own share service

Expand to 20+ retailers over time. Consider Option A for long-tail retailers if partnership is viable.

## Next Steps

1. [ ] Test Amazon Product API access (requires affiliate account)
2. [ ] Prototype Walmart product search
3. [ ] Build cart data model
4. [ ] Implement share link generation

---

*Analysis completed: February 26, 2026*
