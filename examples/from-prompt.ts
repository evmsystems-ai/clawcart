/**
 * Create Cart from Natural Language Prompt
 * 
 * Demonstrates using AI to parse shopping intent.
 */

import { ClawCart } from '@clawcart/core';

async function main() {
  // Create cart from natural language
  const cart = await ClawCart.fromPrompt({
    prompt: "Build a 3rd grade school supply list under $30",
    retailer: 'amazon',
    budget: 30,
  });

  // View what the AI decided to add
  console.log('Cart built from prompt:');
  for (const item of cart.items) {
    console.log(`  - ${item.name} x${item.quantity} @ $${item.price.toFixed(2)}`);
  }

  console.log(`\nTotal: $${cart.total.toFixed(2)}`);

  // Generate share link
  const shareUrl = await cart.share({
    message: "Here's the school supply list I put together!",
  });

  console.log(`\nShare: ${shareUrl}`);
}

main().catch(console.error);
