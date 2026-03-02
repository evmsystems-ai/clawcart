# ClawCart Customer Segments & Use Cases

## Target Customer: OpenClaw Agent Builders

People building AI agents that need to automate cross-store purchasing. Not end consumers — the developers/operators who deploy agents for specific verticals.

---

## Segment 1: 🎒 Education & Schools

**Who:** Teachers, PTAs, school administrators, homeschool co-ops

**Use Cases:**
| Use Case | Agent Behavior |
|----------|----------------|
| **Back-to-school lists** | Parse teacher's supply list → build carts across Amazon/Target/Walmart → share with parents |
| **Classroom supplies** | Teacher describes needs → agent finds best bulk pricing → routes to admin for approval |
| **STEM kit assembly** | Curriculum requires specific components → agent sources from specialty + general retailers |
| **Field trip supplies** | "We need 30 clipboards, 30 pencils, and snacks for 30 kids under $100" |

**Why Agents:**
- Teachers don't have time to price-compare across 5 stores
- Parents want one-click checkout, not hunting down 15 items
- Bulk ordering requires coordination across multiple families

**Revenue Model:** Per-cart fee or school district licensing

---

## Segment 2: 💝 Nonprofits & Donations

**Who:** Charities, mutual aid orgs, disaster relief, community groups

**Use Cases:**
| Use Case | Agent Behavior |
|----------|----------------|
| **Wishlist fulfillment** | Shelter posts needs → agent builds cart → donors claim items → prevents duplicates |
| **Disaster relief kits** | "Build 50 emergency kits with water, flashlights, first aid" → agent optimizes bulk |
| **Food bank assembly** | Weekly grocery list → agent builds cart at Costco/Walmart → volunteer picks up |
| **Community fridges** | Track inventory → auto-generate restock carts when items run low |

**Why Agents:**
- Donation coordination is manual and error-prone
- Price sensitivity matters (stretch donor dollars)
- Need to aggregate across multiple donors

**Revenue Model:** Free tier for verified nonprofits, sponsors pay for white-label

---

## Segment 3: 🏢 Small Business Procurement

**Who:** Office managers, ops teams, franchise owners, property managers

**Use Cases:**
| Use Case | Agent Behavior |
|----------|----------------|
| **Office supplies** | "Reorder our monthly supplies" → agent builds from purchase history → routes to finance |
| **Inventory restocking** | Low stock alert → agent builds replenishment cart → manager approves |
| **Multi-location ordering** | Same order for 10 franchise locations → agent handles per-location customization |
| **Airbnb turnover kits** | Guest checks out → agent builds cleaning/restock cart → cleaner picks up |

**Why Agents:**
- Procurement is repetitive and time-consuming
- Need approval workflows before spend
- Cross-store optimization saves real money at scale

**Revenue Model:** SaaS subscription, percentage of spend managed

---

## Segment 4: 🛍️ E-commerce & Resale

**Who:** Dropshippers, arbitrage sellers, subscription box curators

**Use Cases:**
| Use Case | Agent Behavior |
|----------|----------------|
| **Arbitrage sourcing** | Monitor price differentials → auto-build cart when margins appear → alert operator |
| **Subscription box curation** | "Find 5 unique snacks under $3 each" → agent searches, builds sample cart |
| **Inventory arbitrage** | Track competitor pricing → build carts at lowest-cost suppliers |
| **Product research** | "Find all wireless earbuds under $20 with 4+ star reviews" → comparison cart |

**Why Agents:**
- Speed matters for arbitrage (prices change fast)
- Research across many stores is tedious
- Need to act on opportunities before they disappear

**Revenue Model:** Usage-based API pricing

---

## Segment 5: 🥬 Grocery & Meal Planning

**Who:** Families, meal prep services, personal chefs, senior care

**Use Cases:**
| Use Case | Agent Behavior |
|----------|----------------|
| **Weekly meal prep** | Input meal plan → agent builds grocery cart → optimizes across Kroger/Costco/Walmart |
| **Recipe ingredients** | Share a recipe link → agent extracts ingredients → builds cart |
| **Dietary restrictions** | "Gluten-free, nut-free groceries for the week" → agent filters and builds |
| **Senior shopping** | Caregiver sends list → agent builds cart → schedules delivery to senior's address |

**Why Agents:**
- Grocery shopping is weekly friction
- Cross-store optimization (Costco for bulk, Kroger for fresh) is complex
- Dietary filtering requires reading every label

**Revenue Model:** Consumer subscription, affiliate commissions

---

## Segment 6: 🎉 Events & Hospitality

**Who:** Event planners, wedding coordinators, party hosts, corporate events

**Use Cases:**
| Use Case | Agent Behavior |
|----------|----------------|
| **Party supplies** | "50-person birthday party, tropical theme, $500 budget" → agent builds full cart |
| **Wedding favors** | Bulk pricing comparison for 200 custom items across Etsy/Amazon/specialty |
| **Corporate gifts** | "Holiday gifts for 100 employees, $25 each" → agent builds options, routes for approval |
| **Catering supplies** | Recurring event needs → agent learns preferences → auto-suggests reorders |

**Why Agents:**
- Events have hard deadlines and complex requirements
- Budget constraints require optimization
- Coordination across vendors is painful

**Revenue Model:** Per-event fee, B2B licensing

---

## Segment 7: 🏥 Healthcare & Wellness

**Who:** Clinics, senior care facilities, home health aides, pharmacies

**Use Cases:**
| Use Case | Agent Behavior |
|----------|----------------|
| **Medical supplies** | Clinic running low → agent builds cart from approved vendors → admin approves |
| **Patient care kits** | Discharge checklist → agent builds home care supply cart → ships to patient |
| **Supplement management** | Patient's supplement list → agent finds best prices across iHerb/Amazon/Costco |
| **PPE restocking** | Inventory threshold triggers → agent builds bulk order → routes to purchasing |

**Why Agents:**
- Compliance requires approved vendor lists
- Price sensitivity on recurring supplies
- Care coordination across multiple patients

**Revenue Model:** B2B licensing, per-bed pricing for facilities

---

## Segment 8: 🏠 Personal & Household

**Who:** Busy professionals, families, personal assistants

**Use Cases:**
| Use Case | Agent Behavior |
|----------|----------------|
| **Household essentials** | "We're out of paper towels, detergent, and dog food" → agent builds optimized cart |
| **Moving/furnishing** | "Furnish a 1BR apartment for under $2000" → agent builds furniture + essentials cart |
| **Baby registry** | Registry checklist → agent finds best prices → notifies when items go on sale |
| **Gift shopping** | "Birthday gift for 8-year-old who likes dinosaurs, $30 budget" → agent suggests options |

**Why Agents:**
- Time is the scarcest resource
- Cross-store optimization adds up over a year
- Recurring purchases should be automated

**Revenue Model:** Consumer subscription, affiliate commissions

---

## Web App Content Strategy

### Homepage Hero
> **"Your AI agent's gateway to 200+ stores"**  
> Build agents that shop, compare, and checkout across Amazon, Walmart, Target, and more.

### Primary CTAs
1. **For Developers** → API docs, MCP tools, quick start
2. **For Businesses** → Use case templates, pricing, demo

### Use Case Showcase (rotating)
- 🎒 "Back-to-school in one click"
- 💝 "Donation drives that actually work"
- 🏢 "Procurement on autopilot"
- 🥬 "Meal planning without the shopping"

### Trust Signals
- "200+ supported retailers"
- "Built on OpenClaw"
- "$X in carts processed" (once we have data)

### Pricing Page Segments
| Tier | For | Price |
|------|-----|-------|
| **Free** | Developers, testing | 100 carts/mo |
| **Pro** | Small business | $49/mo, 1K carts |
| **Business** | Teams, nonprofits | $199/mo, 10K carts |
| **Enterprise** | Custom | Contact us |

---

## Priority Segments for Launch

### Tier 1 (MVP Focus)
1. **Education** — Proven market (Share-a-Cart's biggest segment)
2. **Nonprofits** — High visibility, good PR, mission-aligned

### Tier 2 (Month 2-3)
3. **Small Business** — Revenue potential
4. **Grocery** — High frequency, sticky

### Tier 3 (Future)
5. E-commerce
6. Events
7. Healthcare
8. Personal

---

*Last updated: February 26, 2026*
