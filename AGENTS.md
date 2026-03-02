# ClawCart Agent Development Context

## Project Overview
Voice-first shopping assistant that builds and shares multi-retailer carts through OpenClaw.

## Key Files
- `docs/PRD.md` — Full product spec, architecture, use cases
- `services/` — Backend services (cart builder, share service, etc.)
- `adapters/` — Retailer-specific integration code
- `agents/` — OpenClaw agent configurations
- `assets/logos/` — Retailer logos (32x32 from Share-a-Cart)

## Architecture Summary

```
User Intent → Intent Parser → Cart Builder → Price Optimizer → Share Service
                                   ↓
                          Retailer Adapters (200+ stores)
```

## Agent Capabilities Needed

### Intent Parser Agent
- Parse natural language shopping requests
- Extract: items, quantities, budget constraints, store preferences
- Handle supply lists (text, PDF, images)
- Output: structured product queries

### Cart Builder Agent  
- Search products across retailers
- Match items to best options (price, availability, shipping)
- Build optimized cart objects
- Handle alternatives and substitutions

### Share Agent
- Generate shareable cart links
- Manage approval workflows
- Handle multi-recipient distribution
- Send notifications (cart shared, approved, modified)

## MCP Tools (Planned)

| Tool | Description |
|------|-------------|
| `parse_shopping_intent` | NL → structured product queries |
| `search_products` | Search across retailers |
| `build_cart` | Create cart from product list |
| `optimize_cart` | Find best prices/alternatives |
| `share_cart` | Generate share link |
| `get_cart_status` | Check approvals |
| `checkout_cart` | Redirect to retailer checkout |

## Retailer Priority

### Tier 1 (MVP)
1. Amazon
2. Walmart  
3. Target

### Tier 2 (Month 1)
4. Costco
5. Best Buy
6. Kroger
7. Home Depot

### Tier 3 (Expansion)
- Full Share-a-Cart list (200+ stores)

## Share-a-Cart Integration Notes

**Extension ID:** `hcjohblbkdgcoikaedjndgbcgcfoojmj`

Their extension:
1. Scrapes cart DOM on retailer sites
2. Extracts product info (name, SKU, price, qty, image)
3. Stores in their backend
4. Share link = cart ID
5. Recipient's extension injects items

**Our options:**
- A) Partner/API access (ask them)
- B) Build our own cart state, use their links for checkout
- C) Build native retailer integrations (more control, more work)

## Development Workflow

1. **Papi** — Spec, intent parser, agent orchestration
2. **Stu** — Backend services, retailer adapters, DB
3. **Frontend** — UI for cart viewing, approval, sharing

## Commands

```bash
# Project location
cd ~/.openclaw/workspace/projects/clawcart

# Run tests (once we have them)
npm test

# Start dev server (once we have it)
npm run dev
```

## Related Projects
- **AgentWork** — Agent job marketplace (same team)
- **OpenClaw** — Agent runtime powering this

---

*Context file for agent development. Update as project evolves.*
