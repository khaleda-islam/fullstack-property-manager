const cron       = require("node-cron");
const Assignment = require("../models/Assignment");
const User       = require("../models/User");
const Profile    = require("../models/Profile");
const Property   = require("../models/Property");
const { sendLeaseExpiryEmail } = require("../services/emailService");
 
// ── Helper: days between today and a date (UTC to avoid timezone issues) ─────
const daysUntil = (date) => {
  const today  = new Date();
  const utcToday = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const target = new Date(date);
  const utcTarget = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate());
  return Math.round((utcTarget - utcToday) / (1000 * 60 * 60 * 24));
};
 
// ── Main job logic ────────────────────────────────────────────────────────────
const runLeaseReminderJob = async () => {
  console.log("⏰ Running lease expiry reminder job...");
  let sent = 0;
 
  try {
    const assignments = await Assignment.find({ status: "active" });
 
    for (const assignment of assignments) {
      const days = daysUntil(assignment.leaseExpireDate);
 
      // Only send on exactly 7 or 14 days before expiry
      if (days !== 7 && days !== 14) continue;
 
      try {
        const landlordUser    = await User.findOne({ auth0Id: assignment.landlordId });
        const landlordProfile = await Profile.findOne({ auth0Id: assignment.landlordId });
 
        const profileEmail  = landlordProfile?.email?.trim();
        const auth0Email    = landlordUser?.email?.trim();
        const landlordEmail = profileEmail || auth0Email;
 
        console.log(`📋 Assignment ${assignment._id}:`);
        console.log(`   using email: ${landlordEmail || "(NONE — skipping)"}`);
        console.log(`   days until:  ${days}`);
 
        if (!landlordEmail) {
          console.warn(`⚠️  No email for landlord — skipping`);
          continue;
        }
 
        const residentUser = await User.findOne({ auth0Id: assignment.residentId });
        const property     = await Property.findById(assignment.propertyId);
 
        await sendLeaseExpiryEmail({
          landlordEmail,
          landlordName:    landlordUser?.name || "",
          residentName:    residentUser?.name || "",
          propertyName:    property?.name     || "",
          leaseExpireDate: assignment.leaseExpireDate,
          daysRemaining:   days,
        });
 
        sent++;
      } catch (err) {
        console.error(`❌ Failed for assignment ${assignment._id}:`, err.message);
      }
    }
 
    console.log(`✅ Lease reminder job done — ${sent} email(s) sent`);
  } catch (err) {
    console.error("❌ Lease reminder job failed:", err.message);
  }
};
 
// ── Schedule: runs every day at 9:00 AM ──────────────────────────────────────
const startLeaseReminderJob = () => {
  cron.schedule("0 13 * * *", runLeaseReminderJob, {
    timezone: "America/Toronto",
  });
  console.log("📅 Lease reminder cron job scheduled (daily at 1:00 PM Toronto time)");
};
 
module.exports = { startLeaseReminderJob, runLeaseReminderJob };