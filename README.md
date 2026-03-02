# 🛒 ClawCart

**Voice-first multi-retailer cart building & sharing**

> "Build my kid's 3rd grade supply list under $50"

ClawCart is an OpenClaw-powered shopping assistant that builds, optimizes, and shares shopping carts across 200+ retailers through natural language.

## Features (Planned)

- 🎤 **Voice/Chat-First** — Describe what you need, agent handles the rest
- 🏪 **Multi-Retailer** — Amazon, Walmart, Target, Costco + 200 more
- 💰 **Price Optimization** — Compare across stores, factor shipping/membership
- 🔗 **Cart Sharing** — Share with family, coworkers, or groups for approval
- ✅ **Approval Workflow** — Review and approve before checkout

## Use Cases

| Use Case | Example |
|----------|---------|
| Back-to-school | "Build 3rd grade supply list under $50" |
| Business procurement | "Order Q2 office supplies" |
| Gift coordination | "Coordinate baby shower gift, $30 each" |
| Household restock | "Reorder our usual Costco run" |

## Project Structure

```
clawcart/
├── docs/           # PRD, specs, architecture
├── agents/         # OpenClaw agent configs
├── services/       # Backend services
├── adapters/       # Retailer integrations
└── assets/logos/   # Retailer logos
```

## Docs

- [Product Requirements (PRD)](docs/PRD.md)
- [Agent Development Context](AGENTS.md)

## Team

- **Papi** — Spec, intent parser, agent orchestration
- **Stu** — Backend, retailer adapters
- **Frontend** — TBD

## Status

🟡 **Discovery/Spec Phase**

---

*Powered by [OpenClaw](https://openclaw.ai)*
