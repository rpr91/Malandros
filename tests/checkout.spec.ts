import { test, expect } from '@playwright/test';

test('User can successfully complete checkout flow', async ({ page }) => {
  await page.goto('http://localhost:3000'); // Go to homepage

  // 1. Add items to cart from menu
  await page.getByRole('link', { name: 'Menu' }).click(); // Navigate to Menu page (adjust selector if needed)
  await page.getByRole('button', { name: /add to cart/i,  exact: false }).first().click(); // Add the first item to cart (adjust selector to be more specific if needed)
  await page.getByRole('button', { name: /add to cart/i,  exact: false }).nth(1).click(); // Add the second item to cart

  // 2. Go to cart and view cart details
  await page.getByRole('link', { name: 'Cart' }).click(); // Navigate to Cart page (adjust selector)
  await expect(page.getByText(/Taco de Asada/)).toBeVisible(); // Verify item in cart (adjust text to match item name)
  await expect(page.getByText(/Taco de Pollo/)).toBeVisible(); // Verify second item in cart
  await expect(page.getByText(/Total: \$[0-9]+\.[0-9]{2}/)).toBeVisible(); // Verify total is displayed (regex for price format)

  // 3. Proceed to checkout
  await page.getByRole('button', { name: /checkout/i }).click(); // Click "Checkout" button (adjust selector)

  // 4. Fill in checkout form (assuming basic fields for MVP)
  await page.getByLabel(/Delivery Address/i).fill('123 Main Street, Anytown');
  await page.getByLabel(/Payment Method/i).selectOption('Credit Card'); // Or however you select payment method

  // 5. Submit order (assuming a "Place Order" button)
  // **Important:** For real payment integration, you'd need to mock Stripe or use a test payment method.
  // For MVP E2E test, we might just mock the payment submission or skip payment for a basic flow test.
  await page.getByRole('button', { name: /place order/i }).click(); // Click "Place Order" button (adjust selector)

  // 6. Verify order success message and order confirmation page (adjust selectors/text to match your app)
  await expect(page.getByText(/Order placed successfully/i)).toBeVisible();
  await expect(page.url()).toContain('/order-confirmation'); // Check if URL changed to order confirmation page

  // Optional: Verify order details on confirmation page (order ID, items, etc.)
  await expect(page.getByText(/Order ID:/i)).toBeVisible();
  // ... more verifications on order details if needed
});