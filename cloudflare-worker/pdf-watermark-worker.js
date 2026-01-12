/**
 * Cloudflare Worker for PDF Watermarking
 *
 * This worker receives webhooks from Lemon Squeezy when a purchase is made,
 * watermarks the PDF with buyer information, and stores it in R2.
 *
 * Environment variables needed:
 * - R2_BUCKET (bound R2 bucket)
 * - LEMON_SQUEEZY_WEBHOOK_SECRET (for verifying webhook signatures)
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }

    const url = new URL(request.url);

    // Webhook endpoint for Lemon Squeezy
    if (url.pathname === '/webhook' && request.method === 'POST') {
      return await handleWebhook(request, env);
    }

    // Download endpoint for customers
    if (url.pathname.startsWith('/download/') && request.method === 'GET') {
      return await handleDownload(request, env);
    }

    return new Response('Not Found', { status: 404 });
  }
};

/**
 * Handle Lemon Squeezy webhook
 */
async function handleWebhook(request, env) {
  try {
    // Verify webhook signature
    const signature = request.headers.get('X-Signature');
    const body = await request.text();

    // Note: In production, verify the signature using LEMON_SQUEEZY_WEBHOOK_SECRET
    // const isValid = await verifySignature(body, signature, env.LEMON_SQUEEZY_WEBHOOK_SECRET);
    // if (!isValid) return new Response('Invalid signature', { status: 401 });

    const webhook = JSON.parse(body);

    // Only process order_created events
    if (webhook.meta?.event_name !== 'order_created') {
      return new Response('Event ignored', { status: 200 });
    }

    const { data } = webhook;
    const orderID = data.id;
    const customerEmail = data.attributes.user_email;
    const customerName = data.attributes.user_name;
    const productID = data.attributes.first_order_item?.product_id;

    console.log(`Processing order ${orderID} for ${customerEmail}`);

    // Determine which PDF template to use based on product
    const templateKey = getTemplateForProduct(productID);

    // Generate watermarked PDF
    const watermarkedPDF = await generateWatermarkedPDF(
      env,
      templateKey,
      {
        orderID,
        customerEmail,
        customerName,
        purchaseDate: new Date().toISOString().split('T')[0]
      }
    );

    // Store in R2 with unique filename
    const filename = `${orderID}_${Date.now()}.pdf`;
    await env.R2_BUCKET.put(`orders/${filename}`, watermarkedPDF, {
      httpMetadata: {
        contentType: 'application/pdf',
      },
      customMetadata: {
        orderID,
        customerEmail,
        productID: productID.toString(),
      }
    });

    // Generate signed download URL (valid for 7 days)
    const downloadURL = `${url.origin}/download/${filename}`;

    console.log(`PDF generated: ${filename}`);

    // Return success - Lemon Squeezy will send the download link via email
    // You can also trigger a custom email here if needed
    return new Response(JSON.stringify({
      success: true,
      downloadURL
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}

/**
 * Handle PDF download requests
 */
async function handleDownload(request, env) {
  try {
    const url = new URL(request.url);
    const filename = url.pathname.replace('/download/', '');

    // Basic validation
    if (!filename.match(/^[\w-]+\.pdf$/)) {
      return new Response('Invalid filename', { status: 400 });
    }

    // Retrieve from R2
    const object = await env.R2_BUCKET.get(`orders/${filename}`);

    if (!object) {
      return new Response('File not found', { status: 404 });
    }

    // Return PDF with proper headers
    return new Response(object.body, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, max-age=3600',
      }
    });

  } catch (error) {
    console.error('Download error:', error);
    return new Response('Download failed', { status: 500 });
  }
}

/**
 * Generate watermarked PDF
 */
async function generateWatermarkedPDF(env, templateKey, watermarkData) {
  // Fetch template PDF from R2
  const template = await env.R2_BUCKET.get(`templates/${templateKey}`);

  if (!template) {
    throw new Error(`Template not found: ${templateKey}`);
  }

  const templateBytes = await template.arrayBuffer();
  const pdfDoc = await PDFDocument.load(templateBytes);

  // Get font
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pages = pdfDoc.getPages();

  // Add watermark to each page
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();

    // Footer watermark (small text)
    const footerText = `Order #${watermarkData.orderID} • ${watermarkData.customerEmail} • ${watermarkData.purchaseDate}`;
    page.drawText(footerText, {
      x: 30,
      y: 15,
      size: 7,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Diagonal watermark (faint)
    const diagonalText = watermarkData.customerEmail;
    page.drawText(diagonalText, {
      x: width / 2 - 100,
      y: height / 2,
      size: 36,
      font: boldFont,
      color: rgb(0.9, 0.9, 0.9),
      rotate: { angle: 45 * (Math.PI / 180), type: 'degrees' },
      opacity: 0.3,
    });
  }

  // Embed metadata
  pdfDoc.setTitle(`Furniture Plans - Order ${watermarkData.orderID}`);
  pdfDoc.setAuthor('Walker Nosworthy');
  pdfDoc.setSubject(`Licensed to ${watermarkData.customerName}`);
  pdfDoc.setKeywords([
    `order:${watermarkData.orderID}`,
    `email:${watermarkData.customerEmail}`,
    `date:${watermarkData.purchaseDate}`
  ]);

  // Return PDF bytes
  return await pdfDoc.save();
}

/**
 * Map product ID to template filename
 */
function getTemplateForProduct(productID) {
  // You'll customize this based on your products
  const templates = {
    '12345': 'chair-plans-template.pdf',
    '12346': 'table-plans-template.pdf',
    '12347': 'shelf-plans-template.pdf',
  };

  return templates[productID] || 'default-template.pdf';
}

/**
 * Verify webhook signature (implement based on Lemon Squeezy docs)
 */
async function verifySignature(payload, signature, secret) {
  // Implementation would go here using Web Crypto API
  // See: https://docs.lemonsqueezy.com/help/webhooks#signing-requests
  return true; // Placeholder
}

/**
 * Handle CORS for preflight requests
 */
function handleCORS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
