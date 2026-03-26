import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { postTitle, postExcerpt, postSlug, postImageUrl } = await req.json();

    if (!postTitle || !postSlug) {
      return new Response(JSON.stringify({ error: 'postTitle and postSlug are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!;

    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: subscribers, error: dbError } = await supabase
      .from('profiles')
      .select('email, name')
      .eq('email_notifications', true)
      .not('email', 'is', null);

    const subscriberEmails = (subscribers || []).map(s => s.email).filter(Boolean);
    const { data: tokenRows } = await supabase
      .from('newsletter_subscribers')
      .select('email, unsubscribe_token')
      .in('email', subscriberEmails);

    const tokenMap: Record<string, string> = {};
    (tokenRows || []).forEach(r => { if (r.unsubscribe_token) tokenMap[r.email] = r.unsubscribe_token; });

    if (dbError) {
      console.error('DB error:', dbError);
      return new Response(JSON.stringify({ error: 'Failed to fetch subscribers' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: 'No subscribers' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const SITE_URL = 'https://www.vellionation.com';
    const postUrl = `${SITE_URL}/blog/${postSlug}`;
    const heroImage = postImageUrl || 'https://rtklsdtadtqpgoibulux.supabase.co/storage/v1/object/public/site_images/og-image.jpg';

    const buildEmailHtml = (unsubscribeUrl: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Article on Vellio Nation</title>
</head>
<body style="margin:0;padding:0;background-color:#f6f6f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f6f6f6;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#16a34a;padding:30px 40px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:bold;">Vellio Nation</h1>
              <p style="color:#bbf7d0;margin:6px 0 0 0;font-size:14px;">Longevity Lifestyle Community</p>
            </td>
          </tr>
          <!-- Hero Image -->
          ${heroImage ? `<tr><td><img src="${heroImage}" alt="${postTitle}" width="600" style="display:block;width:100%;max-height:280px;object-fit:cover;" /></td></tr>` : ''}
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="color:#6b7280;font-size:14px;margin:0 0 8px 0;text-transform:uppercase;letter-spacing:1px;">New Article</p>
              <h2 style="color:#111827;font-size:22px;margin:0 0 16px 0;line-height:1.4;">${postTitle}</h2>
              ${postExcerpt ? `<p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 28px 0;">${postExcerpt}</p>` : ''}
              <a href="${postUrl}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:bold;">Read the Article →</a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:24px 40px;border-top:1px solid #e5e7eb;">
              <p style="color:#9ca3af;font-size:12px;margin:0;line-height:1.6;">
                You're receiving this because you subscribed to blog notifications on Vellio Nation.<br>
                <a href="${SITE_URL}/profile" style="color:#16a34a;">Manage your preferences</a> · 
                <a href="${unsubscribeUrl}" style="color:#9ca3af;">Unsubscribe</a> ·
                <a href="${SITE_URL}" style="color:#6b7280;">Visit Vellio Nation</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    let sent = 0;
    let failed = 0;

    for (const subscriber of subscribers) {
      if (!subscriber.email) continue;

      const token = tokenMap[subscriber.email];
      const unsubscribeUrl = token
        ? `${SITE_URL}/unsubscribe?token=${token}`
        : `${SITE_URL}/profile`;

      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Vellio Nation <hello@vellionation.com>',
          to: [subscriber.email],
          subject: `New Article: ${postTitle}`,
          html: buildEmailHtml(unsubscribeUrl),
        }),
      });

      if (emailResponse.ok) {
        sent++;
      } else {
        failed++;
        const errData = await emailResponse.json().catch(() => ({}));
        console.error(`Failed to send to ${subscriber.email}:`, errData);
      }
    }

    return new Response(JSON.stringify({ sent, failed, total: subscribers.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Edge Function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
