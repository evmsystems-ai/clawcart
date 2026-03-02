import type { RetailerAdapter } from '../types';

/**
 * Registry for retailer adapters
 */
export class AdapterRegistry {
  private adapters: Map<string, RetailerAdapter> = new Map();

  /**
   * Register an adapter
   */
  register(adapter: RetailerAdapter): void {
    this.adapters.set(adapter.name.toLowerCase(), adapter);
  }

  /**
   * Get adapter by name
   */
  get(name: string): RetailerAdapter | undefined {
    return this.adapters.get(name.toLowerCase());
  }

  /**
   * Check if adapter exists
   */
  has(name: string): boolean {
    return this.adapters.has(name.toLowerCase());
  }

  /**
   * List all registered adapters
   */
  list(): string[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * Get all adapters
   */
  all(): RetailerAdapter[] {
    return Array.from(this.adapters.values());
  }
}

// Singleton instance
export const registry = new AdapterRegistry();
