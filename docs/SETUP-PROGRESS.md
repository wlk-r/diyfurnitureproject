# Setup Progress - Lemon Squeezy Integration

**Last Updated:** January 2026

---

## Current Status: PAUSED - Waiting on PDF Creation

### Completed Steps

- [x] Buy Plan button added to all product pages
- [x] Button pulls price from products.json
- [x] `checkoutUrl` field added to products.json (empty, ready for URLs)
- [x] Disabled "Coming Soon" state shows when no checkout URL
- [x] Cloudflare Worker ready (`unified-worker.js`) with:
  - Webhook handler for Lemon Squeezy
  - PDF watermarking with order ID + customer email
  - R2 storage integration
- [x] Materials and dimensions now display on main page

### Waiting On

- [ ] **Create PDF templates for each product** (furniture building plans)

### Next Steps (When PDFs Are Ready)

1. **Upload PDF templates to R2:**
   ```bash
   cd cloudflare-worker
   wrangler r2 object put furniture-plans/templates/work-table-plans.pdf --file=path/to/work-table-plans.pdf
   ```

2. **Create Lemon Squeezy account:** https://lemonsqueezy.com

3. **Create products in Lemon Squeezy** (one per furniture plan)

4. **Add checkout URLs to products.json:**
   ```json
   "checkoutUrl": "https://YOURSTORE.lemonsqueezy.com/checkout/buy/PRODUCT_ID"
   ```

5. **Configure webhook in Lemon Squeezy dashboard:**
   - URL: `https://YOUR-WORKER.workers.dev/webhook`
   - Event: `order_created`
   - Copy the signing secret

6. **Store webhook secret:**
   ```bash
   wrangler secret put LEMON_SQUEEZY_WEBHOOK_SECRET
   ```

7. **Map Lemon Squeezy product IDs to PDF templates** in `unified-worker.js`:
   ```javascript
   function getTemplateForProduct(productId) {
     const templates = {
       'LS_PRODUCT_ID_1': 'templates/work-table-plans.pdf',
       // Add more products here
     };
     return templates[productId] || 'templates/default-template.pdf';
   }
   ```

8. **Deploy worker:**
   ```bash
   wrangler deploy
   ```

9. **Test with Lemon Squeezy test mode**

---

## PDF Requirements

- High quality (300 DPI for printing)
- Include: measurements, diagrams, materials list, assembly instructions
- Leave space at bottom for watermark footer
- Save as PDF format

---

## Reference Documentation

- `docs/COMPLETE-SETUP-GUIDE.md` - Full step-by-step guide
- `docs/MONETIZATION-GUIDE.md` - Pricing and protection overview
- `docs/PDF-TEMPLATE-GUIDE.md` - PDF creation guidelines
