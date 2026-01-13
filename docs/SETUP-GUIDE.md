# Production-Lite E-Commerce Setup Guide

This guide walks you through setting up your furniture plans store with automated PDF watermarking and license-key protected content.

## Architecture Overview

**Flow:**
1. Customer purchases on Lemon Squeezy
2. Webhook triggers Cloudflare Worker
3. Worker watermarks PDF with buyer info
4. PDF stored in R2, download link sent to customer
5. Customer uses license key to access premium interactive viewer

**Cost:** ~$0/month for first 1000 sales (free tiers)

---

## Part 1: Cloudflare Setup (30 minutes)

### 1.1 Create Cloudflare Account

1. Go to https://cloudflare.com
2. Sign up for free account
3. No credit card required for free tier

### 1.2 Install Wrangler CLI

```bash
npm install -g wrangler
```

### 1.3 Authenticate Wrangler

```bash
wrangler login
```

This opens browser for authentication.

### 1.4 Create R2 Bucket

```bash
wrangler r2 bucket create furniture-plans-pdfs
```

Note: R2 free tier includes:
- 10 GB storage
- 1 million Class A operations/month
- 10 million Class B operations/month

### 1.5 Deploy the Worker

```bash
cd cloudflare-worker
npm install
wrangler deploy
```

You'll get a URL like: `https://pdf-watermark-worker.YOUR-SUBDOMAIN.workers.dev`

**Save this URL** - you'll need it for Lemon Squeezy webhook.

---

## Part 2: Lemon Squeezy Setup (20 minutes)

### 2.1 Create Lemon Squeezy Account

1. Go to https://lemonsqueezy.com
2. Sign up and complete onboarding
3. Connect your payment method (Stripe or PayPal)

### 2.2 Create Your First Product

1. Go to **Products** → **New Product**
2. Set up product:
   - **Name:** "Chair Building Plans - Premium"
   - **Price:** $29 (or your price)
   - **Product Type:** Digital Product
   - **Enable License Keys:** ✅ YES (important!)

3. Upload a placeholder PDF (you'll replace with automated version)

4. Copy the **Product ID** (you'll need this)

### 2.3 Set Up Webhook

1. Go to **Settings** → **Webhooks**
2. Click **Add Webhook**
3. **URL:** `https://pdf-watermark-worker.YOUR-SUBDOMAIN.workers.dev/webhook`
4. **Events to send:** Select `order_created`
5. **Copy the signing secret** (you'll need this)

### 2.4 Configure License Keys

1. Go to your product settings
2. Under **License Keys**:
   - **Activation limit:** Unlimited (or set a number)
   - **Expires:** Never (or set expiration)

---

## Part 3: Upload PDF Templates (15 minutes)

### 3.1 Prepare Your Template PDF

Create your furniture plan PDF without any customer-specific information. This is the template that will be watermarked.

**Best practices:**
- Leave space in footer for watermark text
- Use standard page sizes (Letter, A4)
- Include all plans, measurements, diagrams
- Don't include buyer-specific info (that's added automatically)

### 3.2 Upload to R2

Use Wrangler to upload your template:

```bash
wrangler r2 object put furniture-plans-pdfs/templates/chair-plans-template.pdf --file=/path/to/your/template.pdf
```

Repeat for each product template.

### 3.3 Update Worker Product Mapping

Edit `cloudflare-worker/pdf-watermark-worker.js`:

```javascript
function getTemplateForProduct(productID) {
  const templates = {
    '12345': 'chair-plans-template.pdf',    // Replace with your product ID
    '12346': 'table-plans-template.pdf',
    '12347': 'shelf-plans-template.pdf',
  };
  return templates[productID] || 'default-template.pdf';
}
```

Replace the product IDs with your actual Lemon Squeezy product IDs.

Redeploy:
```bash
wrangler deploy
```

---

## Part 4: Update Your Website (20 minutes)

### 4.1 Add Protected Pages

For each product, create a protected viewer page based on `project1-protected.html`.

**Update these values in the HTML:**

```javascript
const LEMON_SQUEEZY_STORE_ID = 'YOUR_STORE_ID'; // Get from LS dashboard
const PRODUCT_ID = 'YOUR_PRODUCT_ID';            // From product settings
```

### 4.2 Add Purchase Buttons

On your main portfolio pages (e.g., `project1.html`), add a purchase button:

```html
<div class="project-description-full">
    <p>Your existing description...</p>

    <a href="https://YOUR-STORE.lemonsqueezy.com/checkout/buy/PRODUCT-ID"
       class="purchase-button"
       style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #1f1f1f; color: white; text-decoration: none; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">
        Purchase Building Plans — $29
    </a>

    <p style="margin-top: 12px; font-size: 12px; color: #666;">
        Includes watermarked PDF + interactive viewer with measurements
    </p>
</div>
```

### 4.3 Link to Protected Pages

After purchase, customers should be directed to the protected page:

In your Lemon Squeezy product settings:
- **Redirect after purchase:** `https://yoursite.com/project1-protected.html`

---

## Part 5: Testing (30 minutes)

### 5.1 Test Mode Purchase

1. In Lemon Squeezy, enable **Test Mode**
2. Use test card: `4242 4242 4242 4242`
3. Complete a test purchase
4. Check your email for order confirmation + license key

### 5.2 Verify Webhook

Check Cloudflare Worker logs:
```bash
wrangler tail
```

You should see:
```
Processing order XXX for test@example.com
PDF generated: XXX_timestamp.pdf
```

### 5.3 Verify PDF Generation

Check R2 bucket:
```bash
wrangler r2 object list furniture-plans-pdfs --prefix orders/
```

You should see your watermarked PDF.

### 5.4 Test License Key

1. Go to your protected page (e.g., `project1-protected.html`)
2. Enter the license key from the email
3. Should unlock the viewer

### 5.5 Verify Watermarking

Download the generated PDF and verify:
- Footer has order ID + customer email
- Diagonal watermark visible but not obtrusive
- PDF metadata includes buyer info

---

## Part 6: Go Live (10 minutes)

### 6.1 Disable Test Mode

In Lemon Squeezy dashboard:
- Settings → Test Mode → **Disable**

### 6.2 Update Pricing

Make sure your pricing is correct for production.

### 6.3 Deploy Website

Upload your updated HTML files to your hosting provider.

### 6.4 Test Real Purchase (Optional)

Do a real purchase with a small amount to verify everything works end-to-end.

---

## Costs Breakdown

**Cloudflare:**
- Workers: Free tier (100,000 requests/day)
- R2 Storage: Free tier (10GB, 1M operations/month)
- **Estimated cost:** $0/month for < 1000 sales

**Lemon Squeezy:**
- Platform fee: 5% + $0.50 per transaction
- Payment processing included
- **Example:** $29 sale = ~$1.45 + $0.50 = $1.95 fee → You keep $27.05

**Total overhead:** ~7% + $0.50 per sale

---

## What Customers Experience

1. **Browse** your portfolio site (free preview)
2. **Click** "Purchase Building Plans" button
3. **Pay** via Lemon Squeezy checkout
4. **Receive email** with:
   - License key
   - Link to protected viewer page
   - Download link for watermarked PDF
5. **Enter license key** on protected page
6. **Access** interactive viewer with measurements
7. **Download** personalized PDF with their email watermarked

---

## Maintenance

**Regular tasks:**
- None! System runs automatically

**Scaling:**
- If you exceed R2 free tier, costs are minimal (~$0.015/GB)
- Worker scales automatically
- No database to manage
- No servers to update

**Updates:**
- To update a PDF template: just upload new version to R2
- To add products: create in Lemon Squeezy + upload template
- To change viewer: edit HTML files (they're static!)

---

## Troubleshooting

### Webhook not firing
- Check Lemon Squeezy webhook logs (Settings → Webhooks)
- Verify Worker URL is correct
- Check Worker logs: `wrangler tail`

### PDF not generating
- Check Worker logs for errors
- Verify template exists in R2: `wrangler r2 object list furniture-plans-pdfs --prefix templates/`
- Verify product ID mapping in worker code

### License key not working
- Verify PRODUCT_ID in HTML matches Lemon Squeezy
- Check browser console for API errors
- Verify license key hasn't been deactivated in LS dashboard

### PDF watermark looks wrong
- Adjust watermark positions in worker code
- Test with different PDF sizes
- Check font sizing for readability

---

## Next Steps

Once this is working:

1. **Add more products** - just create new templates and protected pages
2. **Improve viewer** - add annotations, measurements, assembly steps
3. **Build user accounts** - migrate to Firebase Auth for multi-purchase dashboard
4. **Analytics** - track which products are popular
5. **Email sequences** - use Lemon Squeezy email marketing to upsell

---

## Support

**Cloudflare Workers Docs:** https://developers.cloudflare.com/workers/
**Lemon Squeezy Docs:** https://docs.lemonsqueezy.com/
**Lemon Squeezy License API:** https://docs.lemonsqueezy.com/api/license-keys

**Questions?** Check the docs above or test in development mode first.
