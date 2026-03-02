export { AdapterRegistry, registry } from './registry';
export { BaseAdapter } from './base';
export { MockAdapter } from './mock';
export { AmazonAdapter } from './amazon';

// Register default adapters
import { registry } from './registry';
import { MockAdapter } from './mock';
import { AmazonAdapter } from './amazon';

registry.register(new MockAdapter());
registry.register(new AmazonAdapter());

// Future adapters:
// export { WalmartAdapter } from './walmart';
// export { TargetAdapter } from './target';
