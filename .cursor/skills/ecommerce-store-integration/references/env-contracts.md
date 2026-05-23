# Environment Variable Contracts — ecommerce-store

When adding a new env var, update **all** relevant `.env` files listed below.

---

## backend/.env

```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/ecommerce-store

# JWT
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
JWT_REFRESH_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_app_password
EMAIL_FROM=noreply@ecommerce-store.com

# CORS — comma-separated list of allowed origins
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

---

## crm_client/.env.local

```env
# API (must end WITHOUT trailing slash)
NEXT_PUBLIC_API_URL=http://localhost:5000

# App
NEXT_PUBLIC_APP_NAME=ecommerce-store CRM
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

---

## store_front/.env.local

```env
# API (must end WITHOUT trailing slash)
NEXT_PUBLIC_API_URL=http://localhost:5000

# App
NEXT_PUBLIC_APP_NAME=ecommerce-store
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## CORS Configuration (backend)

```ts
// backend/src/app.ts (excerpt)
import cors from 'cors';

const allowedOrigins = process.env.CORS_ORIGINS?.split(',') ?? [
  'http://localhost:3000', // store_front
  'http://localhost:3001', // crm_client
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error(`CORS policy: ${origin} not allowed`));
  },
  credentials: true, // REQUIRED — allows cookies (refresh token)
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

---

## Port Conventions

| Project | Default Port |
|---|---|
| `backend/` | 5000 |
| `store_front/` | 3000 |
| `crm_client/` | 3001 |

Run `crm_client` on port 3001: `next dev -p 3001`