import { test, expect } from '@playwright/test';
import { mockPaymentIntent } from './paymentMocks';

test.describe('Payment Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses
    await mockPaymentIntent(page, {
      amount: 1000,
      clientSecret: 'test_secret',
      status: 'requires_payment_method'
    });

    // Navigate to cart page
    await page.goto('/cart');
  });

  test('should complete payment successfully', async ({ page }) => {
    // Add test items to cart
    await page.click('button:text("Add Test Item")');
    
    // Start payment flow
    await page.click('button:text("Proceed to Payment")');
    
    // Fill payment details (using Stripe test card)
    await page.frameLocator('iframe').first()
      .locator('[placeholder="Card number"]')
      .fill('4242424242424242');
    
    await page.frameLocator('iframe').nth(1)
      .locator('[placeholder="MM / YY"]')
      .fill('12/30');
    
    await page.frameLocator('iframe').nth(2)
      .locator('[placeholder="CVC"]')
      .fill('123');
    
    // Submit payment
    await page.click('button:text("Pay")');
    
    // Verify success state
    await expect(page.locator('text="Payment succeeded"')).toBeVisible();
  });

  test('should handle failed payment', async ({ page }) => {
    // Mock failed payment
    await mockPaymentIntent(page, {
      status: 'failed',
      error: { message: 'Card declined' }
    });

    // Start payment flow
    await page.click('button:text("Proceed to Payment")');
    
    // Fill payment details with failing test card
    await page.frameLocator('iframe').first()
      .locator('[placeholder="Card number"]')
      .fill('4000000000000002');
    
    // Submit payment
    await page.click('button:text("Pay")');
    
    // Verify error state
    await expect(page.locator('text="Card declined"')).toBeVisible();
  });

  test('should validate minimum payment amount', async ({ page }) => {
    // Attempt payment with empty cart
    await page.click('button:text("Proceed to Payment")');
    
    // Verify validation message
    await expect(page.locator('text="Cart total must be at least $0.50"')).toBeVisible();
  });

  test('should handle expired card', async ({ page }) => {
    await mockPaymentIntent(page, {
      status: 'failed',
      error: {
        message: 'Card expired',
        code: 'expired_card'
      }
    });

    await page.click('button:text("Proceed to Payment")');
    await page.frameLocator('iframe').first()
      .locator('[placeholder="Card number"]')
      .fill('4000000000000069');
    await page.click('button:text("Pay")');

    await expect(page.locator('text="Card expired"')).toBeVisible();
    await expect(page.locator('text="Error code: expired_card"')).toBeVisible();
  });

  test('should handle insufficient funds', async ({ page }) => {
    await mockPaymentIntent(page, {
      status: 'failed',
      error: {
        message: 'Insufficient funds',
        code: 'insufficient_funds'
      }
    });

    await page.click('button:text("Proceed to Payment")');
    await page.frameLocator('iframe').first()
      .locator('[placeholder="Card number"]')
      .fill('4000000000009995');
    await page.click('button:text("Pay")');

    await expect(page.locator('text="Insufficient funds"')).toBeVisible();
    await expect(page.locator('text="Error code: insufficient_funds"')).toBeVisible();
  });

  test('should redirect to success page on payment completion', async ({ page }) => {
    await mockPaymentIntent(page, {
      status: 'succeeded',
      clientSecret: 'test_secret_success'
    });

    await page.click('button:text("Proceed to Payment")');
    await page.frameLocator('iframe').first()
      .locator('[placeholder="Card number"]')
      .fill('4242424242424242');
    await page.click('button:text("Pay")');

    await expect(page).toHaveURL(/\/payment\/success/);
  });

  test('should redirect to failure page with error details', async ({ page }) => {
    await mockPaymentIntent(page, {
      status: 'failed',
      error: {
        message: 'Invalid CVC',
        code: 'invalid_cvc'
      }
    });

    await page.click('button:text("Proceed to Payment")');
    await page.frameLocator('iframe').first()
      .locator('[placeholder="Card number"]')
      .fill('4000000000000127');
    await page.click('button:text("Pay")');

    await expect(page).toHaveURL(/\/payment\/failure/);
    expect(page.url()).toContain('error=invalid_cvc');
  });
});