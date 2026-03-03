# 🛒 ClawCart

**Simple cart tracking + Share a Cart extension integration for AI agents**

ClawCart is a lightweight SDK for [OpenClaw](https://openclaw.ai) agents to build and share shopping carts across 200+ retailers using the [Share a Cart](https://share-a-cart.com) browser extension.

## The Problem

AI agents need to help users shop, but building product scrapers for each retailer is:
- Fragile (DOM changes break scrapers)
- Expensive (browser automation at scale)
- Redundant (Share a Cart already solved this)

## The Solution

ClawCart takes a different approach:

1. **Track cart state locally** — Agent knows what items to buy
2. **Use browser automation** — Navigate to retailer, add items
3. **Trigger Share a Cart extension** — Generate shareable link
4. **Human approves** — User reviews cart, completes purchase

```
┌─────────────────────────────────────────────────────┐
│  Agent: "I'll build your school supply cart"       │
└──────────────────────┬──────────────────────────────┘
                       ▼
              ┌────────────────┐
              │   ClawCart     │  Tracks items locally
              │   SDK          │  (name, qty, price)
              └────────┬───────┘
                       ▼
              ┌────────────────┐
              │   Browser      │  Adds items to
              │   Automation   │  retailer cart
              └────────┬───────┘
                       ▼
              ┌────────────────┐
              │  Share a Cart  │  Generates share
              │   Extension    │  link for 200+ retailers
              └────────┬───────┘
                       ▼
              ┌────────────────┐
              │ Human Approval │  Review → Purchase
              └────────────────┘
```

**Key insight:** Don't scrape retailers. Use the extension that already works everywhere.

## Quick Start

### Installation

```bash
npm install @clawcart/core
```

### Basic Usage

```typescript
import { ClawCart } from '@clawcart/core';

// Create a cart with items
const cart = ClawCart.fromItems([
  { name: 'Crayons 24-count', quantity: 2, price: 2.99 },
  { name: '#2 Pencils 12-pack', quantity: 1, price: 3.49 },
  { name: 'Pocket folders', quantity: 4, price: 0.99 },
], 'amazon');

console.log(`Items: ${cart.itemCount}`);
console.log(`Estimated total: $${cart.total.toFixed(2)}`);

// Get instructions for manual sharing
console.log(cart.getShareInstructions());
```

### With Browser Automation

```typescript
import { ClawCart } from '@clawcart/core';
import { chromium } from 'playwright';

const cart = ClawCart.fromItems([
  { name: 'Crayons 24-count', quantity: 2 },
], 'amazon');

// Use browser automation to share
const browser = await chromium.launch();
const page = await browser.newPage();

// Navigate to retailer and add items (your automation)
await page.goto('https://amazon.com/cart');
// ... add items to cart ...

// Trigger Share a Cart extension
const result = await cart.share({
  navigate: (url) => page.goto(url),
  click: (sel) => page.click(sel),
  waitForSelector: (sel, opts) => page.waitForSelector(sel, opts),
  evaluate: (fn) => page.evaluate(fn),
  getUrl: () => page.url(),
});

if (result.success) {
  console.log(`Share link: ${result.shareUrl}`);
}
```

### With OpenClaw

```typescript
// As an OpenClaw skill, browser context is provided
const cart = ClawCart.fromItems(items, 'amazon');
const result = await cart.share(browser); // OpenClaw browser context
```

## API

### `ClawCart`

#### Static Methods

- `ClawCart.fromItems(items, retailer?)` — Create cart from item list
- `ClawCart.fromSimple(simple)` — Create from serialized cart

#### Instance Methods

- `addItem(input)` — Add item to cart
- `removeItem(itemId)` — Remove item by ID
- `updateQuantity(itemId, qty)` — Update item quantity
- `clear()` — Remove all items
- `setName(name)` — Set cart name
- `getCart()` — Get full cart state
- `share(browser)` — Trigger Share a Cart extension
- `getShareInstructions()` — Get manual sharing steps
- `toJSON()` — Export as JSON
- `toSimple()` — Export as simple object

#### Properties

- `items` — Cart items array
- `total` — Estimated total
- `itemCount` — Total quantity
- `retailer` — Target retailer

### URL Helpers

```typescript
import { AmazonUrls } from '@clawcart/core';

const amazon = new AmazonUrls();
amazon.getCartUrl();           // https://www.amazon.com/cart
amazon.getProductUrl('B08..'); // https://www.amazon.com/dp/B08..
amazon.getSearchUrl('crayons'); // https://www.amazon.com/s?k=crayons
amazon.getAddToCartUrl([...]);  // Direct add-to-cart URL
```

## Supported Retailers

ClawCart works with any retailer supported by [Share a Cart](https://share-a-cart.com/supported), including:

- Amazon, Walmart, Target, Costco
- Best Buy, Home Depot, Lowe's
- Kroger, Walgreens, CVS
- And 200+ more

## Requirements

- **Share a Cart extension** must be installed in the browser
- **Browser automation** (Playwright, Puppeteer, or OpenClaw)

## How It Works

1. **Agent builds cart locally** — ClawCart tracks items, quantities, prices
2. **Browser adds to retailer** — Navigate to site, add items via automation
3. **Extension exports cart** — Click Share a Cart button, get share link
4. **Human reviews & buys** — User opens link, reviews, completes purchase

The SDK never scrapes retailer sites. It just:
- Tracks what you want to buy
- Provides URLs for navigation
- Triggers the Share a Cart extension
- Captures the generated share link

## Project Structure

```
clawcart/
├── packages/
│   ├── core/           # Cart + URL helpers
│   ├── skill/          # OpenClaw skill wrapper
│   └── mcp/            # MCP server
└── examples/           # Usage examples
```

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build
pnpm build
```

## License

MIT — see [LICENSE](LICENSE)

---

Built with [OpenClaw](https://openclaw.ai) · [EVM Systems](https://evmsystems.ai)
