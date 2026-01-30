/**
 * Unified Cloudflare Worker
 * Handles:
 * 1. PDF watermarking for purchases (Lemon Squeezy webhook)
 * 2. Watermarked PDF downloads
 * 3. License validation for premium content
 */

import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Enable CORS for all requests
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Route: Lemon Squeezy webhook for PDF generation
      if (path === '/webhook' && request.method === 'POST') {
        return await handlePDFWebhook(request, env);
      }

      // Route: Download watermarked PDFs
      if (path.startsWith('/download/') && request.method === 'GET') {
        return await handlePDFDownload(request, env, corsHeaders);
      }

      // Route: Validate license keys
      if (path === '/api/validate-license' && request.method === 'POST') {
        return await handleLicenseValidation(request, env, corsHeaders);
      }

      return new Response('Not Found', { status: 404 });

    } catch (error) {
      console.error('Error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

/**
 * Handle Lemon Squeezy webhook for PDF generation
 */
async function handlePDFWebhook(request, env) {
  // Read raw body for signature verification, then parse
  const rawBody = await request.text();

  // Verify webhook signature (if secret is set)
  if (env.LEMON_SQUEEZY_WEBHOOK_SECRET) {
    const signature = request.headers.get('X-Signature');
    const isValid = await verifyWebhookSignature(rawBody, signature, env.LEMON_SQUEEZY_WEBHOOK_SECRET);

    if (!isValid) {
      console.error('Webhook signature verification failed');
      return new Response('Invalid signature', { status: 401 });
    }
    console.log('Webhook signature verified');
  } else {
    console.warn('LEMON_SQUEEZY_WEBHOOK_SECRET not set — skipping signature verification');
  }

  const payload = JSON.parse(rawBody);
  console.log('Webhook received:', JSON.stringify(payload));

  // Only process order_created events
  if (payload.meta?.event_name !== 'order_created') {
    return new Response('Event ignored', { status: 200 });
  }

  // Extract order information
  const orderId = payload.data?.id;
  const customerEmail = payload.data?.attributes?.user_email;
  const customerName = payload.data?.attributes?.user_name;
  const productId = payload.data?.attributes?.first_order_item?.product_id;

  if (!orderId || !customerEmail || !productId) {
    return new Response('Missing required fields', { status: 400 });
  }

  // Generate watermarked PDF
  try {
    const productInfo = getTemplateForProduct(productId);
    const watermarkedPDF = await generateWatermarkedPDF(
      env.PDF_BUCKET,
      productInfo.template,
      {
        orderId,
        customerEmail,
        customerName,
        date: new Date().toLocaleDateString()
      }
    );

    // Save to R2
    const filename = `orders/order-${orderId}_${Date.now()}.pdf`;
    await env.PDF_BUCKET.put(filename, watermarkedPDF);

    // Generate download URL
    const downloadUrl = `${new URL(request.url).origin}/download/${filename.replace('orders/', '')}`;

    console.log('PDF generated:', filename);

    // Send email with download link
    const emailSent = await sendPurchaseEmail(
      customerEmail,
      orderId,
      downloadUrl,
      productInfo.name,
      env
    );

    return new Response(JSON.stringify({
      success: true,
      downloadUrl,
      filename,
      emailSent
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Handle PDF download
 */
async function handlePDFDownload(request, env, corsHeaders) {
  const filename = new URL(request.url).pathname.replace('/download/', '');
  const fullPath = `orders/${filename}`;

  try {
    const object = await env.PDF_BUCKET.get(fullPath);

    if (!object) {
      return new Response('PDF not found', { status: 404 });
    }

    return new Response(object.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      }
    });
  } catch (error) {
    console.error('Error fetching PDF:', error);
    return new Response('Error fetching PDF', { status: 500 });
  }
}

/**
 * Validate license keys for premium content
 */
async function handleLicenseValidation(request, env, corsHeaders) {
  const body = await request.json();
  const { licenseKey, productId } = body;

  // TODO: Integrate with Lemon Squeezy License API
  // For now, return mock validation

  // Store validated licenses in KV (optional)
  // await env.LICENSES.put(licenseKey, JSON.stringify({ productId, validatedAt: Date.now() }));

  return new Response(JSON.stringify({
    valid: true,
    productId,
    // In production, fetch from Lemon Squeezy API
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

/**
 * Verify Lemon Squeezy webhook signature
 * X-Signature header contains an HMAC-SHA256 hex digest of the raw request body
 */
async function verifyWebhookSignature(rawBody, signature, secret) {
  if (!signature || !rawBody) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));
  const expectedSignature = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Constant-time comparison to prevent timing attacks
  if (expectedSignature.length !== signature.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expectedSignature.length; i++) {
    mismatch |= expectedSignature.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Map product IDs to PDF templates and product names
 */
function getTemplateForProduct(productId) {
  const products = {
    // Lemon Squeezy product IDs mapped to PDF templates
    '796585': { template: 'templates/workbench-plans.pdf', name: 'Workbench' },
  };
  return products[productId] || { template: 'templates/default-template.pdf', name: 'Furniture Plans' };
}

/**
 * Send purchase confirmation email with download link via Resend
 */
async function sendPurchaseEmail(to, orderId, downloadUrl, productName, env) {
  if (!env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    return false;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'DIY Furniture Project <orders@diyfurnitureproject.com>',
      reply_to: 'wnosworthy@gmail.com',
      to: [to],
      subject: `Your ${productName} Plans - Order #${orderId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .button { display: inline-block; background: #000; color: #fff; padding: 14px 28px; text-decoration: none; font-weight: 500; margin: 20px 0; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Thank you for your purchase!</h1>
            </div>
            <p>Hi there,</p>
            <p>Your <strong>${productName}</strong> furniture plans are ready to download. This PDF has been personalized with your order information.</p>
            <p style="text-align: center;">
              <a href="${downloadUrl}" class="button">Download Your Plans</a>
            </p>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; font-size: 12px; color: #666;">${downloadUrl}</p>
            <div class="footer">
              <p>Order #${orderId}</p>
              <p>DIY Furniture Project</p>
            </div>
          </div>
        </body>
        </html>
      `
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Email send failed:', errorText);
    return false;
  }

  console.log('Purchase email sent to:', to);
  return true;
}

/**
 * Generate watermarked PDF
 */
async function generateWatermarkedPDF(bucket, templateName, watermarkData) {
  // Fetch template PDF from R2
  const templateObject = await bucket.get(templateName);

  if (!templateObject) {
    throw new Error(`Template not found: ${templateName}`);
  }

  const templateBytes = await templateObject.arrayBuffer();
  const pdfDoc = await PDFDocument.load(templateBytes);

  // Try to load IBM Plex Mono font, fallback to Courier
  let font;
  try {
    const fontObject = await bucket.get('fonts/IBMPlexMono-Regular.ttf');
    if (fontObject) {
      const fontBytes = await fontObject.arrayBuffer();
      font = await pdfDoc.embedFont(fontBytes);
    } else {
      font = await pdfDoc.embedFont(StandardFonts.Courier);
    }
  } catch (e) {
    console.error('Font loading error, using fallback:', e);
    font = await pdfDoc.embedFont(StandardFonts.Courier);
  }

  // Add watermarks to all pages
  const pages = pdfDoc.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();
    const stampText = `Order: ${watermarkData.orderId} | ${watermarkData.customerEmail} | ${watermarkData.date}`;
    const fontSize = 7;
    const textWidth = font.widthOfTextAtSize(stampText, fontSize);

    // Bottom-left stamp: 0.25" from left, centered in 0.25" bottom margin
    page.drawText(stampText, {
      x: 18,
      y: 6,
      size: fontSize,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Top-right stamp: 0.25" from right, centered in 0.25" top margin
    page.drawText(stampText, {
      x: width - 18 - textWidth,
      y: height - 12,
      size: fontSize,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  // Add metadata
  pdfDoc.setTitle(`Furniture Plans - Order ${watermarkData.orderId}`);
  pdfDoc.setAuthor('DIY Furniture Project');
  pdfDoc.setSubject(`Licensed to: ${watermarkData.customerEmail}`);
  pdfDoc.setKeywords([watermarkData.orderId, watermarkData.customerEmail]);
  pdfDoc.setCreationDate(new Date());

  return await pdfDoc.save();
}
