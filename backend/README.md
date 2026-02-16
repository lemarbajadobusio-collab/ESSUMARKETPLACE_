# ESSU Marketplace Database Backend (Supabase Fully)

This backend uses Supabase directly with `SUPABASE_URL` + key (no direct `pg` connection).

- users (buyer/seller/admin)
- products/listings
- cart + cart items
- checkout transactions
- conversations + messages
- admin summary metrics

## 1. Supabase setup

1. Open your Supabase project.
2. Open `SQL Editor`.
3. Run `backend/supabase_setup.sql` once.
4. Create `.env` in project root from `.env.example`.

Example `.env`:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=
PORT=3000
```

`SUPABASE_SERVICE_ROLE_KEY` is optional.  
If present, backend uses it; otherwise it uses anon key.

## 2. Install and run

```bash
npm install
npm start
```

Server URL: `http://localhost:3000`
Health check: `GET /api/health`

On startup, backend attempts to seed default admin if table access allows it:

- email: `admin@essu.local`
- password: `admin12345`

## 3. Core API routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users`
- `GET /api/products`
- `POST /api/products`
- `PATCH /api/products/:id/status`
- `GET /api/cart/:userId`
- `POST /api/cart/:userId/items`
- `DELETE /api/cart/:userId/items/:productId`
- `POST /api/checkout/:buyerUserId`
- `GET /api/transactions?userId=1`
- `GET /api/conversations?userId=1`
- `POST /api/conversations`
- `GET /api/conversations/:conversationId/messages`
- `POST /api/conversations/:conversationId/messages`
- `GET /api/admin/summary`

## 4. Notes for connecting your frontend

Your current files (`seller.js`, `buyer.js`, `admin.js`) still use `localStorage`.  
Next step is to replace those reads/writes with `fetch()` calls to the routes above.

Suggested order:

1. Auth (`register/login`) in buyer + seller login forms
2. Products/listings in buyer + seller pages
3. Cart/checkout in buyer + seller pages
4. Transactions dashboard in seller + admin
5. Conversations/messages sync in buyer + seller
