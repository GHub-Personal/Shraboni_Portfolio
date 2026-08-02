import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing name, email, or message' },
        { status: 400 }
      );
    }

    // Retrieve owner email from profile settings
    const { data: profile, error: profileError } = await supabase
      .from('profile_settings')
      .select('contact_email, name')
      .limit(1)
      .single();

    if (profileError || !profile || !profile.contact_email) {
      console.error('Error fetching profile settings:', profileError);
      return NextResponse.json(
        { error: 'Could not fetch website owner email configuration' },
        { status: 500 }
      );
    }

    const ownerEmail = profile.contact_email;
    const ownerName = profile.name || 'Portfolio Owner';

    // Send emails using Resend batch send.
    // NOTE: In the Resend free/testing tier, sending to arbitrary external addresses is restricted.
    // If we get a validation error (code 422) complaining about recipient addresses, we fall back
    // to sending the welcome email to the ownerEmail as well (for verification/testing purposes).
    let batchResult = await resend.batch.send([
      {
        from: 'onboarding@resend.dev',
        to: ownerEmail,
        subject: `New contact request from ${name}`,
html: `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; background-color: #F8F9FA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8F9FA; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03); overflow: hidden;">
            <!-- Header Banner -->
            <tr>
              <td style="background-color: #0F172A; padding: 28px 32px; border-bottom: 3px solid #4CFA6D;">
                <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #4CFA6D; display: block; margin-bottom: 6px;">Portfolio Contact Form</span>
                <h1 style="margin: 0; font-size: 22px; font-weight: 600; color: #FFFFFF;">⚡ You have a new request!</h1>
              </td>
            </tr>

            <!-- Content Body -->
            <tr>
              <td style="padding: 32px;">
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding-bottom: 20px;">
                      <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748B; letter-spacing: 0.5px;">Name</p>
                      <p style="margin: 0; font-size: 16px; font-weight: 600; color: #0F172A;">${name}</p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding-bottom: 24px;">
                      <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748B; letter-spacing: 0.5px;">Email</p>
                      <a href="mailto:${email}" style="margin: 0; font-size: 16px; color: #059669; text-decoration: none; font-weight: 500;">${email}</a>
                    </td>
                  </tr>

                  <!-- Message Box -->
                  <tr>
                    <td>
                      <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748B; letter-spacing: 0.5px;">Message</p>
                      <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-left: 4px solid #4CFA6D; border-radius: 8px; padding: 20px; font-size: 15px; line-height: 1.6; color: #334155;">
                        ${message.replace(/\n/g, '<br />')}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Reply CTA -->
            <tr>
              <td style="padding: 0 32px 32px 32px;" align="center">
                <a href="mailto:${email}" style="display: inline-block; background-color: #0F172A; color: #FFFFFF; text-decoration: none; font-size: 14px; font-weight: 600; padding: 14px 28px; border-radius: 30px; border: 1px solid #4CFA6D;">Reply Directly to ${name} →</a>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #F8FAFC; padding: 18px 32px; border-top: 1px solid #E2E8F0; text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #64748B;">Automated lead via <strong>shraboni-works.vercel.app</strong></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
`,
      },
      {
        from: 'onboarding@resend.dev',
        to: email,
        subject: `Thank you for contacting ${ownerName}!`,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #F8F9FA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8F9FA; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table role="presentation" width="100%" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03); overflow: hidden;">
                    
                    <!-- Neon Green Accent Bar -->
                    <tr>
                      <td style="background-color: #4CFA6D; height: 6px; width: 100%;"></td>
                    </tr>

                    <!-- Main Content -->
                    <tr>
                      <td style="padding: 40px 32px 32px 32px; text-align: center;">
                        
                        <!-- Badge -->
                        <span style="display: inline-block; background-color: #0F172A; color: #4CFA6D; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; padding: 6px 16px; border-radius: 20px; margin-bottom: 20px;">
                          Message Received
                        </span>

                        <h2 style="margin: 0 0 16px 0; font-size: 26px; font-weight: 600; color: #0F172A; line-height: 1.3;">
                          Let's Connect!
                        </h2>
                        
                        <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.7; color: #475569; text-align: left;">
                          Hi <strong>${name}</strong>,
                        </p>

                        <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.7; color: #475569; text-align: left;">
                          Thank you for reaching out to me. I've received your request and message regarding your project.
                        </p>

                        <!-- Status Card -->
                        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-left: 4px solid #4CFA6D; border-radius: 12px; padding: 20px; text-align: left; margin-bottom: 28px;">
                          <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #0F172A; text-transform: uppercase; letter-spacing: 0.5px;">Next Steps</p>
                          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #334155;">
                            I'll review your details and get back to you as soon as possible (usually within 24-48 hours).
                          </p>
                        </div>

                        <a href="https://shraboni-works.vercel.app" style="display: inline-block; background-color: #0F172A; color: #FFFFFF; text-decoration: none; font-size: 14px; font-weight: 600; padding: 14px 32px; border-radius: 30px; border: 1px solid #4CFA6D;">
                          Explore Works ↗
                        </a>

                      </td>
                    </tr>

                    <!-- Footer Section -->
                    <tr>
                      <td style="background-color: #F8FAFC; padding: 24px 32px; border-top: 1px solid #E2E8F0; text-align: center;">
                        <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #0F172A;">Best regards,</p>
                        <p style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #0F172A;">${ownerName}</p>
                        <p style="margin: 0; font-size: 11px; color: #94A3B8;">Visual & Digital Brand Designer</p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      }
    ]);

    if (batchResult.error) {
      // If validation error indicates the recipient (visitor email) is not verified, 
      // attempt sending the welcome email copy to the owner's email so the owner can preview it.
      if (batchResult.error.message.includes('testing email address') || batchResult.error.message.includes('domain')) {
        console.warn('Visitor email verification restricted by Resend sandbox. Falling back to sending copy to owner.');
        batchResult = await resend.batch.send([
          {
            from: 'onboarding@resend.dev',
            to: ownerEmail,
            subject: `New contact request from ${name}`,
            html: `
              <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2>You have a new request!</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <blockquote style="border-left: 4px solid #ccc; padding-left: 10px; margin-left: 0; color: #555;">
                  ${message.replace(/\n/g, '<br />')}
                </blockquote>
              </div>
            `,
          },
          {
            from: 'onboarding@resend.dev',
            to: ownerEmail,
            subject: `[TESTING ONLY] Welcome email copy for ${name}`,
            html: `
              <div style="background-color: #ffeaea; padding: 10px; border: 1px solid red; margin-bottom: 20px; font-family: sans-serif;">
                <strong>Sandbox Mode Warning:</strong> This email was originally addressed to <strong>${email}</strong>, but has been sent to you because your Resend domain is not yet verified.
              </div>
              <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; rounded: 8px;">
                <h2 style="color: #4CFA6D;">Let's Connect!</h2>
                <p>Hi ${name},</p>
                <p>Thank you for reaching out to me. I've received your request and message regarding your project.</p>
                <p>I'll review your details and get back to you as soon as possible (usually within 24-48 hours).</p>
                <br />
                <p>Best regards,</p>
                <p><strong>${ownerName}</strong></p>
              </div>
            `,
          }
        ]);
      }
    }

    if (batchResult.error) {
      console.error('Resend error:', batchResult.error);
      return NextResponse.json({ error: batchResult.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: batchResult.data });
  } catch (err: any) {
    console.error('Contact API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
