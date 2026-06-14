const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const newProducts = [
  { name: 'Hot Chocolate', price: 200, tax: 5, unit: 'cup' },
  { name: 'Cold Brew Coffee', price: 260, tax: 5, unit: 'glass' },
  { name: 'Strawberry Milkshake', price: 240, tax: 5, unit: 'glass' },
  { name: 'Mango Smoothie', price: 250, tax: 5, unit: 'glass' },
  { name: 'Matcha Green Tea Latte', price: 290, tax: 5, unit: 'cup' },
  { name: 'Crispy Onion Rings', price: 180, tax: 5, unit: 'basket' },
  { name: 'Chicken Nuggets', price: 250, tax: 5, unit: 'plate' },
  { name: 'Nachos with Cheese', price: 320, tax: 5, unit: 'plate' },
  { name: 'Veg Spring Rolls', price: 210, tax: 5, unit: 'plate' },
  { name: 'Spicy Potato Wedges', price: 170, tax: 5, unit: 'basket' },
  { name: 'Tiramisu', price: 280, tax: 5, unit: 'slice' },
  { name: 'Apple Pie', price: 240, tax: 5, unit: 'slice' },
  { name: 'Caramel Custard', price: 180, tax: 5, unit: 'bowl' },
  { name: 'Brownie with Ice Cream', price: 250, tax: 5, unit: 'plate' },
  { name: 'Lemon Tart', price: 190, tax: 5, unit: 'piece' },
  { name: 'Strawberry Macarons', price: 300, tax: 5, unit: 'box' },
  { name: 'Grilled Chicken Steak', price: 550, tax: 5, unit: 'plate' },
  { name: 'Spaghetti Carbonara', price: 460, tax: 5, unit: 'plate' },
  { name: 'Chicken Tikka Masala', price: 520, tax: 5, unit: 'bowl' },
  { name: 'Veg Hakka Noodles', price: 340, tax: 5, unit: 'plate' },
  { name: 'Thai Green Curry', price: 480, tax: 5, unit: 'bowl' },
  { name: 'Mutton Biryani', price: 580, tax: 5, unit: 'plate' },
  { name: 'Pizza & Cola Combo', price: 500, tax: 5, unit: 'combo' },
  { name: 'Pasta & Garlic Bread Combo', price: 550, tax: 5, unit: 'combo' },
  { name: 'Sandwich & Fries Combo', price: 480, tax: 5, unit: 'combo' },
  { name: 'Burger & Shake Combo', price: 650, tax: 5, unit: 'combo' },
  { name: 'Steak & Wine Combo', price: 1200, tax: 5, unit: 'combo' },
  { name: 'Biryani & Kebab Combo', price: 850, tax: 5, unit: 'combo' },
  { name: 'Wrap & Lemonade Combo', price: 420, tax: 5, unit: 'combo' },
  { name: 'Nuggets & Fries Combo', price: 380, tax: 5, unit: 'combo' }
];

async function run() {
  require('dotenv').config({ path: '../.env' });
  const cats = await prisma.category.findMany();
  let count = 0;
  for (const p of newProducts) {
    let catId = cats[0].id;
    if (['Hot Chocolate', 'Cold Brew Coffee', 'Strawberry Milkshake', 'Mango Smoothie', 'Matcha Green Tea Latte'].includes(p.name)) {
      catId = cats.find(c => c.name === 'Beverages').id;
    } else if (['Crispy Onion Rings', 'Chicken Nuggets', 'Nachos with Cheese', 'Veg Spring Rolls', 'Spicy Potato Wedges'].includes(p.name)) {
      catId = cats.find(c => c.name === 'Quick Bites').id;
    } else if (['Tiramisu', 'Apple Pie', 'Caramel Custard', 'Brownie with Ice Cream', 'Lemon Tart', 'Strawberry Macarons'].includes(p.name)) {
      catId = cats.find(c => c.name === 'Desserts').id;
    } else if (['Grilled Chicken Steak', 'Spaghetti Carbonara', 'Chicken Tikka Masala', 'Veg Hakka Noodles', 'Thai Green Curry', 'Mutton Biryani'].includes(p.name)) {
      catId = cats.find(c => c.name === 'Main Course').id;
    } else if (['Pizza & Cola Combo', 'Pasta & Garlic Bread Combo', 'Sandwich & Fries Combo', 'Burger & Shake Combo', 'Steak & Wine Combo', 'Biryani & Kebab Combo', 'Wrap & Lemonade Combo', 'Nuggets & Fries Combo'].includes(p.name)) {
      catId = cats.find(c => c.name === 'Combos').id;
    }
    const exists = await prisma.product.findFirst({ where: { name: p.name } });
    if (!exists) {
      await prisma.product.create({ data: { ...p, categoryId: catId, status: 'ACTIVE' } });
      count++;
    }
  }
  console.log('Inserted ' + count + ' products');
}
run().catch(console.error).finally(() => prisma.$disconnect());
