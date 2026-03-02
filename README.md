# 🛒 ClawCart

**AI-powered shopping carts across 200+ retailers**

> "Build my kid's 3rd grade supply list under $50"

ClawCart is an [OpenClaw](https://openclaw.ai) recipe that lets AI agents build, optimize, and share shopping carts through natural language. Describe what you need — the agent handles product discovery, price comparison, and cart sharing. You approve before checkout.

## The Problem

- Shopping across retailers = tabs everywhere, manual price comparison
- Shared shopping (families, teams) = awkward link forwarding
- Supply lists (schools, offices) = tedious item-by-item hunting
- Reordering = repeating the same work every time

## The Solution

```
┌─────────────────────────────────────────────────────┐
│  "Order office supplies for Q2, under $200"         │
└──────────────────────┬──────────────────────────────┘
                       ▼
              ┌────────────────┐
              │   ClawCart     │  Parses intent
              │     Agent      │  Searches retailers
              └────────┬───────┘  Optimizes prices
                       ▼
              ┌────────────────┐
              │  Cart Preview  │  Amazon: $89
              │    + Link      │  Target: $76  ← Best
              └────────┬───────┘  Walmart: $82
                       ▼
              ┌────────────────┐
              │ Human Approval │  Review → Approve
              └────────┬───────┘  
                       ▼
              ┌────────────────┐
              │   Checkout     │  One-click purchase
              └────────────────┘
```

**Key insight:** Agent builds the cart, human approves the purchase. Safe, transparent, useful.

## Features

- 🎤 **Natural Language** — Describe what you need in plain English
- 🏪 **Multi-Retailer** — Amazon, Walmart, Target, Costco + 200 more
- 💰 **Price Optimization** — Automatic comparison across stores
- 🔗 **Cart Sharing** — Share links for family/team approval
- ✅ **Approval Flow** — Review before any money moves

## Use Cases

| Use Case | Example Prompt |
|----------|----------------|
| Back-to-school | "Build 3rd grade supply list under $50" |
| Office procurement | "Order Q2 office supplies, same as last quarter" |
| Gift coordination | "Coordinate baby shower gift, $30 each from 5 people" |
| Household restock | "Reorder our usual Costco run" |

## Quick Start

### As an OpenClaw Skill

```bash
# Install the skill
openclaw skills install clawcart

# Use via chat
"Build a shopping cart for a backyard BBQ, 10 people, $150 budget"
```

### As a Package

```typescript
import { ClawCart } from '@clawcart/core';

// Build cart from natural language
const cart = await ClawCart.fromPrompt({
  prompt: "3rd grade supply list under $50",
  retailer: "amazon", // or 'walmart', 'target', 'auto'
});

// Get shareable link
const shareUrl = await cart.share();
// → https://clawcart.ai/c/abc123

// Or get the cart object
console.log(cart.items);
// → [{ name: "Crayons 24ct", price: 2.99, qty: 1 }, ...]
```

### As an MCP Server

```bash
# Run the MCP server
npx @clawcart/mcp

# Available tools:
# - clawcart_search: Find products across retailers
# - clawcart_add: Add item to cart
# - clawcart_optimize: Find best prices
# - clawcart_share: Generate share link
```

## How It Works

See [Architecture](docs/ARCHITECTURE.md) for the full system design.

**Core flow:**

1. **Intent Parser** — NLP converts "3rd grade supply list" → structured product queries
2. **Product Search** — Searches across configured retailers (APIs or browser automation)
3. **Price Optimizer** — Compares prices, factors shipping, membership benefits
4. **Cart Builder** — Assembles optimized cart with alternatives
5. **Share Service** — Generates approval link, tracks status
6. **Checkout** — Human clicks through to complete purchase

## Project Structure

```
clawcart/
├── README.md           # You are here
├── CONTRIBUTING.md     # How to contribute
├── LICENSE             # MIT
├── docs/
│   ├── ARCHITECTURE.md # System design
│   ├── BROWSER-ACCESS.md # Browser integration patterns
│   ├── PRD.md          # Product requirements
│   └── ...
├── packages/
│   ├── core/           # Cart logic, retailers
│   ├── skill/          # OpenClaw skill wrapper
│   └── mcp/            # MCP server
├── examples/           # Usage examples
└── assets/             # Logos, images
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — How the system works
- [Browser Access Patterns](docs/BROWSER-ACCESS.md) — Integration scenarios
- [Product Requirements](docs/PRD.md) — Full PRD with use cases
- [Contributing](CONTRIBUTING.md) — How to help build ClawCart

## Status

🟡 **Active Development** — Core SDK in progress

### Roadmap

- [x] PRD & Architecture
- [ ] Core SDK (cart builder, optimizer)
- [ ] Amazon adapter
- [ ] Walmart adapter  
- [ ] Share service
- [ ] OpenClaw skill
- [ ] MCP server

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for:

- Setting up the dev environment
- Code style guidelines
- How to add retailer adapters
- PR process

Good first issues are tagged [`good-first-issue`](https://github.com/evmsystems-ai/clawcart/labels/good-first-issue).

## License

MIT — see [LICENSE](LICENSE)

---

Built with [OpenClaw](https://openclaw.ai) · [EVM Systems](https://evmsystems.ai)
