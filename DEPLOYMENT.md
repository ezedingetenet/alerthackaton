# Deployment Guide: Vercel + Supabase

## Setup Steps

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Wait for the project to initialize
4. Go to **SQL Editor** and run the schema:
   - Copy all content from `BackEnd/db/schema.sql`
   - Paste into Supabase SQL Editor and execute

### 2. Get Supabase Credentials

1. Go to **Project Settings** → **API**
2. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`

### 3. Setup Environment Variables in Vercel

1. Go to [vercel.com](https://vercel.com) and sign up
2. Connect your GitHub repository
3. Click **New Project** and select your repo
4. In **Environment Variables**, add:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   JWT_SECRET=your_secure_random_string_here
   JWT_EXPIRES_IN=7d
   ```
5. Click **Deploy**

### 4. Update Frontend API URL

After Vercel deployment, you'll get a URL like `https://your-project.vercel.app`

Update the API URL in your frontend files:

**FrontEnd/register.html:**
```javascript
const API_URL = 'https://your-project.vercel.app/api';
```

**FrontEnd/contact.html:**
```javascript
const API_URL = 'https://your-project.vercel.app/api';
```

**FrontEnd/index.html:**
```javascript
const API_URL = 'https://your-project.vercel.app/api';
```

**FrontEnd/admin/*.html files:**
```javascript
const API_URL = 'https://your-project.vercel.app/api';
```

---

## Vercel URL Structure

Your API endpoints will be:
```
https://your-project.vercel.app/api/auth/register
https://your-project.vercel.app/api/auth/login
https://your-project.vercel.app/api/schedule
... etc
```

---

## Testing Deployment

1. Visit `https://your-project.vercel.app/api/schedule` in browser
   - Should return JSON array of schedule items

2. Test registration:
   ```bash
   curl -X POST https://your-project.vercel.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","full_name":"Test User"}'
   ```

3. Test admin login:
   ```bash
   curl -X POST https://your-project.vercel.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@digitalhealthforum.com","password":"admin123"}'
   ```

---

## Common Issues

### 404 Not Found
- Make sure all API files are in the `api/` folder
- Check that folder structure matches: `api/[route]/index.js` or `api/[route]/[id].js`
- Redeploy after any file structure changes

### Environment Variables Not Set
- Go to Vercel Project Settings → Environment Variables
- Make sure variables are set for Production
- Redeploy the project

### CORS Errors
- All API routes have CORS headers set
- Frontend can be on any domain

### Supabase Connection Error
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Check that database tables were created in Supabase

---

## Redeploy After Changes

After updating code:
1. Push to GitHub: `git push`
2. Vercel will auto-redeploy

Or manually redeploy:
1. Go to Vercel dashboard
2. Select your project
3. Click **Redeploy**

---

## Production Checklist

- [ ] Supabase project created and schema imported
- [ ] Vercel project connected to GitHub
- [ ] Environment variables set in Vercel
- [ ] Frontend API URLs updated to Vercel URL
- [ ] Test registration flow
- [ ] Test admin login
- [ ] Test schedule loading
- [ ] Test support tickets

---

## Database Admin Access

To manage your Supabase database:
1. Go to Supabase dashboard
2. Select your project
3. Click **Table Editor** to view data
4. Click **SQL Editor** to run queries

---

## Monitoring & Logs

**Vercel Logs:**
1. Go to Vercel dashboard
2. Select your project
3. Click **Deployments** tab
4. Click on a deployment to see logs

**Supabase Logs:**
1. Go to Supabase dashboard
2. Click **Logs** in the sidebar

---

## Next Steps

- Add custom domain in Vercel
- Enable automatic builds on GitHub push
- Set up monitoring/alerts
- Consider upgrading to Pro plan if needed
