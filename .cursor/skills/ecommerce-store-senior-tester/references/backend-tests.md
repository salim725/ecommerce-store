# Backend Tests Reference

## Table of Contents
1. [Controller Unit Tests](#1-controller-unit-tests)
2. [Middleware Unit Tests](#2-middleware-unit-tests)
3. [Mongoose Model Unit Tests](#3-mongoose-model-unit-tests)
4. [Auth Integration Tests](#4-auth-integration-tests)
5. [CRUD Integration Tests](#5-crud-integration-tests)
6. [File Upload Integration Tests](#6-file-upload-integration-tests)
7. [Joi Validation Tests](#7-joi-validation-tests)
8. [Error Handling Tests](#8-error-handling-tests)

---

## 1. Controller Unit Tests

Controllers are tested in isolation — mock the model and test only the controller logic.

```ts
// backend/src/__tests__/unit/controllers/product.controller.test.ts
import { Request, Response, NextFunction } from 'express';
import { getProducts } from '../../../controllers/product.controller';
import { Product } from '../../../models/product.model';

// We mock the entire model layer so controller tests don't touch the DB.
// If a test fails here, the bug is in the controller, not the DB layer.
jest.mock('../../../models/product.model');

const mockReq = (overrides: Partial<Request> = {}): Partial<Request> => ({
  query: {},
  params: {},
  body: {},
  user: { id: 'user123', role: 'admin' }, // inject auth context
  ...overrides,
});

const mockRes = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext: NextFunction = jest.fn();

describe('ProductController.getProducts', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('Happy path', () => {
    it('should return paginated products with 200', async () => {
      const fakeProducts = [{ _id: 'p1', name: 'Laptop', price: 999 }];
      // Simulate the .lean().select().skip().limit() chain
      (Product.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue(fakeProducts),
            }),
          }),
        }),
      });
      (Product.countDocuments as jest.Mock).mockResolvedValue(1);

      const req = mockReq({ query: { page: '1', limit: '20' } });
      const res = mockRes();

      await getProducts(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: fakeProducts,
          pagination: expect.objectContaining({ total: 1, page: 1, limit: 20 }),
        })
      );
    });
  });

  describe('Error path', () => {
    it('should call next() with error when DB throws', async () => {
      // Controllers must never swallow errors — they must forward to error middleware
      const dbError = new Error('DB connection lost');
      (Product.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockRejectedValue(dbError),
            }),
          }),
        }),
      });

      const req = mockReq();
      const res = mockRes();

      await getProducts(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(dbError);
      expect(res.json).not.toHaveBeenCalled(); // controller must NOT respond itself
    });
  });
});
```

---

## 2. Middleware Unit Tests

### Auth Middleware

```ts
// backend/src/__tests__/unit/middleware/auth.middleware.test.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { protect, restrictTo } from '../../../middleware/auth.middleware';

jest.mock('jsonwebtoken');

const mockReq = (headers: Record<string, string> = {}): Partial<Request> => ({
  headers,
  user: undefined,
});
const mockRes = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext: NextFunction = jest.fn();

describe('protect middleware', () => {
  beforeEach(() => jest.clearAllMocks());

  // This is the most critical test: a missing token must ALWAYS return 401.
  // Any other behaviour is a security vulnerability.
  it('returns 401 when Authorization header is absent', async () => {
    const req = mockReq();
    const res = mockRes();
    await protect(req as Request, res as Response, mockNext);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('returns 401 when token is malformed', async () => {
    (jwt.verify as jest.Mock).mockImplementation(() => { throw new Error('invalid'); });
    const req = mockReq({ authorization: 'Bearer bad.token.here' });
    const res = mockRes();
    await protect(req as Request, res as Response, mockNext);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('attaches decoded user to req and calls next() on valid token', async () => {
    const decoded = { id: 'user123', role: 'admin' };
    (jwt.verify as jest.Mock).mockReturnValue(decoded);
    const req = mockReq({ authorization: 'Bearer valid.token' });
    const res = mockRes();
    await protect(req as Request, res as Response, mockNext);
    expect((req as any).user).toEqual(decoded);
    expect(mockNext).toHaveBeenCalledWith(); // called with no args = success
  });
});

describe('restrictTo middleware', () => {
  it('blocks non-admin users from admin-only routes', () => {
    const req = { user: { role: 'customer' } } as any;
    const res = mockRes();
    restrictTo('admin')(req, res as Response, mockNext);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('allows through users whose role is in the allowed list', () => {
    const req = { user: { role: 'admin' } } as any;
    const res = mockRes();
    restrictTo('admin', 'superadmin')(req, res as Response, mockNext);
    expect(mockNext).toHaveBeenCalledWith();
  });
});
```

### Global Error Middleware

```ts
// backend/src/__tests__/unit/middleware/error.middleware.test.ts
import { errorHandler } from '../../../middleware/error.middleware';

// The error middleware is the last line of defence — it must ALWAYS produce the
// standard { success: false, message } shape, even for unknown errors.
describe('errorHandler middleware', () => {
  const mockRes = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  it('uses error.statusCode when present', () => {
    const err: any = new Error('Not found');
    err.statusCode = 404;
    const res = mockRes();
    errorHandler(err, {} as any, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Not found' });
  });

  it('defaults to 500 for unknown errors', () => {
    const res = mockRes();
    errorHandler(new Error('Boom'), {} as any, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('includes validation errors when present', () => {
    const err: any = new Error('Validation failed');
    err.statusCode = 422;
    err.errors = { email: 'Invalid email' };
    const res = mockRes();
    errorHandler(err, {} as any, res, jest.fn());
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ errors: { email: 'Invalid email' } })
    );
  });
});
```

---

## 3. Mongoose Model Unit Tests

```ts
// backend/src/__tests__/unit/models/user.model.test.ts
import { User } from '../../../models/user.model';
// mongodb-memory-server is already wired in setup.ts

describe('User Model', () => {
  describe('Validation', () => {
    // Test schema constraints directly — don't rely on the API layer to catch these.
    // If the model allows bad data, every layer above is compromised.
    it('rejects a user without required email', async () => {
      const user = new User({ name: 'Alice', password: 'secret123' });
      await expect(user.validate()).rejects.toThrow(/email/);
    });

    it('rejects duplicate email', async () => {
      await User.create({ name: 'Alice', email: 'alice@test.com', password: 'pass123' });
      const dupe = new User({ name: 'Bob', email: 'alice@test.com', password: 'pass456' });
      await expect(dupe.save()).rejects.toThrow(/duplicate/i);
    });

    it('accepts a valid user document', async () => {
      const user = await User.create({
        name: 'Alice',
        email: 'alice@test.com',
        password: 'hashedpassword',
        role: 'customer',
      });
      expect(user._id).toBeDefined();
      expect(user.createdAt).toBeDefined();
    });
  });

  describe('Pre-save hooks', () => {
    it('hashes password before saving', async () => {
      const user = await User.create({
        name: 'Bob',
        email: 'bob@test.com',
        password: 'plaintext',
      });
      // The stored password must never equal the plaintext input
      expect(user.password).not.toBe('plaintext');
      expect(user.password).toMatch(/^\$2[ab]\$/); // bcrypt hash prefix
    });
  });
});
```

---

## 4. Auth Integration Tests

Integration tests hit real routes via Supertest against an in-memory MongoDB.
They test the full middleware → controller → DB → response chain.

```ts
// backend/src/__tests__/integration/auth/auth.test.ts
import request from 'supertest';
import app from '../../../app';
import { User } from '../../../models/user.model';

describe('POST /api/v1/auth/register', () => {
  const validPayload = {
    name: 'Alice',
    email: 'alice@test.com',
    password: 'Password1!',
    confirmPassword: 'Password1!',
  };

  describe('Happy path', () => {
    it('creates a user and returns JWT', async () => {
      const res = await request(app).post('/api/v1/auth/register').send(validPayload);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      // Confirm user was actually persisted
      const user = await User.findOne({ email: validPayload.email });
      expect(user).not.toBeNull();
    });
  });

  describe('Validation errors', () => {
    it('returns 422 for missing email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...validPayload, email: '' });
      expect(res.status).toBe(422);
      expect(res.body).toMatchObject({ success: false, message: expect.any(String) });
    });

    it('returns 422 when passwords do not match', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...validPayload, confirmPassword: 'different' });
      expect(res.status).toBe(422);
    });
  });

  describe('Duplicate handling', () => {
    it('returns 409 when email is already registered', async () => {
      await request(app).post('/api/v1/auth/register').send(validPayload);
      const res = await request(app).post('/api/v1/auth/register').send(validPayload);
      expect(res.status).toBe(409);
    });
  });
});

describe('POST /api/v1/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/v1/auth/register').send({
      name: 'Alice', email: 'alice@test.com', password: 'Password1!', confirmPassword: 'Password1!',
    });
  });

  it('returns 200 with token on correct credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'alice@test.com', password: 'Password1!' });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  it('returns 401 on wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'alice@test.com', password: 'wrongpass' });
    expect(res.status).toBe(401);
  });

  it('returns 401 for non-existent email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@test.com', password: 'Password1!' });
    expect(res.status).toBe(401);
  });
});
```

### Helper: get auth token

```ts
// backend/src/__tests__/helpers/auth.helper.ts
import request from 'supertest';
import app from '../../app';

export const getAuthToken = async (
  role: 'admin' | 'customer' = 'customer'
): Promise<string> => {
  const email = `${role}@test.com`;
  await request(app).post('/api/v1/auth/register').send({
    name: role, email, password: 'Password1!', confirmPassword: 'Password1!', role,
  });
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password: 'Password1!' });
  return res.body.data.token;
};
```

---

## 5. CRUD Integration Tests

```ts
// backend/src/__tests__/integration/products/product.crud.test.ts
import request from 'supertest';
import app from '../../../app';
import { getAuthToken } from '../../helpers/auth.helper';

let adminToken: string;
let customerToken: string;
let createdProductId: string;

beforeAll(async () => {
  adminToken = await getAuthToken('admin');
  customerToken = await getAuthToken('customer');
});

describe('Product CRUD', () => {
  describe('POST /api/v1/products', () => {
    const validProduct = { name: 'Laptop', price: 999, category: 'electronics', stock: 10 };

    it('admin can create a product', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validProduct);
      expect(res.status).toBe(201);
      createdProductId = res.body.data._id;
    });

    it('customer is forbidden from creating products', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(validProduct);
      expect(res.status).toBe(403);
    });

    it('unauthenticated request returns 401', async () => {
      const res = await request(app).post('/api/v1/products').send(validProduct);
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/products', () => {
    it('returns paginated list — public route, no auth needed', async () => {
      const res = await request(app).get('/api/v1/products?page=1&limit=10');
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        success: true,
        data: expect.any(Array),
        pagination: expect.objectContaining({ page: 1, limit: 10 }),
      });
    });
  });

  describe('PATCH /api/v1/products/:id', () => {
    it('admin can update price', async () => {
      const res = await request(app)
        .patch(`/api/v1/products/${createdProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 899 });
      expect(res.status).toBe(200);
      expect(res.body.data.price).toBe(899);
    });
  });

  describe('DELETE /api/v1/products/:id', () => {
    it('admin can delete a product', async () => {
      const res = await request(app)
        .delete(`/api/v1/products/${createdProductId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    it('deleted product returns 404 on subsequent GET', async () => {
      const res = await request(app).get(`/api/v1/products/${createdProductId}`);
      expect(res.status).toBe(404);
    });
  });
});
```

---

## 6. File Upload Integration Tests

```ts
// backend/src/__tests__/integration/uploads/product-image.test.ts
import request from 'supertest';
import path from 'path';
import app from '../../../app';
import { getAuthToken } from '../../helpers/auth.helper';
import cloudinary from '../../../config/cloudinary';

// Mock Cloudinary so tests don't make real HTTP calls or incur costs.
// We test that our code calls Cloudinary correctly — not that Cloudinary works.
jest.mock('../../../config/cloudinary', () => ({
  uploader: {
    upload_stream: jest.fn(),
  },
}));

const FIXTURE_IMAGE = path.join(__dirname, '../../fixtures/test-image.jpg');

describe('POST /api/v1/products/:id/image', () => {
  let adminToken: string;
  let productId: string;

  beforeAll(async () => {
    adminToken = await getAuthToken('admin');
    // Create a product to attach image to
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Camera', price: 500, stock: 5 });
    productId = res.body.data._id;
  });

  beforeEach(() => {
    // Return a fake Cloudinary URL
    (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
      (_opts: any, callback: Function) => {
        callback(null, { secure_url: 'https://res.cloudinary.com/test/image/upload/v1/test.jpg' });
        return { end: jest.fn() };
      }
    );
  });

  it('accepts jpeg and updates product imageUrl', async () => {
    const res = await request(app)
      .post(`/api/v1/products/${productId}/image`)
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('image', FIXTURE_IMAGE);
    expect(res.status).toBe(200);
    expect(res.body.data.imageUrl).toBe(
      'https://res.cloudinary.com/test/image/upload/v1/test.jpg'
    );
  });

  it('rejects non-image file types with 400', async () => {
    const res = await request(app)
      .post(`/api/v1/products/${productId}/image`)
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('image', path.join(__dirname, '../../fixtures/malicious.pdf'));
    expect(res.status).toBe(400);
  });

  it('returns 401 without auth token', async () => {
    const res = await request(app)
      .post(`/api/v1/products/${productId}/image`)
      .attach('image', FIXTURE_IMAGE);
    expect(res.status).toBe(401);
  });
});
```

---

## 7. Joi Validation Tests

```ts
// backend/src/__tests__/unit/validators/product.validator.test.ts
import { createProductSchema } from '../../../validators/product.validator';

// Validation schemas are pure functions — test them independently of HTTP.
// This catches schema logic bugs before they can reach the route layer.
describe('createProductSchema', () => {
  const valid = { name: 'Laptop', price: 999, stock: 10, category: 'electronics' };

  it('passes for a fully valid payload', () => {
    const { error } = createProductSchema.validate(valid);
    expect(error).toBeUndefined();
  });

  it('fails when price is negative', () => {
    const { error } = createProductSchema.validate({ ...valid, price: -1 });
    expect(error?.details[0].message).toMatch(/price/);
  });

  it('fails when name is empty', () => {
    const { error } = createProductSchema.validate({ ...valid, name: '' });
    expect(error).toBeDefined();
  });

  it('fails when stock is a float', () => {
    const { error } = createProductSchema.validate({ ...valid, stock: 1.5 });
    expect(error?.details[0].message).toMatch(/integer/i);
  });
});
```

---

## 8. Error Handling Tests

```ts
// backend/src/__tests__/integration/error-handling.test.ts
import request from 'supertest';
import app from '../../app';

// These tests ensure the global error middleware is wired correctly.
// A misconfigured error handler silently swallows errors in production.
describe('Global error handling', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/v1/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false });
  });

  it('returns 429 when rate limit is exceeded', async () => {
    // Hit the same endpoint rapidly to trigger rate limiting
    const requests = Array.from({ length: 110 }, () =>
      request(app).post('/api/v1/auth/login').send({})
    );
    const responses = await Promise.all(requests);
    const tooMany = responses.filter(r => r.status === 429);
    expect(tooMany.length).toBeGreaterThan(0);
  });
});
```