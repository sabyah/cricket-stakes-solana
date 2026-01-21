# Lovable Environment Variables Setup Guide

## How to Add Environment Variables in Lovable

### Step 1: Access Lovable Dashboard
1. Go to your Lovable project dashboard
2. Navigate to **Settings** or **Environment Variables** section
3. Look for **"Environment Variables"** or **"Secrets"** tab

### Step 2: Add Frontend Environment Variables

For the **Frontend (cricket-stakes-solana)**, add these variables:

```env
VITE_PRIVY_APP_ID=your_privy_app_id_here
VITE_API_BASE_URL=http://localhost:3001/api
```

**Important:** 
- In Vite, environment variables must start with `VITE_` to be accessible in the browser
- Replace `your_privy_app_id_here` with your actual Privy App ID from Privy Dashboard

### Step 3: Add Backend Environment Variables (if deploying backend)

For the **Backend (alphax-market-user-service-be)**, add these variables:

```env
PRIVY_APP_ID=your_privy_app_id_here
PRIVY_APP_SECRET=your_privy_app_secret_here
PORT=3001
FRONTEND_URL=https://your-frontend-domain.com
NODE_ENV=preprod
REDIS_URL=your_redis_connection_string
```

**Important:**
- Never commit `.env` files to git
- Use Lovable's environment variable settings (not files)
- Keep `PRIVY_APP_SECRET` secure - never expose it

### Step 4: Environment-Specific Variables

If Lovable supports multiple environments (preprod, production):

1. **Preprod Environment:**
   ```env
   VITE_API_BASE_URL=https://api-preprod.yourdomain.com/api
   NODE_ENV=preprod
   ```

2. **Production Environment:**
   ```env
   VITE_API_BASE_URL=https://api.yourdomain.com/api
   NODE_ENV=production
   ```

### Step 5: Verify Deployment

After adding environment variables:
1. Trigger a new deployment in Lovable
2. Check the build logs to ensure variables are loaded
3. Test the application to verify Privy authentication works

## Common Lovable Platforms

### If using Vercel:
1. Go to Project Settings → Environment Variables
2. Add variables for **Production**, **Preview**, and **Development**
3. Select which environments each variable applies to

### If using Netlify:
1. Go to Site Settings → Build & Deploy → Environment
2. Add variables in the "Environment variables" section
3. Set scope (All scopes, Production, Deploy previews, Branch deploys)

### If using Railway/Render:
1. Go to Project Settings → Variables
2. Add environment variables
3. They will be available to your application at runtime

## Troubleshooting

- **Variables not loading?** Make sure they start with `VITE_` for frontend
- **Build fails?** Check that all required variables are set
- **Runtime errors?** Verify variable names match exactly (case-sensitive)
