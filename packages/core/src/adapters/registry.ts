/**
 * Registry for retailer URL helpers
 */

import type { RetailerUrls } from '../types';

export class UrlRegistry {
  private helpers: Map<string, RetailerUrls> = new Map();

  /**
   * Register a URL helper
   */
  register(helper: RetailerUrls): void {
    this.helpers.set(helper.name.toLowerCase(), helper);
  }

  /**
   * Get URL helper by retailer name
   */
  get(name: string): RetailerUrls | undefined {
    return this.helpers.get(name.toLowerCase());
  }

  /**
   * Check if helper exists
   */
  has(name: string): boolean {
    return this.helpers.has(name.toLowerCase());
  }

  /**
   * List all registered retailer names
   */
  list(): string[] {
    return Array.from(this.helpers.keys());
  }

  /**
   * Get all helpers
   */
  all(): RetailerUrls[] {
    return Array.from(this.helpers.values());
  }
}

// Singleton instance with default retailers
export const urlRegistry = new UrlRegistry();
