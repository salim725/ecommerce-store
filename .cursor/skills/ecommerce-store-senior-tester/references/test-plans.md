# Test Plans Reference — BDD Style

## Table of Contents
1. [BDD Template](#1-bdd-template)
2. [Auth Module Test Plan](#2-auth-module-test-plan)
3. [Product Module Test Plan](#3-product-module-test-plan)
4. [Order Module Test Plan](#4-order-module-test-plan)
5. [Edge Case Identification Framework](#5-edge-case-identification-framework)
6. [Regression Checklist Template](#6-regression-checklist-template)

---

## 1. BDD Template

Use this structure for any new feature plan:

```
Feature: <Feature Name>
  As a <actor>
  I want to <action>
  So that <business value>

  Background:
    Given <shared preconditions for all scenarios>

  Scenario: <Happy path name>
    Given <initial state>
    When <action taken>
    Then <expected outcome>
    And <additional assertions>

  Scenario: <Validation error name>
    Given ...
    When ...
    Then ...

  Scenario: <Auth/permission error name>
    ...

  Scenario: <Edge case name>
    ...
```

**Always write scenarios in this order:** happy path → validation errors → auth/permission errors → edge cases.

---

## 2. Auth Module Test Plan

```
Feature: User Authentication
  As a visitor or existing user
  I want to register, log in, and manage my session
  So that my account and data are secure

  Background:
    Given the backend is running
    And the MongoDB database is seeded

  # ── REGISTRATION ──────────────────────────────────────────────

  Scenario: Successful registration
    Given I am a new visitor
    When I POST /api/v1/auth/register with valid name, email, and matching passwords
    Then I receive HTTP 201
    And the response body contains { success: true, data: { token: <jwt> } }
    And a new User document exists in the DB with hashed password
    And a welcome email is dispatched via Nodemailer

  Scenario: Registration with existing email
    Given a user with email "alice@test.com" already exists
    When I POST /api/v1/auth/register with email "alice@test.com"
    Then I receive HTTP 409
    And { success: false, message: "Email already registered" }

  Scenario: Registration with mismatched passwords
    When I POST with password "abc" and confirmPassword "xyz"
    Then I receive HTTP 422
    And the error message references the confirmPassword field

  Scenario: Registration with weak password (if policy enforced)
    When I POST with password "12345"
    Then I receive HTTP 422

  # ── LOGIN ──────────────────────────────────────────────────────

  Scenario: Successful login
    Given a registered user with email "alice@test.com" and password "Password1!"
    When I POST /api/v1/auth/login with those credentials
    Then I receive HTTP 200
    And the token in the response is a valid JWT
    And the JWT payload contains { id, role }

  Scenario: Login with wrong password
    When I POST /api/v1/auth/login with correct email but wrong password
    Then I receive HTTP 401
    And the response does NOT reveal whether the email exists (security: no user enumeration)

  Scenario: Login with non-existent email
    When I POST with "nobody@test.com"
    Then I receive HTTP 401
    And the response message is identical to the wrong-password response

  Scenario: Brute force protection
    When I POST /api/v1/auth/login more than 100 times in 15 minutes from the same IP
    Then subsequent requests receive HTTP 429

  # ── TOKEN / SESSION ─────────────────────────────────────────────

  Scenario: Accessing protected route with valid token
    Given a valid JWT
    When I GET /api/v1/users/me with Authorization: Bearer <token>
    Then I receive HTTP 200 and my user profile

  Scenario: Accessing protected route with expired token
    Given a JWT that has expired
    When I make a protected request
    Then I receive HTTP 401 and a message indicating token expiry

  Scenario: Accessing protected route without token
    When I GET /api/v1/users/me without Authorization header
    Then I receive HTTP 401
```

---

## 3. Product Module Test Plan

```
Feature: Product Management
  As an admin (via CRM) or customer (via storefront)
  I want to manage and browse products
  So that the catalogue is accurate and purchasable

  # ── ADMIN CRUD (backend + CRM) ─────────────────────────────────

  Scenario: Admin creates a product
    Given I am authenticated as an admin
    When I POST /api/v1/products with { name, price, stock, category }
    Then I receive HTTP 201
    And the product appears in GET /api/v1/products

  Scenario: Customer cannot create a product
    Given I am authenticated as a customer
    When I POST /api/v1/products
    Then I receive HTTP 403

  Scenario: Admin creates product with negative price
    When I POST with { price: -1 }
    Then I receive HTTP 422 with a price validation error

  Scenario: Admin creates product with duplicate name (if unique constraint)
    Given a product "Laptop" already exists
    When I POST with name "Laptop"
    Then I receive HTTP 409

  Scenario: Admin updates product price
    Given product with id X exists
    When I PATCH /api/v1/products/X with { price: 899 }
    Then I receive HTTP 200
    And GET /api/v1/products/X returns price 899

  Scenario: Admin deletes product
    When I DELETE /api/v1/products/X
    Then I receive HTTP 200
    And GET /api/v1/products/X returns HTTP 404

  # ── CUSTOMER BROWSE (storefront) ──────────────────────────────

  Scenario: Listing products with pagination
    Given 55 products exist
    When I GET /api/v1/products?page=3&limit=20
    Then I receive 15 products
    And pagination.pages = 3, pagination.page = 3

  Scenario: Filtering products by category
    When I GET /api/v1/products?category=electronics
    Then all returned products have category "electronics"

  Scenario: Sorting products by price ascending
    When I GET /api/v1/products?sort=price&order=asc
    Then products are returned in ascending price order

  # ── IMAGE UPLOAD ──────────────────────────────────────────────

  Scenario: Admin uploads a product image
    When I POST /api/v1/products/:id/image with a valid JPEG file
    Then I receive HTTP 200
    And product.imageUrl points to a Cloudinary URL

  Scenario: Uploading a non-image file is rejected
    When I POST with a .pdf file
    Then I receive HTTP 400

  Scenario: Uploading a file that exceeds size limit is rejected
    When I POST with a file > 5MB
    Then I receive HTTP 413
```

---

## 4. Order Module Test Plan

```
Feature: Order Lifecycle
  As a customer or admin
  I want to place, view, and manage orders
  So that purchases are tracked from cart to delivery

  Scenario: Customer places an order
    Given I am authenticated as a customer
    And my cart contains 2 items
    When I POST /api/v1/orders with shipping details
    Then I receive HTTP 201
    And the order has status "pending"
    And product stock is decremented by the ordered quantities
    And a confirmation email is dispatched

  Scenario: Order fails when product is out of stock
    Given product X has stock: 0
    When I POST an order containing product X
    Then I receive HTTP 422
    And the error message references stock availability
    And no Order document is created

  Scenario: Admin updates order status to "shipped"
    Given an order with status "pending"
    When I PATCH /api/v1/orders/:id with { status: "shipped" }
    Then I receive HTTP 200
    And a shipping notification email is sent to the customer

  Scenario: Invalid status transition is rejected
    Given an order with status "delivered"
    When I PATCH with { status: "pending" }
    Then I receive HTTP 422 (cannot move backwards in lifecycle)

  Scenario: Customer cannot view another customer's order
    Given Order A belongs to Customer 1
    When Customer 2 requests GET /api/v1/orders/A
    Then they receive HTTP 403

  Scenario: Admin can view all orders with pagination
    When I GET /api/v1/orders as admin
    Then I receive all orders with standard pagination shape
```

---

## 5. Edge Case Identification Framework

For any feature, systematically check these dimensions:

### Input edge cases
- [ ] Empty string / null / undefined for every required field
- [ ] Maximum length strings (check Mongoose maxlength + Joi max)
- [ ] Negative numbers for price/stock/quantity
- [ ] Zero values (price: 0, stock: 0, quantity: 0)
- [ ] Float where integer expected
- [ ] Special characters and SQL/NoSQL injection attempts in string fields
- [ ] Extremely large numbers (beyond Number.MAX_SAFE_INTEGER)
- [ ] Unicode / emoji in name fields

### Auth edge cases
- [ ] No token
- [ ] Expired token
- [ ] Malformed token (truncated, wrong signature)
- [ ] Token from a deleted user
- [ ] Token with wrong role for the resource

### Concurrency edge cases
- [ ] Two users placing the last item in stock simultaneously
- [ ] Admin deleting a product while a customer is checking out with it
- [ ] Duplicate form submission (double-click on submit button)

### File upload edge cases
- [ ] File with valid extension but invalid MIME type (e.g., renamed .exe → .jpg)
- [ ] Zero-byte file
- [ ] File exactly at the size limit
- [ ] File 1 byte over the size limit
- [ ] Multiple files when only one is accepted

### Pagination edge cases
- [ ] Page beyond total (e.g., page=999 when only 3 pages exist)
- [ ] Page=0 or page=-1
- [ ] Limit=0
- [ ] Limit > 100 (if a max is enforced)

### External service edge cases
- [ ] Cloudinary is unreachable (test with mock rejection)
- [ ] Nodemailer SMTP failure (should not break the main operation)
- [ ] MongoDB timeout on a slow query

---

## 6. Regression Checklist Template

Run this checklist after every significant change to the ecommerce-store:

### Backend

- [ ] All auth routes return correct status codes and response shapes
- [ ] Protected routes reject unauthenticated requests with 401
- [ ] Admin-only routes reject customer tokens with 403
- [ ] Pagination works correctly on all list endpoints
- [ ] Joi validation rejects invalid payloads with 422
- [ ] Global error handler returns `{ success: false, message }` for all unhandled errors
- [ ] Rate limiter is active on auth routes
- [ ] File upload rejects invalid types and oversized files
- [ ] Cloudinary upload is mocked in tests (no real uploads during CI)

### CRM (crm_client)

- [ ] Login redirects to /dashboard on success
- [ ] Unauthenticated access to any CRM route redirects to /login
- [ ] Product list loads and paginates correctly
- [ ] Creating/editing/deleting a product shows a toast and updates the list
- [ ] Order status update works and persists
- [ ] Axios 401 interceptor triggers token refresh and retries the request
- [ ] Error toast appears when API returns an error

### Storefront (store_front)

- [ ] Homepage loads products via ISR
- [ ] Product detail page shows correct data
- [ ] Add to cart updates the cart badge
- [ ] Cart persists on page refresh (localStorage/Redux persist)
- [ ] Checkout form validates all fields before enabling submit
- [ ] Order confirmation page is shown after successful checkout
- [ ] Unauthenticated checkout redirects to /login then back to checkout
- [ ] Search returns correct results and shows empty state for no results

### Cross-project

- [ ] Backend error shape matches what both frontends parse (`{ success, message, errors? }`)
- [ ] Pagination shape matches what both frontends render (`{ total, page, limit, pages }`)
- [ ] JWT payload fields match what both frontends read (`id`, `role`)
- [ ] All NEXT_PUBLIC_API_URL env vars point to the correct backend instance
```