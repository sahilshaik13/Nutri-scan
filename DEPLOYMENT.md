# NutriScan Deployment Guide

## Pre-Deployment Requirements

### 1. Gemini API Setup
```bash
# Go to Google Cloud Console (console.cloud.google.com)
# 1. Create a new project or select existing one
# 2. Enable Generative Language API
# 3. Create an API key
# 4. Copy the API key
```

### 2. Supabase Project
```bash
# Your Supabase project must have:
# - Authentication enabled with email verification
# - All database migrations applied
# - Email SMTP configured for verification emails
```

### 3. Environment Variables

Create in Vercel project settings:

```env
# Required: Gemini API
GOOGLE_GEMINI_API_KEY=<your_api_key_here>

# Optional: Alternative Gemini key name
# GEMINI_API_KEY=<your_api_key_here>

# Required: Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key_here>
```

## Step-by-Step Deployment

### Option 1: Deploy via Vercel CLI

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Link project to Vercel
vercel link

# 4. Set environment variables
vercel env add GOOGLE_GEMINI_API_KEY
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# 5. Deploy to production
vercel --prod
```

### Option 2: Deploy via GitHub

```bash
# 1. Push code to GitHub repository
git add .
git commit -m "NutriScan implementation complete"
git push origin main

# 2. In Vercel Dashboard:
#    - Connect GitHub repository
#    - Select repository
#    - Configure project
#    - Add environment variables
#    - Deploy
```

### Option 3: Deploy via Vercel Dashboard

1. Go to vercel.com
2. Click "Add New..." > "Project"
3. Connect your GitHub/GitLab account
4. Select the NutriScan repository
5. Configure project settings
6. Add environment variables
7. Click "Deploy"

## Post-Deployment Verification

### 1. Database Health
```bash
# Check in Supabase Dashboard:
# - Tables exist: food_scans, health_profiles, guest_sessions, insights_cache
# - Indexes created
# - RLS policies enabled
# - Auth users table configured
```

### 2. Environment Variables
```bash
# Verify in Vercel project settings:
# - GOOGLE_GEMINI_API_KEY is set
# - NEXT_PUBLIC_SUPABASE_URL is correct
# - NEXT_PUBLIC_SUPABASE_ANON_KEY is correct
```

### 3. Test Workflows

#### Test 1: Guest Scan
```
1. Go to https://your-app.vercel.app
2. Click "Try a Scan Now"
3. Upload/capture food image
4. Verify Gemini analysis
5. Answer optional questions
6. Verify results display
7. See sign-up upsell
```

#### Test 2: User Registration & Auth
```
1. Go to /auth/sign-up
2. Create account with valid email
3. Check email for verification link
4. Click verification link
5. Should redirect with verified=true
6. Login page should show success message
7. Login with credentials
```

#### Test 3: Onboarding
```
1. After login, should redirect to /onboarding
2. Go through all 4 steps
3. Select allergies, intolerances, conditions, lifestyle
4. Click Complete
5. Should redirect to /dashboard
```

#### Test 4: Authenticated Scan
```
1. From dashboard, click "Scan Food"
2. Capture/upload food image
3. Verify Gemini analysis
4. Answer questions
5. Click Save
6. Should redirect to /insights/[scanId]
7. Verify all data displays correctly
```

#### Test 5: Dashboard & Profile
```
1. View dashboard with scan history
2. Click on a scan - should open /insights/[scanId]
3. Go to profile page
4. Edit health preferences
5. Verify changes save
6. Test logout
```

## Monitoring & Debugging

### View Deployment Logs
```bash
# Via Vercel CLI
vercel logs

# Via Vercel Dashboard
# Settings > Logs > Functions/Frontend
```

### Common Issues & Solutions

#### Issue: Gemini API Returns 403 Error
```
Solution:
1. Verify API key is correct
2. Check API key has Generative Language API enabled
3. Verify API key has correct permissions
4. Try alternative key name: GEMINI_API_KEY
```

#### Issue: Supabase Connection Error
```
Solution:
1. Verify NEXT_PUBLIC_SUPABASE_URL is correct
2. Verify NEXT_PUBLIC_SUPABASE_ANON_KEY is correct
3. Check Supabase project is active
4. Verify CORS settings in Supabase
```

#### Issue: Email Verification Not Working
```
Solution:
1. Configure SMTP in Supabase Email Templates
2. Verify sender email is configured
3. Check email template in Supabase
4. Test with admin API if needed
```

#### Issue: Images Not Displaying in Results
```
Solution:
1. Verify base64 encoding is correct
2. Check image MIME type is valid
3. Verify image size < 5MB
4. Check browser CORS settings
```

### Performance Monitoring

#### Check Vercel Analytics
- Go to Vercel Dashboard > Analytics
- Monitor Core Web Vitals
- Check error rates
- Review function execution times

#### Check Supabase Performance
- Go to Supabase Dashboard > Logs
- Monitor database queries
- Check auth logs for errors
- Verify RLS policies aren't blocking queries

## Rollback Procedure

If deployment has critical issues:

```bash
# Via Vercel CLI
vercel rollback

# Or via Dashboard:
# Deployments > Previous deployment > Promote to Production
```

## Database Backup

Before major updates:

```bash
# Supabase automatic backups:
# Settings > Database > Backups
# Download backup if needed

# Manual backup via pg_dump:
pg_dump postgresql://user:password@db.supabase.co/postgres > backup.sql
```

## Maintenance Tasks

### Weekly
- [ ] Check error logs in Vercel
- [ ] Monitor Gemini API quota usage
- [ ] Review failed requests

### Monthly
- [ ] Check database performance
- [ ] Review analytics data
- [ ] Update dependencies

### Quarterly
- [ ] Full security audit
- [ ] Database optimization
- [ ] Performance profiling

## Scaling Considerations

### If High Volume
1. Enable Vercel Pro for higher limits
2. Configure Supabase connection pooling
3. Enable caching for insights data
4. Consider CDN for images

### If High API Usage
1. Monitor Gemini API quota
2. Implement request queuing
3. Cache analysis results
4. Consider batch processing

## Support & Troubleshooting

### Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Google Generative AI Docs](https://ai.google.dev/docs)
- [GitHub Issues](https://github.com/sahilshaik13/Nutri-scan/issues)

### Getting Help
1. Check logs in Vercel dashboard
2. Check logs in Supabase dashboard
3. Review IMPLEMENTATION.md for architecture
4. Check COMPLETION_CHECKLIST.md for all features
5. Test with sample data from seed script

## Deployment Complete!

After successful deployment:

1. **Celebrate!** 🎉 - You've deployed NutriScan
2. **Share** - Get feedback from users
3. **Monitor** - Keep an eye on logs and analytics
4. **Iterate** - Based on user feedback, implement improvements

Your NutriScan application is now live and ready for users!
