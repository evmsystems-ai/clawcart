# Contributing to ClawCart

Thanks for your interest in contributing! This guide will help you get started.

## Quick Links

- [Issues](https://github.com/evmsystems-ai/clawcart/issues) — Bug reports, feature requests
- [Discussions](https://github.com/evmsystems-ai/clawcart/discussions) — Questions, ideas
- [Discord](https://discord.gg/openclaw) — Real-time chat

## Development Setup

### Prerequisites

- Node.js 20+
- pnpm 8+ (we use pnpm workspaces)
- Git

### Getting Started

```bash
# Clone the repo
git clone https://github.com/evmsystems-ai/clawcart.git
cd clawcart

# Install dependencies
pnpm install

# Run tests
pnpm test

# Start development
pnpm dev
```

### Project Structure

```
packages/
├── core/           # Cart logic, price optimizer, retailer adapters
├── skill/          # OpenClaw skill wrapper
└── mcp/            # MCP server implementation
```

## How to Contribute

### 1. Find Something to Work On

- Browse [open issues](https://github.com/evmsystems-ai/clawcart/issues)
- Look for [`good-first-issue`](https://github.com/evmsystems-ai/clawcart/labels/good-first-issue) labels
- Check the [roadmap](#roadmap) for planned features

### 2. Create an Issue First

Before starting significant work, open an issue to discuss:
- What you want to build
- Your proposed approach
- Any questions or blockers

This prevents duplicate effort and ensures alignment.

### 3. Fork & Branch

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/YOUR_USERNAME/clawcart.git
cd clawcart
git checkout -b feature/your-feature-name
```

### 4. Make Your Changes

- Write clear, documented code
- Add tests for new functionality
- Update docs if needed

### 5. Submit a PR

```bash
git push origin feature/your-feature-name
```

Then open a Pull Request on GitHub with:
- Clear description of changes
- Link to related issue
- Screenshots/examples if applicable

## Code Style

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Prefer explicit types over `any`

```typescript
// ✅ Good
function buildCart(items: CartItem[]): Cart {
  return { items, total: calculateTotal(items) };
}

// ❌ Avoid
function buildCart(items: any): any {
  return { items, total: calculateTotal(items) };
}
```

### Naming

- Files: `kebab-case.ts`
- Classes: `PascalCase`
- Functions/variables: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`

### Commits

Use conventional commits:

```
feat: add walmart adapter
fix: handle out-of-stock items
docs: update architecture diagram
test: add cart builder tests
```

## Adding a Retailer Adapter

Retailer adapters are how ClawCart integrates with different stores. Here's how to add one:

### 1. Create the Adapter

```typescript
// packages/core/src/adapters/newretailer.ts
import { RetailerAdapter, Product, SearchOptions } from '../types';

export class NewRetailerAdapter implements RetailerAdapter {
  readonly name = 'newretailer';
  readonly displayName = 'New Retailer';
  
  async search(query: string, options?: SearchOptions): Promise<Product[]> {
    // Implement product search
  }
  
  async getProduct(productId: string): Promise<Product | null> {
    // Fetch single product by ID
  }
  
  async buildCartUrl(items: CartItem[]): Promise<string> {
    // Generate add-to-cart URL
  }
}
```

### 2. Register the Adapter

```typescript
// packages/core/src/adapters/index.ts
export { NewRetailerAdapter } from './newretailer';

// packages/core/src/registry.ts
import { NewRetailerAdapter } from './adapters';

registry.register(new NewRetailerAdapter());
```

### 3. Add Tests

```typescript
// packages/core/src/adapters/__tests__/newretailer.test.ts
describe('NewRetailerAdapter', () => {
  it('searches products', async () => {
    const adapter = new NewRetailerAdapter();
    const results = await adapter.search('pencils');
    expect(results.length).toBeGreaterThan(0);
  });
});
```

### 4. Document

Add entry to [docs/RETAILERS.md](docs/RETAILERS.md) with:
- Retailer name and website
- API used (official API, scraping, etc.)
- Any limitations or special setup

## Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @clawcart/core test

# Run tests in watch mode
pnpm test:watch

# Run with coverage
pnpm test:coverage
```

## Documentation

- Update README.md for user-facing changes
- Update docs/ for architecture/design changes
- Add JSDoc comments for public APIs

## Release Process

Maintainers handle releases. We use:
- Semantic versioning (semver)
- Changesets for changelog management
- GitHub Actions for CI/CD

## Getting Help

- **Questions:** Open a [Discussion](https://github.com/evmsystems-ai/clawcart/discussions)
- **Bugs:** Open an [Issue](https://github.com/evmsystems-ai/clawcart/issues)
- **Chat:** Join [Discord](https://discord.gg/openclaw)

## Code of Conduct

Be respectful and constructive. We're all here to build something useful.

---

Thank you for contributing! 🛒
