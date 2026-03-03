/**
 * Retailer URL helpers
 * 
 * These provide URL building utilities for navigation.
 * Actual cart sharing is done via Share a Cart browser extension.
 */

export { UrlRegistry, urlRegistry } from './registry';
export { RetailerUrlHelper } from './base';
export { MockUrls } from './mock';
export { AmazonUrls } from './amazon';

// Register default helpers
import { urlRegistry } from './registry';
import { MockUrls } from './mock';
import { AmazonUrls } from './amazon';

urlRegistry.register(new MockUrls());
urlRegistry.register(new AmazonUrls());
