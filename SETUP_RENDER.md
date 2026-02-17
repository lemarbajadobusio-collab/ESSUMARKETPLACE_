# Render Deployment Setup (API + Frontend)

This setup deploys:
- `essu-marketplace-api` (Node/Express backend)
- `essu-marketplace-web` (static frontend)

Both are defined in `render.yaml`.

## 1. Prerequisites

1. Push this project to GitHub.
2. Ensure Supabase schema is created from `backend/supabase_setup.sql`.
3. Have these values ready:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SECRET_KEY`
   - `SUPABASE_BUCKET` (optional)

## 2. Deploy from Blueprint

1. In Render Dashboard, click `New` -> `Blueprint`.
2. Connect your GitHub repo.
3. Render reads `render.yaml` and shows 2 services.
4. Set secret env vars for `essu-marketplace-api`:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SECRET_KEY`
5. Click `Apply`.

## 3. How frontend API URL is wired

During static build, Render runs:

```bash
npm run generate:runtime-config
```

This creates `runtime-config.js` from env vars:
- `ESSU_API_BASE` (highest priority, full URL like `https://.../api`)
- or `ESSU_API_ORIGIN` (auto-linked from API service URL, script appends `/api`)

Frontend files (`login.html`, `admin.html`, `buyer.html`, `seller.html`) load `runtime-config.js` first.

## 4. Verify deployment

1. Open API health:
   - `https://<api-service>.onrender.com/api/health`
2. Open frontend:
   - `https://<web-service>.onrender.com`
3. Test login on deployed frontend.

## 5. If API auto-link does not resolve

Set `ESSU_API_BASE` manually on `essu-marketplace-web`:

```text
https://<api-service>.onrender.com/api
```

Then redeploy static service.
