import { Page } from '@playwright/test';

export async function mockPaymentIntent(
  page: Page,
  options: {
    amount?: number;
    clientSecret?: string;
    status?: string;
    error?: { message: string; code?: string };
  }
) {
  await page.route('/api/create-payment-intent', (route) => {
    if (options.error) {
      return route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: options.error.message }),
      });
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        clientSecret: options.clientSecret || 'test_secret',
      }),
    });
  });

  await page.route('/api/webhooks', (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ received: true }),
    });
  });
}