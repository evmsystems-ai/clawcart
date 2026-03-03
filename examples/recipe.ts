/**
 * Recipe Cart Example
 * 
 * Shows how to create reusable shopping "recipes" that can be 
 * loaded and reordered quickly.
 */

import { ClawCart, type SimpleCart } from '@clawcart/core';

// Example: Saved recipes (would be stored in DB in production)
const recipes: Record<string, SimpleCart> = {
  'weekly-groceries': {
    retailer: 'walmart',
    items: [
      { name: 'Milk 1 gallon', quantity: 2, price: 3.99 },
      { name: 'Eggs 12-count', quantity: 1, price: 2.99 },
      { name: 'Bread loaf', quantity: 1, price: 2.49 },
      { name: 'Bananas 1 bunch', quantity: 2, price: 1.49 },
      { name: 'Chicken breast 2lb', quantity: 1, price: 8.99 },
    ],
  },
  
  'office-supplies': {
    retailer: 'amazon',
    items: [
      { name: 'Printer paper 500 sheets', quantity: 2, price: 8.99 },
      { name: 'Black pens 12-pack', quantity: 1, price: 4.99 },
      { name: 'Sticky notes 3x3', quantity: 3, price: 3.49 },
      { name: 'Highlighters 6-pack', quantity: 1, price: 5.99 },
    ],
  },
  
  'bbq-party-10': {
    retailer: 'costco',
    items: [
      { name: 'Hamburger patties 20-pack', quantity: 1, price: 24.99 },
      { name: 'Hot dogs 24-pack', quantity: 1, price: 12.99 },
      { name: 'Burger buns 16-count', quantity: 2, price: 4.99 },
      { name: 'Hot dog buns 16-count', quantity: 2, price: 4.49 },
      { name: 'Ketchup 64oz', quantity: 1, price: 5.99 },
      { name: 'Mustard 32oz', quantity: 1, price: 3.99 },
      { name: 'Chips variety pack', quantity: 2, price: 14.99 },
      { name: 'Soda 36-pack', quantity: 1, price: 12.99 },
    ],
  },
};

async function main() {
  // User says: "Reorder the BBQ party supplies"
  const recipeName = 'bbq-party-10';
  
  console.log(`Loading recipe: ${recipeName}\n`);
  
  // Load from saved recipe
  const saved = recipes[recipeName];
  if (!saved) {
    console.error('Recipe not found');
    return;
  }
  
  // Create cart from recipe
  const cart = ClawCart.fromSimple(saved);
  cart.setName('BBQ Party (10 people)');

  // Show what we're ordering
  console.log('=== Recipe Items ===\n');
  for (const item of cart.items) {
    const subtotal = (item.price ?? 0) * item.quantity;
    console.log(`  • ${item.name} x${item.quantity} = $${subtotal.toFixed(2)}`);
  }

  console.log(`\nEstimated total: $${cart.total.toFixed(2)}`);
  console.log(`Retailer: ${cart.retailer}`);

  // User can modify before sharing
  console.log('\n--- Adding extra items ---\n');
  
  cart.addItem({ name: 'Paper plates 100-count', quantity: 1, price: 9.99 });
  cart.addItem({ name: 'Napkins 200-count', quantity: 1, price: 6.99 });
  
  console.log(`New total: $${cart.total.toFixed(2)} (${cart.itemCount} items)`);

  // Get share instructions
  console.log('\n' + cart.getShareInstructions());
}

main().catch(console.error);
