# Monetization & Protection Guide

Complete guide to selling PDFs and protecting your 3D models.

---

## Part 1: Selling PDFs with Lemon Squeezy

### Overview

You'll sell furniture plans as PDFs that are automatically watermarked with buyer information to prevent redistribution.

### Step-by-Step Setup

#### 1. Create Lemon Squeezy Account

1. Go to https://lemonsqueezy.com
2. Sign up for an account (free to start)
3. Complete your store profile
4. Add payment methods (Stripe/PayPal)

**Pricing:**
- Free: $0 setup fee
- Fee per sale: 5% + payment processing (~3%)
- Example: $20 PDF = you keep ~$17.60

#### 2. Create Your Products

1. In Lemon Squeezy dashboard → **Products** → **New Product**
2. Create a product for each furniture plan:

**Example Product:**
- **Name:** "Modern Chair Building Plans"
- **Price:** $19.99
- **Type:** Digital Download
- **Description:** Full furniture plans with measurements, materials list, and step-by-step instructions
- **Files:** Leave empty (we'll generate watermarked PDFs via webhook)

3. Note the **Product ID** (you'll need this later)

#### 3. Create R2 Bucket for PDFs

```bash
cd C:\Users\Walker\Documents\diyfurnitureproject\cloudflare-worker
wrangler r2 bucket create furniture-plans-pdfs
```

#### 4. Upload PDF Templates

Create your PDF templates (the base plans before watermarking), then upload:

```bash
# Upload your template PDFs
wrangler r2 object put furniture-plans-pdfs/templates/chair-plans.pdf --file=path/to/your/chair-plans.pdf
wrangler r2 object put furniture-plans-pdfs/templates/table-plans.pdf --file=path/to/your/table-plans.pdf
```

**PDF Template Requirements:**
- High quality (300 DPI for printing)
- Include measurements, diagrams, materials list
- Leave space at bottom for watermark footer
- Save as PDF (not Word/Pages)

#### 5. Deploy Cloudflare Worker

```bash
cd C:\Users\Walker\Documents\diyfurnitureproject\cloudflare-worker

# Install dependencies
npm install

# Deploy to Cloudflare
wrangler deploy
```

**Worker URL will be:**
```
https://pdf-watermark-worker.YOUR_SUBDOMAIN.workers.dev
```

Copy this URL - you'll need it for the webhook.

#### 6. Configure Lemon Squeezy Webhook

1. Go to Lemon Squeezy dashboard → **Settings** → **Webhooks**
2. Click **Add webhook endpoint**
3. **URL:** `https://pdf-watermark-worker.YOUR_SUBDOMAIN.workers.dev/webhook`
4. **Events to send:** Check `order_created`
5. **Signing secret:** Copy the secret shown
6. Click **Save**

#### 7. Set Webhook Secret in Worker

```bash
wrangler secret put LEMON_SQUEEZY_WEBHOOK_SECRET
# Paste the signing secret from step 6
```

#### 8. Map Products to Templates

Edit `cloudflare-worker/pdf-watermark-worker.js`:

```javascript
function getTemplateForProduct(productID) {
  const templates = {
    '123456': 'templates/chair-plans.pdf',    // Replace with your Product ID
    '123457': 'templates/table-plans.pdf',    // Replace with your Product ID
  };
  return templates[productID] || 'templates/default-template.pdf';
}
```

Redeploy:
```bash
wrangler deploy
```

#### 9. Add Buy Buttons to Your Site

Update your HTML files with Lemon Squeezy checkout links:

**Example (index.html):**
```html
<div class="project-description">
    <p>Modern minimalist chair design with detailed building plans.</p>
    <a href="https://YOURSTORE.lemonsqueezy.com/checkout/buy/PRODUCT_ID"
       class="buy-button">
        Buy Plans - $19.99
    </a>
</div>
```

Add CSS for the button in `style.css`:
```css
.buy-button {
    display: inline-block;
    padding: 12px 24px;
    background: #1f1f1f;
    color: white;
    text-decoration: none;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    border: 1px solid #1f1f1f;
    margin-top: 16px;
}

.buy-button:hover {
    background: white;
    color: #1f1f1f;
}
```

#### 10. Test the Flow

1. Complete a test purchase using Lemon Squeezy test mode
2. Check Cloudflare Worker logs: `wrangler tail`
3. Verify watermarked PDF appears in R2
4. Check email for download link

---

## Part 2: Protecting 3D Models

### The Problem

Currently, anyone can:
1. Right-click your 3D model → "Open in new tab"
2. Download the `.glb` file directly from R2
3. Use it without permission

### The Solution: Signed URLs

Use time-limited, authenticated URLs that expire after viewing.

### How It Works

```
1. User visits page
2. JavaScript requests signed URL from Cloudflare Worker
3. Worker checks if user has access (paid customer, license key, etc.)
4. Worker generates time-limited signed URL (valid for 1 hour)
5. Model viewer loads model using signed URL
6. URL expires after 1 hour
```

### Implementation Options

#### Option A: Simple Time-Limited URLs (Basic Protection)

**Pros:**
- Harder to share (URLs expire)
- No permanent download link in HTML
- Works with model-viewer

**Cons:**
- Determined users can still save during viewing
- Not 100% secure (browser cache)

#### Option B: License-Protected Models (Full Protection)

**Pros:**
- Only paying customers see models
- Watermarked models per customer
- Best protection

**Cons:**
- Requires authentication system
- More complex setup

### Which Option Should You Choose?

**For free portfolio content (index.html):**
- Use **Option A** (time-limited URLs)
- Accept that some downloads may happen
- Focus on making buying easier than stealing

**For premium content (project1-protected.html):**
- Use **Option B** (license protection)
- Lock models behind payment
- Generate watermarked models per customer

---

## Part 3: Implementing Model Protection

### Option A: Time-Limited Signed URLs

I can help you create a Cloudflare Worker that:
1. Generates signed URLs with expiration
2. Serves models only with valid signatures
3. URLs expire after 1 hour

This prevents:
- Direct linking to models
- Sharing model URLs (they expire)
- Search engines indexing model files

### Option B: Full License Protection

For premium content:
1. Customer purchases via Lemon Squeezy
2. Receives license key via email
3. Enters license key on your site
4. License grants access to:
   - Premium page (project1-protected.html)
   - Watermarked 3D model
   - Watermarked PDF plans

---

## Costs Breakdown

### Lemon Squeezy
- **Free** to set up
- **5% + payment processing** per sale
- Example: $20 sale = you keep $17.60

### Cloudflare R2
- **Free tier:** 10GB storage, 10M reads/month
- **Your usage:** ~200MB models + PDFs
- **Estimated cost:** $0/month (under free tier)

### Cloudflare Workers
- **Free tier:** 100,000 requests/day
- **Your usage:** ~1,000 requests/day
- **Estimated cost:** $0/month (under free tier)

### Total Monthly Cost
**$0** for first 1,000 sales/month (all free tiers)

---

## Revenue Potential

**Example Pricing:**
- PDF Plans: $19.99 each
- 3 products available
- Average: 10 sales/month

**Monthly Revenue:**
- Gross: $199.90
- Lemon Squeezy fees (8%): -$15.99
- Your net: **$183.91/month**

**Annual Revenue:** $2,206.92

---

## Next Steps - What Do You Want?

1. **Start selling PDFs first** (simpler, generates revenue faster)
2. **Add model protection later** (more complex, better for premium content)

Or:

1. **Do both at once** (full protection for premium content)

Which approach do you prefer?

### If you want to start with PDFs:
I'll help you:
1. Set up Lemon Squeezy account
2. Deploy the PDF worker
3. Add buy buttons to your site

### If you want to protect models too:
I'll help you:
1. Create signed URL worker for free content
2. Set up license-protected models for premium content
3. Integrate everything

**What would you like to do first?**
