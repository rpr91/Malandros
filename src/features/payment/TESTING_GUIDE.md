# Payment System Testing Guide

## Automated Tests
Run all test suites with:
```bash
npm test
```

Run specific test types:
```bash
# Unit tests
npm test -- paymentService.test.ts

# Integration tests
npm test -- create-payment-intent.test.ts webhooks.test.ts

# End-to-end tests
npx playwright test
```

## Manual Testing with Stripe Test Cards

### Successful Payments
Use these test cards for successful payments:
- **Visa**: `4242424242424242`
- **Mastercard**: `5555555555554444`
- **Amex**: `378282246310005`

### Failed Payments
Test error scenarios with these cards:
- **Card declined**: `4000000000000002`
- **Insufficient funds**: `4000000000009995`
- **Processing error**: `4000000000000119`

### Special Scenarios
- **3D Secure authentication**: `4000002500003155`
- **Delayed authentication**: `4000000400000008`
- **Currency mismatch**: Set amount in non-USD currency and use `4000003560000008`

## Webhook Testing
Use Stripe CLI to test webhooks locally:
```bash
stripe listen --forward-to localhost:3000/api/webhooks
```

Trigger test events:
```bash
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
```

## Test Data Requirements
- Minimum payment amount: $0.50
- Test CVC: Any 3 digits (e.g., `123`)
- Test expiration: Any future date (e.g., `12/30`)