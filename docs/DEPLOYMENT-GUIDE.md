# Website Deployment Guide

Complete guide to launching your furniture portfolio site from local development to live on the internet.

## Overview

You'll be deploying a static HTML website with:
- Portfolio pages (HTML/CSS)
- 3D models (GLB files)
- Protected premium pages (license-gated)
- Cloudflare Worker (PDF watermarking backend)

**Total time:** ~2 hours
**Total cost:** ~$10-15/year (domain only)

---

## Step 1: Choose Your Hosting (Free)

For static HTML sites like yours, these are the best free options:

### Option A: Cloudflare Pages ⭐ Recommended

**Why:**
- Free unlimited bandwidth
- Integrates perfectly with your Worker
- Super fast global CDN
- Free SSL certificate
- Easy drag-and-drop deploy

**Limitations:**
- None that affect you

### Option B: Netlify

**Why:**
- Very beginner-friendly
- Great drag-and-drop interface
- Free SSL

**Limitations:**
- 100GB bandwidth/month (probably fine, but not unlimited)

### Option C: GitHub Pages

**Why:**
- Free unlimited bandwidth
- Popular among developers

**Limitations:**
- Requires Git/GitHub knowledge
- More technical setup

**Choose Cloudflare Pages** - you're already using Cloudflare for the Worker, so everything stays in one place.

---

## Step 2: Deploy to Cloudflare Pages (30 min)

### 2.1 Create Cloudflare Account

If you haven't already (from Worker setup):
1. Go to https://cloudflare.com
2. Sign up (free)
3. Verify email

### 2.2 Deploy Your Site

**Method 1: Drag and Drop (Easiest)**

1. In Cloudflare dashboard, go to **Pages**
2. Click **Create a project**
3. Click **Direct Upload**
4. **Drag your entire folder** into the upload area:
   - All HTML files (index.html, project1.html, etc.)
   - style.css
   - models/ folder with GLB files
   - Any other assets
5. Click **Deploy**

Done! Your site is now live at: `https://your-project.pages.dev`

**Method 2: Git/GitHub (Better for updates)**

1. Install Git: https://git-scm.com/downloads
2. Create GitHub account: https://github.com
3. In your project folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
4. Create new repo on GitHub
5. Push your code:
   ```bash
   git remote add origin https://github.com/yourusername/yourrepo.git
   git branch -M main
   git push -u origin main
   ```
6. In Cloudflare Pages → **Connect to Git**
7. Select your GitHub repo
8. Click **Deploy**

**Benefit:** Every time you push to GitHub, site auto-updates.

### 2.3 Test Your Deployed Site

Visit your `.pages.dev` URL and check:
- [ ] Homepage loads correctly
- [ ] All project pages work
- [ ] 3D models load and rotate
- [ ] CSS styling looks correct
- [ ] Links work between pages

---

## Step 3: Get a Domain Name (20 min)

### 3.1 Choose Your Domain

**Brainstorm ideas:**
- yourname.com (personal brand)
- studioname.com (business name)
- furnitureplans.com (descriptive)
- yourname.design, .studio, .works (creative TLDs)

**Check availability:**
- Cloudflare Domains: https://www.cloudflare.com/products/registrar/
- Namecheap: https://www.namecheap.com
- Any registrar search tool

### 3.2 Purchase Domain

**Cloudflare Registrar** (Recommended):
1. In Cloudflare dashboard → **Domain Registration**
2. Search for your domain
3. Add to cart (~$9-10/year for .com)
4. Complete purchase
5. WHOIS privacy is included free

**Alternative - Namecheap**:
1. Go to https://www.namecheap.com
2. Search for domain
3. Add to cart (~$10-13/year)
4. Enable **WhoisGuard** (free, protects your personal info)
5. Complete purchase

### 3.3 Domain Decision Tips

**Good domains:**
- Short and memorable
- Easy to spell
- Professional sounding
- .com if possible (most recognized)

**Avoid:**
- Hyphens or numbers (hard to say aloud)
- Trademarked names
- Very long domains

---

## Step 4: Connect Domain to Your Site (15 min)

### If You Bought from Cloudflare:

1. In Cloudflare → **Pages** → Your project
2. Click **Custom Domains**
3. Click **Set up a custom domain**
4. Enter your domain (e.g., diyfurnitureproject.com)
5. Click **Activate domain**

**Done!** DNS is automatic since Cloudflare manages both.

### If You Bought from Namecheap (or other):

1. In Namecheap → **Domain List** → Click your domain
2. Under **Nameservers**, select **Custom DNS**
3. In Cloudflare → **Websites** → **Add a site**
4. Enter your domain → **Add site** → Choose **Free plan**
5. Cloudflare shows you nameservers (e.g., `ada.ns.cloudflare.com`)
6. Copy these to Namecheap custom DNS fields
7. Wait 5-60 minutes for DNS propagation

Then:
1. In Cloudflare → **Pages** → Your project
2. Click **Custom Domains** → **Set up a custom domain**
3. Enter your domain
4. Click **Activate domain**

**Wait 10-60 minutes** for everything to propagate.

---

## Step 5: Enable HTTPS/SSL (Automatic)

Cloudflare provides free SSL certificates automatically.

**Check:**
1. Visit `https://yourdomain.com` (with https://)
2. You should see a padlock 🔒 in browser
3. If not, wait 10-30 minutes for SSL activation

**In Cloudflare:**
- **SSL/TLS** → Set to **Full** or **Full (strict)**
- **Always Use HTTPS** → Enable (auto-redirects http to https)

---

## Step 6: Deploy Your Cloudflare Worker (15 min)

If you haven't already deployed the PDF watermarking worker:

```bash
cd cloudflare-worker
npm install
wrangler login
wrangler deploy
```

**Custom domain for Worker (optional but professional):**

1. In Cloudflare → **Workers & Pages** → Your worker
2. Go to **Settings** → **Domains & Routes**
3. Click **Add Custom Domain**
4. Use subdomain: `api.yourdomain.com`
5. Click **Add Custom Domain**

Now your webhook URL is: `https://api.yourdomain.com/webhook` (cleaner!)

---

## Step 7: Update Lemon Squeezy Settings (5 min)

### Update Webhook URL

1. Lemon Squeezy → **Settings** → **Webhooks**
2. Edit your webhook
3. Update URL to:
   - `https://api.yourdomain.com/webhook` (if using custom domain)
   - Or keep Worker URL: `https://pdf-watermark-worker.your-subdomain.workers.dev/webhook`

### Update Product Redirect URLs

1. Go to each product in Lemon Squeezy
2. **After purchase redirect** → Set to:
   - `https://yourdomain.com/project1-protected.html`
3. **Email template** → Include link to protected page

---

## Step 8: Final Testing (20 min)

### Test Everything End-to-End

1. **Visit your live site** at your custom domain
2. **Test navigation** - all links work
3. **Test 3D models** - they load and rotate
4. **Test responsive design** - resize browser, check mobile
5. **Test purchase flow:**
   - Click purchase button → Goes to Lemon Squeezy
   - Complete test purchase (use test mode)
   - Check email for license key
   - Visit protected page
   - Enter license key
   - Verify content unlocks
6. **Test PDF generation:**
   - Check Cloudflare Worker logs
   - Verify PDF was created in R2
   - Download and check watermarking

### Checklist

- [ ] Site loads at custom domain (https://yourdomain.com)
- [ ] SSL certificate shows padlock 🔒
- [ ] All pages work (index, project pages)
- [ ] 3D models load correctly
- [ ] Mobile responsive (test on phone)
- [ ] Purchase button links to Lemon Squeezy
- [ ] Test purchase completes successfully
- [ ] License key is received via email
- [ ] Protected page accepts valid license key
- [ ] PDF watermarking works (webhook fires)
- [ ] Watermarked PDF is downloadable

---

## Step 9: Update Your Content (Ongoing)

### How to Update Your Site

**If using drag-and-drop:**
1. Edit HTML files locally
2. Go to Cloudflare Pages → Your project
3. Click **Create new deployment**
4. Drag updated files
5. Deploy

**If using Git/GitHub:**
1. Edit files locally
2. Commit and push:
   ```bash
   git add .
   git commit -m "Update project descriptions"
   git push
   ```
3. Site auto-deploys in 1-2 minutes

### Common Updates

**Add new project:**
1. Create new HTML page (e.g., `project4.html`)
2. Add to index.html
3. Upload model to `/models/`
4. Deploy

**Update 3D model:**
1. Replace GLB file in `/models/`
2. Deploy (same filename = no HTML changes needed)

**Change styling:**
1. Edit `style.css`
2. Deploy

---

## Troubleshooting

### Site not loading at custom domain

**Check:**
1. DNS propagation (wait 1-24 hours): https://dnschecker.org
2. Cloudflare → **DNS** → Verify records point to Pages
3. Clear browser cache (Ctrl+Shift+R)

### 3D models not loading

**Check:**
1. GLB files uploaded to `/models/` folder
2. File paths in HTML are correct (case-sensitive!)
3. Check browser console for errors (F12)
4. Verify files aren't too large (< 100 MB)

### SSL certificate not working

**Fix:**
1. Cloudflare → **SSL/TLS** → Set to **Full**
2. Enable **Always Use HTTPS**
3. Wait 15-30 minutes
4. Clear browser cache

### License key validation not working

**Check:**
1. Product ID in HTML matches Lemon Squeezy product
2. Store ID is correct
3. Browser console for errors (F12)
4. License key hasn't been deactivated

### Worker not receiving webhooks

**Check:**
1. Webhook URL in Lemon Squeezy is correct
2. Test mode is enabled in Lemon Squeezy (for test orders)
3. Worker logs: `wrangler tail`
4. Webhook signature verification (if implemented)

---

## Performance Optimization (Optional)

### Optimize 3D Models

Large GLB files slow loading:

1. **Compress models:**
   - Use glTF-Transform: https://gltf.report/
   - Target: Under 10-20 MB per model
   - Reduce polygon count if needed

2. **Lazy loading:**
   ```html
   <model-viewer loading="lazy" ...>
   ```

### Optimize Images (if you add them)

- Use WebP format (smaller than JPG/PNG)
- Compress: https://squoosh.app
- Target: Under 200 KB per image

### Enable Cloudflare Optimizations

1. Cloudflare → **Speed** → **Optimization**
2. Enable:
   - Auto Minify (HTML, CSS, JS)
   - Brotli compression
3. **Caching** → Set browser cache TTL to 4 hours+

---

## Costs Summary

### One-time:
- $0 (everything is free except domain)

### Annual:
- Domain: $9-15/year
- Cloudflare Pages: Free
- Cloudflare Workers: Free (up to 100k requests/day)
- R2 Storage: Free (up to 10 GB)
- SSL Certificate: Free

### Per-transaction:
- Lemon Squeezy: 5% + $0.50 per sale

**Total to launch:** ~$10-15 (domain only)

---

## Next Steps After Launch

1. **Add Google Analytics** (optional) - track visitors
2. **Add more products** - scale your offerings
3. **SEO optimization** - add meta descriptions, titles
4. **Social media preview** - Open Graph tags for sharing
5. **Email list** - use Lemon Squeezy email marketing
6. **Custom email** - Use Cloudflare Email Routing for free custom email (you@yourdomain.com)

---

## Quick Reference

**Your URLs:**
- Website: `https://yourdomain.com`
- Protected pages: `https://yourdomain.com/project1-protected.html`
- Worker API: `https://api.yourdomain.com` (or Worker subdomain)
- Lemon Squeezy Store: `https://yourstore.lemonsqueezy.com`

**Dashboards:**
- Cloudflare: https://dash.cloudflare.com
- Lemon Squeezy: https://app.lemonsqueezy.com
- Domain registrar: (varies)

**Support:**
- Cloudflare Docs: https://developers.cloudflare.com
- Lemon Squeezy Docs: https://docs.lemonsqueezy.com

---

You're ready to go live! 🚀
