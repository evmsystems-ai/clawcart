# Browser Access Patterns

ClawCart needs to interact with retailer websites. This document covers the different browser access scenarios developers may encounter and how to handle each.

## The Challenge

AI agents need browser access to:
1. Search products on retailers without APIs
2. Extract pricing and availability
3. Build cart URLs
4. (Optionally) Automate checkout

But browser access varies widely:
- Some developers run agents locally with full browser access
- Some run agents in sandboxed cloud environments
- Some have no browser access at all

ClawCart is designed to work across all these scenarios.

## Access Patterns

### Pattern 1: API-Only (No Browser)

**Scenario:** Agent runs in a sandboxed environment with no browser access.

**Solution:** Use only retailers with public APIs.

```typescript
import { ClawCart } from '@clawcart/core';

const cart = new ClawCart({
  // Only use retailers with APIs
  retailers: ['amazon', 'walmart'],
  browserMode: 'none'
});

const results = await cart.search('pencils');
// Uses Amazon Product API + Walmart API
```

**Supported retailers (API-only):**
- Amazon (Product Advertising API)
- Walmart (Affiliate API)
- eBay (Browse API)
- Best Buy (Products API)

**Limitations:**
- Fewer retailers available
- May require affiliate account setup

---

### Pattern 2: Local Browser (Full Access)

**Scenario:** Developer runs OpenClaw locally with browser tool enabled.

**Solution:** Use Playwright for any retailer.

```typescript
const cart = new ClawCart({
  retailers: ['target', 'costco', 'amazon'],
  browserMode: 'local',
  // Uses OpenClaw's browser tool
});
```

**How it works:**
1. ClawCart detects OpenClaw browser tool availability
2. Launches headless browser via Playwright
3. Navigates to retailer, searches, extracts data
4. Builds cart URL from extracted product IDs

**Advantages:**
- All 200+ retailers supported
- Real-time pricing
- No API keys needed

**Considerations:**
- Slower than API calls
- May trigger bot detection
- Uses local compute resources

---

### Pattern 3: Remote Browser Proxy

**Scenario:** Agent runs in cloud but has access to a browser proxy service.

**Solution:** Connect to remote browser (Browserless, BrowserBase, etc.)

```typescript
const cart = new ClawCart({
  retailers: ['target', 'amazon'],
  browserMode: 'remote',
  browserEndpoint: 'wss://chrome.browserless.io?token=xxx'
});
```

**Supported services:**
- [Browserless](https://browserless.io)
- [BrowserBase](https://browserbase.com)
- [Bright Data](https://brightdata.com/products/scraping-browser)
- Self-hosted (Playwright server)

---

### Pattern 4: Deferred Execution

**Scenario:** Agent has no browser access, but human does.

**Solution:** Agent builds a "cart spec" that the human executes.

```typescript
const cart = new ClawCart({
  browserMode: 'deferred'
});

// Agent builds cart specification
const spec = await cart.buildSpec({
  prompt: "BBQ supplies for 10 people",
  retailer: "costco"
});

// Returns executable instructions, not actual cart
console.log(spec);
// {
//   retailer: 'costco',
//   searchQueries: ['hot dogs bulk', 'hamburger patties', ...],
//   instructions: 'Search each query on costco.com, add to cart',
//   estimatedTotal: '$85-120'
// }

// Human executes in their browser
// Or: generates a Share-a-Cart compatible link
```

**Use cases:**
- Sandboxed enterprise agents
- High-security environments
- Retailers that block automation

---

### Pattern 5: Hybrid

**Scenario:** Use APIs where available, fall back to browser.

**Solution:** Automatic fallback chain.

```typescript
const cart = new ClawCart({
  browserMode: 'hybrid',
  // Try API first, fall back to browser
  fallbackChain: ['api', 'local', 'deferred']
});

// Amazon: uses API
// Target: falls back to browser
// If browser unavailable: returns deferred spec
```

This is the **recommended default** for most use cases.

## Configuration

### Environment Variables

```bash
# Browser mode
CLAWCART_BROWSER_MODE=hybrid  # none | local | remote | deferred | hybrid

# Remote browser endpoint (for remote mode)
CLAWCART_BROWSER_ENDPOINT=wss://chrome.browserless.io?token=xxx

# Playwright options
CLAWCART_HEADLESS=true
CLAWCART_BROWSER_TIMEOUT=30000
```

### Programmatic Configuration

```typescript
import { ClawCart, BrowserConfig } from '@clawcart/core';

const browserConfig: BrowserConfig = {
  mode: 'hybrid',
  
  // Local browser options
  local: {
    headless: true,
    timeout: 30000,
    userAgent: 'Mozilla/5.0...'
  },
  
  // Remote browser options
  remote: {
    endpoint: process.env.BROWSER_ENDPOINT,
    apiKey: process.env.BROWSER_API_KEY
  },
  
  // Retry configuration
  retries: 3,
  retryDelay: 1000
};

const cart = new ClawCart({ browser: browserConfig });
```

## OpenClaw Integration

When running as an OpenClaw skill, ClawCart automatically detects available tools:

```typescript
// Inside OpenClaw skill context
import { hasToolAccess } from '@openclaw/skill-utils';

const browserAvailable = await hasToolAccess('browser');

const cart = new ClawCart({
  browserMode: browserAvailable ? 'local' : 'api-only'
});
```

## Anti-Detection

For browser-based access, ClawCart implements:

1. **Randomized timing** — Human-like delays between actions
2. **Fingerprint rotation** — Varied user agents, viewport sizes
3. **Proxy support** — Rotate IPs to avoid rate limiting
4. **Stealth mode** — Playwright stealth plugin

```typescript
const cart = new ClawCart({
  browserMode: 'local',
  stealth: true,
  proxy: 'http://proxy.example.com:8080'
});
```

## Retailer-Specific Notes

| Retailer | Best Method | Notes |
|----------|-------------|-------|
| Amazon | API | Requires affiliate account; best coverage |
| Walmart | API | Public API; good product data |
| Target | Browser | No API; bot detection moderate |
| Costco | Browser | Requires membership; strict bot detection |
| Best Buy | API | Good API; limited to electronics |
| Home Depot | Browser | No API; moderate bot detection |
| Kroger | API | Requires developer account |

## Troubleshooting

### "Browser not available"

```
Error: Browser mode 'local' requested but no browser available
```

**Solutions:**
1. Install Playwright: `npx playwright install`
2. Switch to API mode: `browserMode: 'api-only'`
3. Use deferred mode: `browserMode: 'deferred'`

### "Rate limited by retailer"

```
Error: Request blocked - possible rate limiting
```

**Solutions:**
1. Enable stealth mode
2. Add proxy rotation
3. Increase delays between requests
4. Fall back to deferred mode

### "Product not found"

**Possible causes:**
1. Search query too specific
2. Product out of stock
3. Regional availability
4. Bot detection (try stealth mode)

## Summary

| Mode | Browser Needed | Retailers | Best For |
|------|----------------|-----------|----------|
| `none` | No | API-only (~10) | Sandboxed agents |
| `local` | Yes (local) | All 200+ | Local development |
| `remote` | Yes (service) | All 200+ | Cloud agents |
| `deferred` | No | All 200+ | Human-in-loop |
| `hybrid` | Optional | All 200+ | **Recommended** |

Start with `hybrid` mode — it provides the best balance of coverage and reliability.
