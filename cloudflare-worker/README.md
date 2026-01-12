# PDF Watermarking Worker

Cloudflare Worker that automatically watermarks furniture plan PDFs when customers make purchases on Lemon Squeezy.

## Features

- **Automatic PDF watermarking** with buyer information
- **Footer watermark**: Order ID + customer email + date
- **Diagonal watermark**: Customer email (faint)
- **Metadata embedding**: Buyer info in PDF properties
- **R2 storage**: Secure cloud storage for generated PDFs
- **Webhook integration**: Triggered by Lemon Squeezy orders

## How It Works

1. Customer completes purchase on Lemon Squeezy
2. Lemon Squeezy sends webhook to this Worker
3. Worker fetches PDF template from R2
4. Adds watermarks with buyer information
5. Saves watermarked PDF to R2
6. Returns download URL to Lemon Squeezy
7. Customer receives download link via email

## Endpoints

### POST /webhook
Receives Lemon Squeezy webhooks for order processing.

**Expected payload:**
```json
{
  "meta": {
    "event_name": "order_created"
  },
  "data": {
    "id": "order-id",
    "attributes": {
      "user_email": "customer@example.com",
      "user_name": "Customer Name",
      "first_order_item": {
        "product_id": "12345"
      }
    }
  }
}
```

### GET /download/:filename
Serves watermarked PDFs to customers.

**Example:** `/download/order-123_1234567890.pdf`

## Environment Setup

### Required Bindings

**R2 Bucket:**
```toml
[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "furniture-plans-pdfs"
```

**Environment Variables:**
```bash
# Set via Cloudflare dashboard or CLI
wrangler secret put LEMON_SQUEEZY_WEBHOOK_SECRET
```

## Deployment

### First Time Setup

```bash
# Install dependencies
npm install

# Create R2 bucket
wrangler r2 bucket create furniture-plans-pdfs

# Deploy worker
wrangler deploy
```

### Updates

```bash
wrangler deploy
```

### Local Development

```bash
npm run dev
```

## R2 Bucket Structure

```
furniture-plans-pdfs/
├── templates/
│   ├── chair-plans-template.pdf
│   ├── table-plans-template.pdf
│   └── default-template.pdf
└── orders/
    ├── order-123_1234567890.pdf
    ├── order-124_1234567891.pdf
    └── ...
```

## Uploading Templates

```bash
wrangler r2 object put furniture-plans-pdfs/templates/your-template.pdf --file=./path/to/template.pdf
```

## Product Mapping

Edit the `getTemplateForProduct()` function to map Lemon Squeezy product IDs to PDF templates:

```javascript
function getTemplateForProduct(productID) {
  const templates = {
    '12345': 'chair-plans-template.pdf',
    '12346': 'table-plans-template.pdf',
  };
  return templates[productID] || 'default-template.pdf';
}
```

## Watermark Customization

Edit the `generateWatermarkedPDF()` function to adjust:

- **Watermark position**: Modify `x` and `y` coordinates
- **Font size**: Adjust `size` parameter
- **Opacity**: Change `opacity` value (0-1)
- **Color**: Modify `rgb()` values
- **Rotation**: Adjust `angle` for diagonal watermark

## Monitoring

### View Logs

```bash
wrangler tail
```

### Check R2 Contents

```bash
# List all templates
wrangler r2 object list furniture-plans-pdfs --prefix templates/

# List all generated PDFs
wrangler r2 object list furniture-plans-pdfs --prefix orders/
```

## Security

### Webhook Signature Verification

The worker includes a placeholder for signature verification. Implement the `verifySignature()` function to validate webhooks:

```javascript
async function verifySignature(payload, signature, secret) {
  // Use Web Crypto API to verify HMAC signature
  // See: https://docs.lemonsqueezy.com/help/webhooks#signing-requests
}
```

### Download Access Control

Currently downloads are publicly accessible via direct URL. Consider adding:

- Time-limited signed URLs
- Customer email verification
- One-time download tokens

## Costs

**Free tier includes:**
- 100,000 Worker requests/day
- 10 GB R2 storage
- 1M Class A operations/month (writes)
- 10M Class B operations/month (reads)

**Beyond free tier:**
- Workers: $5/month for 10M requests
- R2 Storage: $0.015/GB/month
- R2 Class A: $4.50 per million operations
- R2 Class B: $0.36 per million operations

**For small stores (< 1000 sales/month):** Likely $0/month

## Troubleshooting

### PDFs not generating

1. Check Worker logs: `wrangler tail`
2. Verify template exists in R2
3. Check product ID mapping
4. Verify webhook is reaching worker (check Lemon Squeezy logs)

### Watermarks look wrong

1. Test locally with different PDF sizes
2. Adjust coordinates for your template layout
3. Check font size is readable at print scale

### Webhook failures

1. Verify webhook URL in Lemon Squeezy dashboard
2. Check webhook signature verification (if implemented)
3. Look for errors in Cloudflare dashboard

## Future Enhancements

- [ ] Server-side signature verification
- [ ] Signed URLs with expiration
- [ ] Multiple watermark styles per product
- [ ] Custom fonts for watermarks
- [ ] Assembly instruction diagrams
- [ ] Multi-page annotation support
