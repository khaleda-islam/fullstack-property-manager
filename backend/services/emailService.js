const { BrevoClient } = require("@getbrevo/brevo");

const client = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

const FROM_EMAIL = process.env.BREVO_FROM_EMAIL || "no-reply@t6pms.com";
const FROM_NAME  = process.env.BREVO_FROM_NAME  || "T6PMS Property Management";

// ── Send lease expiry reminder to landlord ────────────────────────────────────
const sendLeaseExpiryEmail = async ({
  landlordEmail,
  landlordName,
  residentName,
  propertyName,
  leaseExpireDate,
  daysRemaining,
}) => {
  const formattedDate = new Date(leaseExpireDate).toLocaleDateString("en-CA", {
    year: "numeric", month: "long", day: "numeric",
  });

  const urgencyColor = daysRemaining <= 7  ? "#dc3545" : "#ffc107";
  const urgencyLabel = daysRemaining <= 7  ? "⚠️ Urgent" : "📅 Reminder";
  const urgencyText  = daysRemaining <= 7
    ? `This lease expires in <strong>${daysRemaining} days</strong>. Please take action soon.`
    : `This lease expires in <strong>${daysRemaining} days</strong>. You may want to start renewal discussions.`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </head>
    <body style="margin:0;padding:0;background:#f8f9fa;font-family:Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;padding:32px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

              <!-- Header -->
              <tr>
                <td style="background:${urgencyColor};padding:24px 32px;">
                  <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:bold;">
                    ${urgencyLabel} — Lease Expiry Notice
                  </h1>
                  <p style="margin:6px 0 0;color:#ffffff;opacity:0.9;font-size:14px;">
                    T6PMS Property Management System
                  </p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:32px;">
                  <p style="margin:0 0 16px;color:#333;font-size:15px;">
                    Dear <strong>${landlordName || "Landlord"}</strong>,
                  </p>
                  <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">
                    ${urgencyText}
                  </p>

                  <!-- Details card -->
                  <table width="100%" cellpadding="0" cellspacing="0"
                    style="background:#f8f9fa;border-radius:8px;padding:20px;margin-bottom:24px;border-left:4px solid ${urgencyColor};">
                    <tr>
                      <td style="padding:6px 0;">
                        <span style="color:#888;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Property</span><br/>
                        <strong style="color:#333;font-size:15px;">${propertyName || "—"}</strong>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;">
                        <span style="color:#888;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Resident</span><br/>
                        <strong style="color:#333;font-size:15px;">${residentName || "—"}</strong>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;">
                        <span style="color:#888;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Lease Expires</span><br/>
                        <strong style="color:${urgencyColor};font-size:15px;">${formattedDate}</strong>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;">
                        <span style="color:#888;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Days Remaining</span><br/>
                        <strong style="color:${urgencyColor};font-size:20px;">${daysRemaining} days</strong>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:0 0 24px;color:#555;font-size:14px;line-height:1.6;">
                    Please log in to the T6PMS portal to review and renew the lease agreement.
                  </p>

                  <!-- CTA button -->
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background:${urgencyColor};border-radius:6px;padding:12px 28px;">
                        <a href="${process.env.CLIENT_URL || "http://localhost:5173"}"
                          style="color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px;">
                          Go to T6PMS Portal →
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background:#f8f9fa;padding:20px 32px;border-top:1px solid #e9ecef;">
                  <p style="margin:0;color:#aaa;font-size:12px;text-align:center;">
                    This is an automated reminder from T6PMS. Please do not reply to this email.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  console.log(`📤 Sending email to: ${landlordEmail}`);
  console.log(`   Subject: ${urgencyLabel} — Lease expires in ${daysRemaining} days: ${propertyName}`);

  await client.transactionalEmails.sendTransacEmail({
    sender:      { name: FROM_NAME, email: FROM_EMAIL },
    to:          [{ email: landlordEmail }],
    subject:     `${urgencyLabel} — Lease expires in ${daysRemaining} days: ${propertyName}`,
    htmlContent: html,
    textContent: `Dear ${landlordName}, the lease for ${residentName} at ${propertyName} expires on ${formattedDate} (${daysRemaining} days remaining). Please log in to T6PMS to renew.`,
  });

  console.log(`📧 Lease reminder sent to ${landlordEmail} (${daysRemaining} days)`);
};

module.exports = { sendLeaseExpiryEmail };
