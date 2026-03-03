/**
 * Basic ClawCart Example
 * 
 * Demonstrates creating a cart and getting share instructions.
 */

import { ClawCart } from '@clawcart/core';

async function main() {
  // Create a cart with items
  const cart = ClawCart.fromItems([
    { name: 'Crayons 24-count', quantity: 2, price: 2.99 },
    { name: '#2 Pencils 12-pack', quantity: 1, price: 3.49 },
    { name: 'Pocket folders', quantity: 4, price: 0.99 },
    { name: 'Glue sticks 4-pack', quantity: 1, price: 2.49 },
  ], 'amazon');

  // Set a name for the cart
  cart.setName('Back to School Supplies');

  // View cart contents
  console.log('=== Cart Contents ===\n');
  for (const item of cart.items) {
    const price = item.price ? ` @ $${item.price.toFixed(2)}` : '';
    console.log(`  • ${item.name} x${item.quantity}${price}`);
  }

  console.log(`\nItems: ${cart.itemCount}`);
  console.log(`Estimated Total: $${cart.total.toFixed(2)}`);

  // Get instructions for sharing via Share a Cart extension
  console.log('\n=== Share Instructions ===\n');
  console.log(cart.getShareInstructions());

  // Export as simple object (useful for passing to other systems)
  console.log('\n=== Simple Export ===\n');
  console.log(JSON.stringify(cart.toSimple(), null, 2));
}

main().catch(console.error);
