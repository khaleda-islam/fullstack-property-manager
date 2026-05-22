# Email Management System Guide

## Table of Contents
1. [Overview](#overview)
2. [What is Brevo?](#what-is-brevo)
3. [Why We Use Brevo](#why-we-use-brevo)
4. [Setup Guide](#setup-guide)
5. [Email Features in the Application](#email-features-in-the-application)
6. [Automated Lease Reminders](#automated-lease-reminders)
7. [Email Templates](#email-templates)
8. [Backend Implementation](#backend-implementation)
9. [Testing & Troubleshooting](#testing--troubleshooting)
10. [Best Practices](#best-practices)
11. [Future Enhancements](#future-enhancements)

---

## Overview

The **Property Management System** uses **Brevo** (formerly Sendinblue) as its transactional email service provider to send automated emails to users.

### Current Email Features
- ✅ **Lease Expiry Reminders**: Automated emails sent 14 and 7 days before lease expiration
- ✅ **Professional HTML Templates**: Responsive, mobile-friendly email designs
- ✅ **Scheduled Cron Jobs**: Daily automated checks at 9:00 AM
- ✅ **Dynamic Content**: Personalized emails with property and resident details

### Upcoming Email Features (Planned)
- 📧 Maintenance request notifications
- 📧 Contractor assignment alerts
- 📧 Rent payment reminders
- 📧 Welcome emails for new users

**Technology Stack**:
- **Brevo (formerly Sendinblue)**: Email delivery service
- **@getbrevo/brevo**: Official Node.js SDK
- **node-cron**: Job scheduling for automated tasks
- **HTML Email Templates**: Responsive designs with inline CSS

---

## What is Brevo?

**Brevo** (formerly Sendinblue) is a cloud-based email marketing and transactional email platform that provides:
- **Transactional Emails**: Automated emails triggered by events (lease expiry, notifications, etc.)
- **Email Marketing**: Newsletters, campaigns (future use)
- **SMTP Service**: Reliable email delivery infrastructure
- **Email Templates**: Visual template builder
- **Analytics**: Open rates, click rates, bounce tracking
- **Free Tier**: 300 emails/day on the free plan

Official Website: [https://www.brevo.com](https://www.brevo.com)

---

## Why We Use Brevo

### 1. **Reliable Email Delivery**
- High deliverability rates (99%+)
- Dedicated IP addresses available
- Automatic spam prevention
- Email authentication (SPF, DKIM)

### 2. **Free Tier for Small Projects**
- **300 emails per day** on free plan
- No credit card required
- Perfect for development and small deployments

### 3. **Easy Integration**
- Official Node.js SDK (`@getbrevo/brevo`)
- Simple API with clear documentation
- Supports HTML templates

### 4. **Professional Features**
- Email templates with drag-and-drop builder
- Real-time analytics and tracking
- Transactional email logs
- Contact management

### 5. **Scalability**
- Upgrade plans as your user base grows
- API rate limits suitable for production
- Reliable infrastructure (99.9% uptime)

### 6. **Developer-Friendly**
- REST API for all operations
- Comprehensive API documentation
- Test mode for development
- Detailed error messages

---

## Setup Guide

### Prerequisites
- Property Management backend running
- Node.js and npm installed
- Valid email address for Brevo account

---

### Step 1: Create Brevo Account

#### 1.1 Sign Up
1. Go to [https://www.brevo.com](https://www.brevo.com)
2. Click **"Sign Up Free"** (top right)
3. Fill in the registration form:
   - **Email**: Your work email
   - **Password**: Create a strong password
   - **Company**: Your organization name (or "Personal")
4. Click **"Get Started"**
5. **Verify your email** (check inbox for verification link)

#### 1.2 Complete Account Setup
After verification:
1. **Business Details**: Fill in your company information
2. **Sender Information**: Add your email details
   - **From Name**: `T6PMS Property Management` (or your preferred name)
   - **From Email**: Use a domain email if possible (e.g., `noreply@yourdomain.com`)
   - For testing, you can use your Gmail/personal email

---

### Step 2: Get API Key

#### 2.1 Navigate to API Keys
1. Log in to Brevo dashboard
2. Click your **profile icon** (top right)
3. Select **"SMTP & API"** from dropdown

#### 2.2 Create API Key
1. Scroll to **"API Keys"** section
2. Click **"Generate a new API Key"**
3. **Name your key**: `Property Management System` (or any descriptive name)
4. Click **"Generate"**
5. **⚠️ IMPORTANT**: Copy the API key immediately
   - It will only be shown once
   - Store it securely (you'll add it to `.env` later)

**Example API Key Format**:
```
xkeysib-1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z-AbCdEfGhIjKl
```

---

### Step 3: Configure Sender Email

#### 3.1 Add Sender
1. In Brevo dashboard, go to **"Senders"** (left sidebar)
2. Click **"Add a new sender"**
3. Fill in details:
   - **From Name**: `T6PMS Property Management`
   - **From Email**: Your email (e.g., `your-email@gmail.com` for testing)
4. Click **"Add"**

#### 3.2 Verify Sender (Required)
1. Brevo will send a verification email to your sender address
2. Open the email and click the verification link
3. Your sender is now active ✅

> **Note**: For production, use a custom domain email (e.g., `noreply@yourdomain.com`) for better deliverability.

---

### Step 4: Backend Configuration

#### 4.1 Install Brevo SDK
```bash
cd backend
npm install @getbrevo/brevo
```

#### 4.2 Add Environment Variables
Edit your `backend/.env` file:

```env
# ── Brevo Email Service ────────────────────────────────────────
BREVO_API_KEY=xkeysib-your-api-key-here
BREVO_FROM_EMAIL=noreply@yourdomain.com
BREVO_FROM_NAME=T6PMS Property Management
```

**Field Descriptions**:
- `BREVO_API_KEY`: Your API key from Step 2.2
- `BREVO_FROM_EMAIL`: The verified sender email from Step 3.2
- `BREVO_FROM_NAME`: Display name shown in recipient's inbox

#### 4.3 Verify Configuration
The email service is already implemented in `backend/services/emailService.js`:

```javascript
const { BrevoClient } = require("@getbrevo/brevo");

const client = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

const FROM_EMAIL = process.env.BREVO_FROM_EMAIL || "no-reply@t6pms.com";
const FROM_NAME  = process.env.BREVO_FROM_NAME  || "T6PMS Property Management";
```

---

### Step 5: Test Email Sending

#### 5.1 Create Test Script
Create `backend/scripts/testEmail.js`:

```javascript
require("dotenv").config();
const { BrevoClient } = require("@getbrevo/brevo");

const client = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

const testEmail = async () => {
  try {
    console.log("📧 Sending test email...");

    await client.transactionalEmails.sendTransacEmail({
      sender: {
        name: process.env.BREVO_FROM_NAME,
        email: process.env.BREVO_FROM_EMAIL,
      },
      to: [{ email: "your-test-email@gmail.com" }],  // Replace with your email
      subject: "Test Email from T6PMS",
      htmlContent: `
        <html>
          <body>
            <h1>✅ Email Service Working!</h1>
            <p>Your Brevo configuration is correct.</p>
          </body>
        </html>
      `,
    });

    console.log("✅ Test email sent successfully!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Response:", error.response?.body);
  }
};

testEmail();
```

#### 5.2 Run Test
```bash
cd backend
node scripts/testEmail.js
```

**Expected Output**:
```
📧 Sending test email...
✅ Test email sent successfully!
```

**Check Your Inbox**: You should receive the test email within 1-2 minutes.

---

## Email Features in the Application

### Current Implementation

#### 1. **Lease Expiry Reminders**
- **Trigger**: Automated cron job runs daily at 9:00 AM
- **Recipients**: Landlords with expiring leases
- **Timing**: Emails sent 14 days and 7 days before lease expiration
- **Content**: Property details, resident name, expiration date, urgency indicator

**Use Case**:
```
Landlord John has a resident Sarah whose lease expires on June 15, 2026.
- May 22, 2026 (24 days before): No email
- June 1, 2026 (14 days before): ⚠️ Reminder email sent
- June 8, 2026 (7 days before): ⚠️ Urgent reminder email sent
```

---

## Automated Lease Reminders

### How It Works

#### 1. **Cron Job Scheduler**
**File**: `backend/jobs/leaseReminderJob.js`

```javascript
const cron = require("node-cron");
const { runLeaseReminderJob } = require("./jobs/leaseReminderJob");

// Runs every day at 9:00 AM
const startLeaseReminderJob = () => {
  cron.schedule("0 9 * * *", async () => {
    console.log("⏰ Running lease expiry reminder job...");
    await runLeaseReminderJob();
  });
  console.log("✅ Lease reminder job scheduled (9:00 AM daily)");
};
```

**Cron Schedule**: `"0 9 * * *"`
- `0` = Minute (0th minute)
- `9` = Hour (9 AM)
- `*` = Any day of month
- `*` = Any month
- `*` = Any day of week

#### 2. **Job Execution Flow**
```javascript
const runLeaseReminderJob = async () => {
  console.log("⏰ Running lease expiry reminder job...");
  let sent = 0;

  try {
    // 1. Find all active assignments
    const assignments = await Assignment.find({ status: "active" });

    for (const assignment of assignments) {
      // 2. Calculate days until expiry
      const days = daysUntil(assignment.leaseExpireDate);

      // 3. Send email if exactly 7 or 14 days before
      if (days !== 7 && days !== 14) continue;

      // 4. Get landlord details
      const landlordUser = await User.findOne({ auth0Id: assignment.landlordId });
      const landlordProfile = await Profile.findOne({ auth0Id: assignment.landlordId });
      const landlordEmail = landlordProfile?.email || landlordUser?.email;

      if (!landlordEmail) {
        console.warn(`⚠️ No email for landlord — skipping`);
        continue;
      }

      // 5. Get resident and property details
      const residentUser = await User.findOne({ auth0Id: assignment.residentId });
      const property = await Property.findById(assignment.propertyId);

      // 6. Send email
      await sendLeaseExpiryEmail({
        landlordEmail,
        landlordName: landlordUser?.name || "",
        residentName: residentUser?.name || "",
        propertyName: property?.name || "",
        leaseExpireDate: assignment.leaseExpireDate,
        daysRemaining: days,
      });

      sent++;
    }

    console.log(`✅ Sent ${sent} lease reminder emails`);
  } catch (error) {
    console.error("❌ Lease reminder job error:", error);
  }
};
```

#### 3. **Date Calculation Logic**
```javascript
const daysUntil = (date) => {
  const today = new Date();
  const utcToday = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  
  const target = new Date(date);
  const utcTarget = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate());
  
  return Math.round((utcTarget - utcToday) / (1000 * 60 * 60 * 24));
};
```

**Why UTC?**
- Avoids timezone issues
- Ensures consistent date calculations
- Prevents duplicate emails due to DST changes

---

## Email Templates

### Lease Expiry Reminder Template

**File**: `backend/services/emailService.js`

#### Design Features
- **Responsive**: Works on mobile and desktop
- **Color-coded Urgency**:
  - 🟡 Yellow (`#ffc107`) for 14-day reminder
  - 🔴 Red (`#dc3545`) for 7-day reminder
- **Professional Layout**: Table-based HTML for email client compatibility
- **CTA Button**: Direct link to T6PMS portal

#### Template Structure

```html
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f8f9fa;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="600" style="background:#ffffff;border-radius:12px;">
          
          <!-- Header -->
          <tr>
            <td style="background:#ffc107;padding:24px 32px;">
              <h1 style="color:#ffffff;">
                📅 Reminder — Lease Expiry Notice
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p>Dear <strong>John Smith</strong>,</p>
              <p>This lease expires in <strong>14 days</strong>.</p>

              <!-- Details Card -->
              <table style="background:#f8f9fa;border-radius:8px;">
                <tr><td>Property: <strong>123 Main St</strong></td></tr>
                <tr><td>Resident: <strong>Sarah Johnson</strong></td></tr>
                <tr><td>Lease Expires: <strong>June 15, 2026</strong></td></tr>
                <tr><td>Days Remaining: <strong>14 days</strong></td></tr>
              </table>

              <!-- CTA Button -->
              <table>
                <tr>
                  <td style="background:#ffc107;border-radius:6px;">
                    <a href="http://localhost:5173" style="color:#ffffff;">
                      Go to T6PMS Portal →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f9fa;padding:20px;">
              <p style="color:#aaa;font-size:12px;">
                This is an automated reminder from T6PMS.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

#### Dynamic Content Variables

```javascript
const sendLeaseExpiryEmail = async ({
  landlordEmail,      // "landlord@example.com"
  landlordName,       // "John Smith"
  residentName,       // "Sarah Johnson"
  propertyName,       // "123 Main St"
  leaseExpireDate,    // Date object
  daysRemaining,      // 14 or 7
}) => {
  // Format date: "June 15, 2026"
  const formattedDate = new Date(leaseExpireDate).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Dynamic urgency styling
  const urgencyColor = daysRemaining <= 7 ? "#dc3545" : "#ffc107";
  const urgencyLabel = daysRemaining <= 7 ? "⚠️ Urgent" : "📅 Reminder";

  // ... Build HTML template with variables
};
```

---

## Backend Implementation

### Email Service Module

**File**: `backend/services/emailService.js`

```javascript
const { BrevoClient } = require("@getbrevo/brevo");

const client = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

const FROM_EMAIL = process.env.BREVO_FROM_EMAIL || "no-reply@t6pms.com";
const FROM_NAME  = process.env.BREVO_FROM_NAME  || "T6PMS Property Management";

const sendLeaseExpiryEmail = async ({
  landlordEmail,
  landlordName,
  residentName,
  propertyName,
  leaseExpireDate,
  daysRemaining,
}) => {
  // Format date and build template...
  const html = `...`; // HTML template

  console.log(`📤 Sending email to: ${landlordEmail}`);

  await client.transactionalEmails.sendTransacEmail({
    sender: { name: FROM_NAME, email: FROM_EMAIL },
    to: [{ email: landlordEmail }],
    subject: `⚠️ Lease expires in ${daysRemaining} days: ${propertyName}`,
    htmlContent: html,
    textContent: `Lease for ${residentName} at ${propertyName} expires in ${daysRemaining} days.`,
  });

  console.log(`📧 Email sent to ${landlordEmail}`);
};

module.exports = { sendLeaseExpiryEmail };
```

### Cron Job Setup

**File**: `backend/jobs/leaseReminderJob.js`

```javascript
const cron = require("node-cron");
const Assignment = require("../models/Assignment");
const { sendLeaseExpiryEmail } = require("../services/emailService");

const runLeaseReminderJob = async () => {
  console.log("⏰ Running lease expiry reminder job...");
  // ... implementation
};

const startLeaseReminderJob = () => {
  // Production: Daily at 9 AM
  cron.schedule("0 9 * * *", async () => {
    await runLeaseReminderJob();
  });

  console.log("✅ Lease reminder job scheduled (9:00 AM daily)");
};

module.exports = { startLeaseReminderJob, runLeaseReminderJob };
```

### Server Initialization

**File**: `backend/server.js`

```javascript
const { startLeaseReminderJob } = require("./jobs/leaseReminderJob");

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");
    await seedDatabase();
    
    server.listen(PORT, () => {
      console.log(`🚀 Server on http://localhost:${PORT}`);
      startLeaseReminderJob();  // ✅ Start cron job
    });
  });
```

---

## Testing & Troubleshooting

### Manual Testing

#### Test 1: Send Test Email
```bash
node backend/scripts/testEmail.js
```

#### Test 2: Manually Trigger Cron Job
Create `backend/scripts/testLeaseReminder.js`:

```javascript
require("dotenv").config();
const mongoose = require("mongoose");
const { runLeaseReminderJob } = require("../jobs/leaseReminderJob");

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");
    await runLeaseReminderJob();
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
```

Run:
```bash
node backend/scripts/testLeaseReminder.js
```

#### Test 3: Create Test Assignment
Use MongoDB Compass or shell:

```javascript
// Create assignment expiring in 14 days
db.assignments.insertOne({
  propertyId: ObjectId("..."),
  landlordId: "auth0|landlord1",
  residentId: "auth0|resident1",
  leaseExpireDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  status: "active",
  rentPaid: true
});
```

Then run the cron job manually to trigger email.

---

### Common Issues

#### Issue 1: "Invalid API Key"
**Error**: `401 Unauthorized` or `Invalid API Key`

**Solution**:
1. Check `.env` file has correct `BREVO_API_KEY`
2. Verify no extra spaces in API key
3. Regenerate API key in Brevo dashboard if needed
4. Restart backend server after changing `.env`

#### Issue 2: "Sender email not verified"
**Error**: `Sender email address is not verified`

**Solution**:
1. Log in to Brevo dashboard
2. Go to **"Senders"** → Click your email
3. Click **"Resend verification email"**
4. Check inbox and verify
5. Wait 5-10 minutes for verification to propagate

#### Issue 3: "Email not received"
**Possible Causes**:
- Email in spam folder
- Incorrect recipient email
- Brevo daily limit reached (300 on free tier)
- Sender email not verified

**Debugging Steps**:
1. Check Brevo dashboard → **"Email"** → **"Transactional"** → **"Logs"**
2. Look for the email in logs
3. Check delivery status (delivered, bounced, spam)
4. Check recipient's spam folder
5. Try different recipient email

#### Issue 4: "Cron job not running"
**Symptoms**: No emails sent at scheduled time

**Solution**:
1. Check server is running continuously (not restarting)
2. Verify server timezone matches expected timezone
3. Check server logs for cron execution messages
4. Test manually: `node backend/scripts/testLeaseReminder.js`
5. Adjust cron schedule if needed:
   ```javascript
   // Every minute for testing
   cron.schedule("* * * * *", async () => { ... });
   ```

#### Issue 5: "HTML not rendering properly"
**Symptoms**: Email looks broken or plain text

**Solution**:
- Use table-based layout (not div/flexbox)
- Use inline CSS only (no external stylesheets)
- Test with [Litmus](https://litmus.com) or [Email on Acid](https://www.emailonacid.com)
- Preview in Brevo dashboard before sending

---

## Best Practices

### Email Deliverability

1. **Use Verified Sender Domain**
   - Custom domain email (e.g., `noreply@yourdomain.com`)
   - Set up SPF, DKIM, DMARC records
   - Avoid free email providers for sender (Gmail, Yahoo)

2. **Professional From Name**
   - Use consistent branding: `T6PMS Property Management`
   - Avoid generic names like `no-reply`

3. **Clear Subject Lines**
   - Be specific: "Lease expires in 7 days: 123 Main St"
   - Use urgency indicators: ⚠️ emoji for urgent emails
   - Keep under 50 characters

4. **Provide Plain Text Alternative**
   - Always include `textContent` alongside `htmlContent`
   - Ensures readability if HTML fails

### Template Design

1. **Responsive Design**
   - Use table-based layout (600px max width)
   - Test on mobile devices
   - Use inline CSS only

2. **Accessibility**
   - High contrast colors
   - Alt text for images
   - Readable font sizes (14px minimum)

3. **Professional Branding**
   - Consistent colors and fonts
   - Company logo in header
   - Footer with contact information

### Error Handling

```javascript
const sendEmail = async (params) => {
  try {
    await client.transactionalEmails.sendTransacEmail(params);
    console.log("✅ Email sent successfully");
  } catch (error) {
    console.error("❌ Email send failed:", error.message);
    
    // Log to monitoring service (e.g., Sentry)
    if (process.env.SENTRY_DSN) {
      Sentry.captureException(error);
    }
    
    // Don't throw — continue processing other emails
  }
};
```

### Rate Limiting

**Free Tier**: 300 emails/day

**Production Strategy**:
- Batch emails in groups
- Add delay between batches (1-2 seconds)
- Upgrade to paid plan if exceeding limits

```javascript
// Example: Batch sending with delay
for (let i = 0; i < assignments.length; i++) {
  await sendLeaseExpiryEmail(assignments[i]);
  
  // Wait 1 second between emails
  if (i < assignments.length - 1) {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
```

### Monitoring & Logging

```javascript
// Log email events
console.log(`📤 Sending email to: ${landlordEmail}`);
console.log(`   Subject: ${subject}`);
console.log(`   Days remaining: ${daysRemaining}`);

// Track success/failure
let sent = 0;
let failed = 0;

try {
  await sendEmail();
  sent++;
} catch (error) {
  failed++;
}

console.log(`✅ Sent: ${sent}, ❌ Failed: ${failed}`);
```

---

## Future Enhancements

### Planned Email Features

#### 1. **Welcome Emails**
- Trigger: User completes onboarding
- Recipient: New user
- Content: Welcome message, getting started guide

#### 2. **Maintenance Notifications**
- Trigger: Maintenance request status changes
- Recipient: Resident
- Content: Status update, contractor details

#### 3. **Contractor Assignments**
- Trigger: Landlord assigns job to contractor
- Recipient: Contractor
- Content: Job details, property address, urgency

#### 4. **Rent Payment Reminders**
- Trigger: 3 days before rent due date
- Recipient: Resident
- Content: Amount due, payment instructions

#### 5. **Monthly Reports**
- Trigger: First of each month
- Recipient: Landlord
- Content: Maintenance summary, rent status

### Email Template System

**Future Implementation**:
```javascript
// templates/welcome.html
// templates/maintenance-update.html
// templates/rent-reminder.html

const sendTemplatedEmail = async (templateName, data) => {
  const template = await loadTemplate(templateName);
  const html = compileTemplate(template, data);
  await sendEmail({ html, ...data });
};
```

### Email Preferences

**Future Feature**: User email preferences
- Allow users to opt-in/opt-out of certain emails
- Store preferences in Profile model
- Respect preferences before sending

```javascript
// Check preferences before sending
const profile = await Profile.findOne({ auth0Id: landlordId });
if (!profile?.emailPreferences?.leaseReminders) {
  console.log("User opted out of lease reminders");
  return;
}
```

---

## Summary

The Email Management System provides:
- ✅ Reliable transactional email delivery via Brevo
- ✅ Automated lease expiry reminders (14 & 7 days before)
- ✅ Professional HTML email templates
- ✅ Daily cron job scheduling
- ✅ Comprehensive error handling and logging
- ✅ Easy integration with Node.js backend
- ✅ Free tier suitable for development and small deployments

The system is production-ready and extensible for future email features like maintenance notifications, rent reminders, and welcome emails.

---

## Quick Reference

### Environment Variables
```env
BREVO_API_KEY=xkeysib-your-api-key-here
BREVO_FROM_EMAIL=noreply@yourdomain.com
BREVO_FROM_NAME=T6PMS Property Management
```

### Cron Schedule Format
```javascript
"0 9 * * *"  // Daily at 9:00 AM
"0 */6 * * *"  // Every 6 hours
"0 0 * * 0"  // Weekly on Sunday at midnight
```

### Send Email Example
```javascript
const { BrevoClient } = require("@getbrevo/brevo");

await client.transactionalEmails.sendTransacEmail({
  sender: { name: "T6PMS", email: "noreply@t6pms.com" },
  to: [{ email: "user@example.com" }],
  subject: "Your Subject",
  htmlContent: "<h1>Hello!</h1>",
  textContent: "Hello!",
});
```

### Brevo Dashboard Links
- **API Keys**: Dashboard → Settings → SMTP & API
- **Email Logs**: Dashboard → Email → Transactional → Logs
- **Senders**: Dashboard → Settings → Senders
- **Statistics**: Dashboard → Statistics → Email

---

**Need Help?**
- Brevo Documentation: [https://developers.brevo.com](https://developers.brevo.com)
- Support: [https://help.brevo.com](https://help.brevo.com)
- Node.js SDK: [https://github.com/getbrevo/brevo-node](https://github.com/getbrevo/brevo-node)
