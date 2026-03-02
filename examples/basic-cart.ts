/**
 * Basic ClawCart Example
 * 
 * Demonstrates creating a cart, adding items, and generating a share link.
 */

import { ClawCart } from '@clawcart/core';

async function main() {
  // Create a new cart
  const cart = new ClawCart({
    defaultRetailer: 'amazon',
  });

  // Add items by search query
  await cart.addItem({
    query: 'Crayons 24-count',
    quantity: 2,
  });

  await cart.addItem({
    query: '#2 pencils',
    quantity: 1,
  });

  await cart.addItem({
    query: 'Pocket folders',
    quantity: 1,
  });

  // View cart contents
  console.log('Cart Items:');
  for (const item of cart.items) {
    console.log(`  - ${item.name} x${item.quantity} @ $${item.price.toFixed(2)}`);
  }

  console.log(`\nTotal: $${cart.total.toFixed(2)}`);

  // Generate shareable link
  const shareUrl = await cart.share();
  console.log(`\nShare this cart: ${shareUrl}`);
}

main().catch(console.error);
