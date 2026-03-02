// Main exports
export { ClawCart } from './cart';

// Types
export type {
  Cart,
  CartItem,
  CartItemInput,
  CartStatus,
  Product,
  ProductMatch,
  SearchOptions,
  RetailerAdapter,
  AvailabilityStatus,
  OptimizedCart,
  ShareLink,
  ShareOptions,
  SharedCart,
  ApprovalStatus,
  ShoppingIntent,
  BrowserMode,
  BrowserConfig,
  ClawCartConfig,
} from './types';

// Adapters
export {
  AdapterRegistry,
  registry,
  BaseAdapter,
  MockAdapter,
} from './adapters';
