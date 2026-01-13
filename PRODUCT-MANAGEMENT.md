# Product Management Guide

This guide explains how to easily add, edit, and test products on your DIY Furniture Project website.

## Quick Overview

Your site now uses a JSON-based product system that makes it easy to manage products without editing HTML files.

**Key files:**
- `products.json` - Contains all product data (names, prices, descriptions, models)
- `product-loader.js` - Automatically loads products from the JSON file
- `model-loader.js` - Handles model loading (local for testing, protected URLs for production)
- `models/` - Folder for local .glb files during development

---

## Testing Models Locally (Fastest Method)

### Step 1: Add your .glb file to the models folder
```
/diyfurnitureproject
  /models
    model1.glb
    model2.glb
    my-new-model.glb  ← Put your test file here
```

### Step 2: The system automatically detects local development
When you run the site locally (localhost or 127.0.0.1), models are loaded from the `models/` folder instead of the production URLs.

You'll see this in the console:
```
[LOCAL MODE] Loading model: my-new-model.glb
```

### Step 3: Test immediately
Open index.html in your browser - your model will load instantly!

---

## Adding a New Product

### Step 1: Add to products.json
Open `products.json` and add a new product entry:

```json
{
  "id": "5",
  "name": "Your Product Name",
  "price": 55,
  "model": "model5.glb",
  "year": "2026",
  "medium": "Plywood, Hardware",
  "dimensions": "Variable",
  "shortDescription": "Brief description shown on home page",
  "fullDescription": [
    "First paragraph of detailed description.",
    "Second paragraph with more details."
  ]
}
```

### Step 2: Create the detail page
Copy an existing project page (e.g., project4.html) and rename it to match your product ID:
```
project5.html
```

Update the script inside to load your product ID:
```javascript
loadProductDetail('5');  // Change to your product ID
```

### Step 3: Done!
The home page will automatically display your new product. No need to edit index.html.

---

## Editing Existing Products

Simply edit the values in `products.json`:

```json
{
  "id": "1",
  "name": "Updated Product Name",  ← Change name
  "price": 50,                      ← Change price
  "model": "model1.glb",
  ...
}
```

Refresh your browser - changes appear immediately!

---

## File Structure

```
/diyfurnitureproject
  products.json           ← Edit this to manage products
  product-loader.js       ← Dynamically loads products (don't edit)
  model-loader.js         ← Handles model loading (don't edit)
  index.html             ← Main page (products load automatically)
  project1.html          ← Detail page for product 1
  project2.html          ← Detail page for product 2
  /models                ← Put .glb files here for local testing
    model1.glb
    model2.glb
```

---

## Production Deployment

When you deploy to production:

1. **Upload models to R2**: Your .glb files should be in your Cloudflare R2 bucket
2. **The site automatically switches**: When NOT running locally, models load through your Cloudflare Worker with protected signed URLs
3. **No code changes needed**: The same code works in both development and production

---

## Common Tasks

### Change a product's price
Edit `products.json`, find the product, change the `price` value.

### Update product description
Edit `products.json`, update the `shortDescription` or `fullDescription` arrays.

### Test a new model before uploading
1. Put the .glb file in the `models/` folder
2. Add an entry to `products.json` with the filename
3. Open the site locally - it loads immediately!

### Remove a product
Delete its entry from `products.json` - it will disappear from the site.

---

## Tips

- **Product IDs**: Must be unique strings ("1", "2", "3", etc.)
- **Model filenames**: Match the filename exactly (case-sensitive)
- **Prices**: Numbers without $ symbol (it's added automatically)
- **Descriptions**: Full descriptions are arrays - each item becomes a paragraph
- **Local testing**: Always put test .glb files in the `models/` folder

---

## Troubleshooting

**Model not loading locally?**
- Check that the .glb file is in the `models/` folder
- Check that the filename in products.json matches exactly
- Check browser console for errors

**Model not loading in production?**
- Ensure the model is uploaded to your R2 bucket
- Check that your Cloudflare Worker is running
- Check browser console for CORS or authentication errors

**Product not showing on home page?**
- Check that products.json has valid JSON syntax
- Check browser console for JavaScript errors
- Ensure the product has all required fields (id, name, price, model)
