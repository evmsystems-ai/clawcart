/**
 * Cart from Natural Language Example
 * 
 * Shows how an agent might build a cart from a user prompt.
 * The actual NLP parsing would be done by the LLM - ClawCart just tracks items.
 */

import { ClawCart } from '@clawcart/core';

/**
 * Example: Agent parses "3rd grade supply list under $50" and builds cart
 * 
 * In practice, the LLM would:
 * 1. Understand "3rd grade supply list" = common school supplies
 * 2. Research typical items needed
 * 3. Find products within budget
 * 4. Build the cart with ClawCart
 */
async function main() {
  const prompt = "Build my kid's 3rd grade supply list under $50";
  console.log(`User prompt: "${prompt}"\n`);

  // Agent figures out what items are needed (this would be LLM-driven)
  const parsedItems = [
    { name: 'Crayons 24-count', quantity: 1, price: 2.99 },
    { name: '#2 Pencils 12-pack', quantity: 2, price: 3.49 },
    { name: 'Wide-ruled notebooks', quantity: 4, price: 1.29 },
    { name: 'Pocket folders', quantity: 4, price: 0.99 },
    { name: 'Glue sticks 4-pack', quantity: 1, price: 2.49 },
    { name: 'Safety scissors', quantity: 1, price: 1.99 },
    { name: 'Pink erasers 3-pack', quantity: 1, price: 1.29 },
    { name: 'Pencil box', quantity: 1, price: 2.99 },
    { name: 'Washable markers 10-pack', quantity: 1, price: 4.99 },
    { name: 'Ruler 12-inch', quantity: 1, price: 0.99 },
  ];

  // Build the cart
  const cart = ClawCart.fromItems(parsedItems, 'amazon');
  cart.setName('3rd Grade School Supplies');

  // Check budget
  const budget = 50;
  const withinBudget = cart.total <= budget;

  console.log('=== Agent Response ===\n');
  console.log(`I found ${cart.itemCount} items for your 3rd grade supply list:\n`);
  
  for (const item of cart.items) {
    console.log(`  ✓ ${item.name} x${item.quantity} - $${((item.price ?? 0) * item.quantity).toFixed(2)}`);
  }

  console.log(`\nEstimated total: $${cart.total.toFixed(2)}`);
  console.log(`Budget: $${budget.toFixed(2)} ${withinBudget ? '✅ Within budget' : '❌ Over budget'}`);

  console.log('\n' + cart.getShareInstructions());
}

main().catch(console.error);
