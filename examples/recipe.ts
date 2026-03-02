/**
 * Cart from Recipe
 * 
 * Demonstrates using saved recipes for reordering.
 */

import { ClawCart } from '@clawcart/core';

// Define a reusable recipe
const weeklyGroceries = {
  name: 'Weekly Groceries',
  retailer: 'amazon',
  items: [
    { query: 'Organic eggs 12 count', quantity: 2 },
    { query: 'Whole milk 1 gallon', quantity: 1 },
    { query: 'Sourdough bread', quantity: 1 },
    { query: 'Organic bananas', quantity: 1 },
    { query: 'Greek yogurt variety pack', quantity: 1 },
  ],
};

async function main() {
  // Build cart from recipe
  const cart = await ClawCart.fromRecipe(weeklyGroceries);

  console.log(`Recipe: ${weeklyGroceries.name}`);
  console.log('Items:');
  
  for (const item of cart.items) {
    console.log(`  - ${item.name} x${item.quantity} @ $${item.price.toFixed(2)}`);
  }

  console.log(`\nTotal: $${cart.total.toFixed(2)}`);

  // Share with family for approval
  const shareUrl = await cart.share({
    message: 'Weekly groceries - anything to add?',
    expiresIn: 48 * 60 * 60, // 48 hours
  });

  console.log(`\nShare: ${shareUrl}`);
}

main().catch(console.error);
