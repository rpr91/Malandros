# Payment Flow Management System Test Plan

## 1. Introduction
This document outlines the comprehensive test strategy for the payment flow management system (Ticket #14).

## 2. Test Scenarios

### 2.1 Frontend Error Handling
| Scenario | Test Card | Expected Result | Verification Method |
|----------|-----------|-----------------|---------------------|
| Invalid card number | 4242424242424241 | "Invalid card number" error | UI validation, no API call |
| Expired card | 4000000000000069 | "Card expired" error | Stripe error response |
| Incorrect CVC | 4242424242424242 (CVC 999) | "Incorrect CVC" error | Stripe error response |
| Insufficient funds | 4000000000009995 | "Insufficient funds" error | Webhook failure event |

### 2.2 Successful Payment Flow
| Scenario | Test Data | Expected Result | Verification Method |
|----------|-----------|-----------------|---------------------|
| Visa payment | 4242424242424242 | Success confirmation | Webhook success event |
| Amex payment | 378282246310005 | Success confirmation | Webhook success event |
| Minimum amount ($0.50) | amount=50 | Success confirmation | Database update |

### 2.3 Failed Payment Flow
| Scenario | Test Data | Expected Result | Verification Method |
|----------|-----------|-----------------|---------------------|
| Card declined | 4000000000000002 | "Card declined" message | Webhook failure event |
| Processing error | 4000000000000119 | "Processing error" message | Stripe Dashboard check |

### 2.4 Webhook Event Processing
| Scenario | Trigger Event | Expected Result | Verification Method |
|----------|--------------|-----------------|---------------------|
| Success event | payment_intent.succeeded | Order status updated | Database verification |
| Failed event | payment_intent.payment_failed | Error logged | Server logs check |
| Invalid signature | Modified webhook | 400 Bad Request | Stripe CLI output |

## 3. Testing Approach

### 3.1 Unit Tests
- Expand `paymentService.test.ts` to cover:
  - All payment status scenarios
  - Error handling paths
  - Metadata handling

### 3.2 Integration Tests
```typescript
// Example: Test webhook signature verification
test('rejects invalid webhook signature', async () => {
  const req = mockRequest({ invalidSignature: true });
  const res = await webhookHandler(req);
  expect(res.statusCode).toBe(400);
});
```

### 3.3 End-to-End Tests
- Add Playwright tests for:
  - 3D Secure flow (4000002500003155)
  - Payment status polling
  - Error recovery flows

## 4. Test Data Requirements
- Stripe test cards
- Order IDs with known patterns (test-*)
- Multi-currency test cases

## 5. Completion Criteria
- 95% code coverage for payment service
- All critical paths automated
- Manual test checklist completed