/**
 * Unified Cloudflare Worker
 * Handles:
 * 1. Signed URLs for 3D model protection
 * 2. PDF watermarking for purchases
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
      // Route: Generate signed URL for 3D models
      if (path === '/api/model-url' && request.method === 'POST') {
        return await handleModelUrlRequest(request, env, corsHeaders);
      }

      // Route: Serve 3D models with signature verification
      if (path.startsWith('/models/') && request.method === 'GET') {
        return await handleModelDownload(request, env, corsHeaders);
      }

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
 * Generate signed URL for 3D model access
 */
async function handleModelUrlRequest(request, env, corsHeaders) {
  const body = await request.json();
  const { modelName } = body;

  if (!modelName) {
    return new Response(JSON.stringify({ error: 'modelName required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Generate signature with expiration (1 hour)
  const expiresAt = Date.now() + (60 * 60 * 1000); // 1 hour
  const signature = await generateSignature(modelName, expiresAt, env.SIGNING_SECRET || 'default-secret');

  const signedUrl = `${new URL(request.url).origin}/models/${modelName}?expires=${expiresAt}&signature=${signature}`;

  return new Response(JSON.stringify({ url: signedUrl, expiresAt }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

/**
 * Serve 3D model with signature verification
 */
async function handleModelDownload(request, env, corsHeaders) {
  const url = new URL(request.url);
  const modelPath = url.pathname.replace('/models/', '');
  const expires = url.searchParams.get('expires');
  const signature = url.searchParams.get('signature');

  // Verify signature
  if (!expires || !signature) {
    return new Response('Unauthorized: Missing signature', { status: 401 });
  }

  if (Date.now() > parseInt(expires)) {
    return new Response('Unauthorized: URL expired', { status: 401 });
  }

  const expectedSignature = await generateSignature(modelPath, expires, env.SIGNING_SECRET || 'default-secret');
  if (signature !== expectedSignature) {
    return new Response('Unauthorized: Invalid signature', { status: 401 });
  }

  // Fetch model from R2
  try {
    const object = await env.MODELS_BUCKET.get(modelPath);

    if (!object) {
      return new Response('Model not found', { status: 404 });
    }

    return new Response(object.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'model/gltf-binary',
        'Cache-Control': 'private, max-age=3600',
      }
    });
  } catch (error) {
    console.error('Error fetching model:', error);
    return new Response('Error fetching model', { status: 500 });
  }
}

/**
 * Handle Lemon Squeezy webhook for PDF generation
 */
async function handlePDFWebhook(request, env) {
  const payload = await request.json();

  console.log('Webhook received:', JSON.stringify(payload));

  // Verify webhook signature (if secret is set)
  if (env.LEMON_SQUEEZY_WEBHOOK_SECRET) {
    const signature = request.headers.get('X-Signature');
    const isValid = await verifyWebhookSignature(payload, signature, env.LEMON_SQUEEZY_WEBHOOK_SECRET);

    if (!isValid) {
      return new Response('Invalid signature', { status: 401 });
    }
  }

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
    const templateName = getTemplateForProduct(productId);
    const watermarkedPDF = await generateWatermarkedPDF(
      env.PDF_BUCKET,
      templateName,
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

    return new Response(JSON.stringify({
      success: true,
      downloadUrl,
      filename
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
 * Generate HMAC signature for URL signing
 */
async function generateSignature(data, expires, secret) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const message = encoder.encode(`${data}:${expires}`);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, message);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Verify Lemon Squeezy webhook signature
 */
async function verifyWebhookSignature(payload, signature, secret) {
  // TODO: Implement Lemon Squeezy signature verification
  // See: https://docs.lemonsqueezy.com/help/webhooks#signing-requests
  return true; // For now, accept all webhooks
}

/**
 * Map product IDs to PDF templates
 */
function getTemplateForProduct(productId) {
  const templates = {
    // Add your Lemon Squeezy product IDs here
    // '12345': 'templates/chair-plans.pdf',
    // '12346': 'templates/table-plans.pdf',
  };
  return templates[productId] || 'templates/default-template.pdf';
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

  // Add watermarks to all pages
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (const page of pages) {
    const { width, height } = page.getSize();

    // Footer watermark (small, bottom right)
    const footerText = `Order: ${watermarkData.orderId} | ${watermarkData.customerEmail} | ${watermarkData.date}`;
    page.drawText(footerText, {
      x: 50,
      y: 30,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Diagonal watermark (large, faint, center)
    page.drawText(watermarkData.customerEmail, {
      x: width / 2 - 150,
      y: height / 2,
      size: 40,
      font,
      color: rgb(0.9, 0.9, 0.9),
      opacity: 0.3,
      rotate: degrees(-45),
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
