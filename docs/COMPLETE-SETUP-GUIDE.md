# Complete Setup Guide - PDF Sales & Model Protection

This guide walks you through completing your setup for selling PDFs and protecting 3D models.

---

## Part 1: Register Workers.dev Subdomain & Deploy Worker

### Step 1: Register Subdomain

1. Go to: https://dash.cloudflare.com/c974197bfd11579a13d39610807c6af7/workers/onboarding
2. Choose a subdomain (e.g., `diyfurniture`, `wlk-r`, etc.)
3. Click **Register**

### Step 2: Deploy Worker

```bash
cd C:\Users\Walker\Documents\diyfurnitureproject\cloudflare-worker
wrangler deploy --env=""
```

You should see:
```
Published diyfurniture-worker
  https://diyfurniture-worker.YOUR_SUBDOMAIN.workers.dev
```

**Copy this URL** - you'll need it for the next steps.

---

## Part 2: Update Website Configuration

### Step 1: Update model-loader.js

Open `model-loader.js` and replace:

```javascript
const WORKER_URL = 'https://diyfurniture-worker.YOUR_SUBDOMAIN.workers.dev';
```

With your actual worker URL from Step 1.

### Step 2: Add Buy Button Styling

Add this to `style.css`:

```css
/* Buy Button */
.buy-button {
    display: inline-block;
    padding: 12px 24px;
    background: #1f1f1f;
    color: white;
    text-decoration: none;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    font-weight: 500;
    border: 1px solid #1f1f1f;
    margin-top: 16px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    transition: all 0.2s ease;
}

.buy-button:hover {
    background: white;
    color: #1f1f1f;
}

.buy-button:active {
    transform: translateY(1px);
}
```

---

## Part 3: Set Up Lemon Squeezy

### Step 1: Create Account

1. Go to https://lemonsqueezy.com
2. Sign up for free account
3. Complete your store profile

### Step 2: Create Products

For each furniture project, create a product:

**Example:**

**Product 1:**
- Name: "Modern Chair Building Plans"
- Price: $19.99
- Type: Digital Download
- Description: "Complete furniture plans with measurements, materials list, and assembly instructions"
- **Important:** Leave "Files" section empty (we generate via webhook)

**Note your Product IDs** - you'll need them later.

### Step 3: Get Checkout URLs

For each product, copy the checkout URL:
- Format: `https://YOURSTORE.lemonsqueezy.com/checkout/buy/PRODUCT_ID`

### Step 4: Set Up Webhook

1. In Lemon Squeezy dashboard → **Settings** → **Webhooks**
2. Click **Add webhook endpoint**
3. **URL:** `https://diyfurniture-worker.YOUR_SUBDOMAIN.workers.dev/webhook`
4. **Events:** Check `order_created`
5. **Copy the Signing Secret**
6. Click **Save**

### Step 5: Store Webhook Secret

```bash
cd cloudflare-worker
wrangler secret put LEMON_SQUEEZY_WEBHOOK_SECRET
# Paste the signing secret from step 4
```

### Step 6: Map Products to PDFs

Edit `cloudflare-worker/unified-worker.js`:

Find the `getTemplateForProduct()` function and update:

```javascript
function getTemplateForProduct(productId) {
  const templates = {
    'YOUR_PRODUCT_ID_1': 'templates/chair-plans.pdf',
    'YOUR_PRODUCT_ID_2': 'templates/table-plans.pdf',
    'YOUR_PRODUCT_ID_3': 'templates/shelf-plans.pdf',
  };
  return templates[productId] || 'templates/default-template.pdf';
}
```

Replace `YOUR_PRODUCT_ID_X` with actual Lemon Squeezy product IDs.

Redeploy:
```bash
wrangler deploy --env=""
```

---

## Part 4: Upload PDF Templates

### Step 1: Create Your PDF Plans

Create professional PDF plans including:
- Detailed measurements
- Materials list
- Step-by-step assembly instructions
- Cutting diagrams
- 300 DPI for printing

### Step 2: Upload to R2

```bash
# Upload each template
wrangler r2 object put furniture-plans/templates/chair-plans.pdf --file=path/to/your/chair-plans.pdf
wrangler r2 object put furniture-plans/templates/table-plans.pdf --file=path/to/your/table-plans.pdf
wrangler r2 object put furniture-plans/templates/shelf-plans.pdf --file=path/to/your/shelf-plans.pdf
```

---

## Part 5: Add Buy Buttons to Website

### Update index.html

Add buy buttons to each project:

```html
<div class="project-description">
    <p>Modern minimalist chair design with detailed building plans.</p>
    <a href="https://YOURSTORE.lemonsqueezy.com/checkout/buy/PRODUCT_ID"
       class="buy-button">
        Buy Building Plans — $19.99
    </a>
</div>
```

Replace:
- `YOURSTORE` with your Lemon Squeezy store name
- `PRODUCT_ID` with the product ID from Lemon Squeezy

Do this for all 3 projects in index.html.

---

## Part 6: Test Everything

### Test Model Protection

1. Open your website: https://diyfurnitureproject.com
2. Open browser DevTools (F12) → Console tab
3. Look for messages: `Loaded model: model1.glb`
4. Models should load normally
5. Try right-clicking model → "Open in new tab"
6. URL should have `?expires=` and `&signature=` parameters
7. URL should expire after 1 hour

### Test PDF Generation (Test Mode)

1. Enable Lemon Squeezy test mode
2. Make a test purchase ($0 charged)
3. Check worker logs: `wrangler tail`
4. Look for "PDF generated" message
5. Check email for download link
6. Verify PDF has watermark with your email

### Test Buy Buttons

1. Click "Buy Building Plans" button
2. Should go to Lemon Squeezy checkout
3. Test the purchase flow (test mode)
4. Verify email delivery

---

## Part 7: Deploy Changes to GitHub

```bash
cd C:\Users\Walker\Documents\diyfurnitureproject

# Stage all changes
git add .

# Commit
git commit -m "Add PDF sales and model protection system

- Unified Cloudflare Worker for signed URLs and PDF watermarking
- Protected model loading with time-limited URLs
- Lemon Squeezy integration for payments
- Buy buttons for all products
- Updated styling and configuration"

# Push to GitHub
git push
```

Wait 2-3 minutes for GitHub Pages to rebuild.

---

## Part 8: Go Live

### Enable Production Mode

1. In Lemon Squeezy → **Settings** → Toggle off "Test Mode"
2. Verify all products are published
3. Test one real purchase (you'll be charged)
4. Verify watermarked PDF is sent

### Promote Your Site

- Share on social media
- Add to your portfolio
- Submit to design communities

---

## What's Protected Now

### 3D Models
- ✅ No permanent download links in HTML
- ✅ URLs expire after 1 hour
- ✅ Signed URLs can't be shared
- ✅ Harder to steal (but not 100% impossible)

### PDFs
- ✅ Watermarked with buyer email + order ID
- ✅ Traceable back to original buyer
- ✅ Deters redistribution
- ✅ Legal evidence if needed

---

## Pricing & Costs

### Revenue Example
- 3 products at $19.99 each
- 10 sales/month
- **Gross:** $199.90/month
- **Lemon Squeezy fee (5%):** -$10.00
- **Payment processing (3%):** -$6.00
- **Your net:** ~$183.90/month

### Cloudflare Costs
- **R2 Storage:** $0/month (under 10GB)
- **R2 Operations:** $0/month (under free tier)
- **Workers:** $0/month (under 100k requests/day)

**Total monthly cost:** $0 for first 1,000 sales

---

## Troubleshooting

### Models Not Loading

**Check 1:** DevTools console for errors
```
Error: Failed to get signed URL
```
**Fix:** Verify WORKER_URL in model-loader.js

**Check 2:** CORS errors
**Fix:** Ensure R2 bucket has CORS policy set

### PDFs Not Generating

**Check 1:** Worker logs
```bash
wrangler tail
```

**Check 2:** Webhook received?
- Lemon Squeezy dashboard → Webhooks → View logs

**Check 3:** Template exists?
```bash
wrangler r2 object list furniture-plans --prefix templates/
```

### Buy Buttons Don't Work

**Check 1:** Correct checkout URL format?
- Should be: `https://STORE.lemonsqueezy.com/checkout/buy/PRODUCT_ID`

**Check 2:** Product published?
- Lemon Squeezy dashboard → Products → Check status

---

## Next Steps

### Optional Enhancements

1. **Custom Domain for Worker**
   - Instead of `.workers.dev`, use `api.diyfurnitureproject.com`

2. **Analytics**
   - Track purchases
   - Monitor model views
   - A/B test pricing

3. **More Products**
   - Create additional furniture plans
   - Bundle deals (3 plans for $49.99)

4. **Email Marketing**
   - Build customer list
   - Send new product announcements

5. **Premium Tiers**
   - Basic plans ($19.99)
   - Premium with video tutorials ($39.99)
   - Complete collection ($99.99)

---

## Support

If you run into issues:

1. Check worker logs: `wrangler tail`
2. Check Lemon Squeezy webhook logs
3. Check browser DevTools console
4. Verify all URLs and IDs are correct

---

## Summary Checklist

- [ ] Workers.dev subdomain registered
- [ ] Worker deployed successfully
- [ ] model-loader.js updated with worker URL
- [ ] Buy button CSS added
- [ ] Lemon Squeezy account created
- [ ] Products created in Lemon Squeezy
- [ ] Webhook configured
- [ ] Webhook secret stored in worker
- [ ] Product IDs mapped in worker code
- [ ] PDF templates uploaded to R2
- [ ] Buy buttons added to HTML
- [ ] Changes committed to GitHub
- [ ] Test purchase completed
- [ ] Production mode enabled

---

You're all set! Your site now has:
- Protected 3D models with signed URLs
- Automated PDF watermarking
- Payment processing
- Professional sales workflow

Good luck with your furniture business! 🪑✨
