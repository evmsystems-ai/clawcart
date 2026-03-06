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
export { WalmartUrls } from './walmart';
export { TargetUrls } from './target';

// Register default helpers
import { urlRegistry } from './registry';
import { MockUrls } from './mock';
import { AmazonUrls } from './amazon';
import { WalmartUrls } from './walmart';
import { TargetUrls } from './target';

urlRegistry.register(new MockUrls());
urlRegistry.register(new AmazonUrls());
urlRegistry.register(new WalmartUrls());
urlRegistry.register(new TargetUrls());
