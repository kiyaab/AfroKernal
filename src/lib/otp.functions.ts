import { createServerFn } from "@tanstack/react-start";
import {
  generateSecureOtp,
  storeOtp,
  verifyStoredOtp,
  getActiveSmtpConfig,
  sendNativeSmtpEmail,
  buildOtpEmailHtml,
} from "./email-otp.server";

/**
 * Server Function: Send a Real 6-Digit Verification Code to a Gmail / Email address
 */
export const sendRealEmailOtpServerFn = createServerFn({ method: "POST" })
  .validator(
    (input: { email: string; purpose?: "signup" | "signin"; displayName?: string }) => input,
  )
  .handler(async ({ data }) => {
    const email = data.email?.toLowerCase().trim();
    if (!email || !email.includes("@")) {
      return { success: false, message: "A valid email address is required." };
    }

    const purpose = data.purpose || "signup";
    const code = generateSecureOtp();
    storeOtp(email, code, purpose);

    const smtp = getActiveSmtpConfig();
    let isLiveDelivered = false;
    let provider = "local-simulated";
    let deliveryError: string | null = null;

    // 1. Send via Real Gmail / Custom SMTP if configured
    if (smtp) {
      try {
        const subject =
          purpose === "signup"
            ? `${code} is your AfroKernel verification code`
            : `${code} is your AfroKernel sign-in code`;

        const html = buildOtpEmailHtml(code, email, purpose);
        await sendNativeSmtpEmail(smtp, {
          to: email,
          subject,
          html,
        });

        isLiveDelivered = true;
        provider = smtp.host.includes("gmail") ? "Gmail SMTP" : "Custom SMTP";
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "SMTP send failed";
        console.error("[Email OTP] SMTP delivery error:", msg);
        deliveryError = msg;
      }
    }

    // 2. Check for Resend API key fallback
    if (!isLiveDelivered && process.env.RESEND_API_KEY) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM || "AfroKernel <onboarding@resend.dev>",
            to: [email],
            subject: `${code} is your AfroKernel verification code`,
            html: buildOtpEmailHtml(code, email, purpose),
          }),
        });

        if (res.ok) {
          isLiveDelivered = true;
          provider = "Resend API";
        }
      } catch (err) {
        console.warn("[Email OTP] Resend fallback failed:", err);
      }
    }

    // Server console log for developer transparency
    console.log(
      `[Real Google/Email OTP] Dispatched code: ${code} for ${email} (Provider: ${provider}, Live Delivered: ${isLiveDelivered})`,
    );

    return {
      success: true,
      email,
      provider,
      isLiveDelivered,
      deliveryError,
      message: isLiveDelivered
        ? `A 6-digit verification code has been sent directly to ${email}.`
        : `Verification code generated for ${email}. Live Gmail SMTP awaiting configuration.`,
    };
  });

/**
 * Server Function: Save and connect Gmail SMTP credentials
 */
export const saveSmtpConfigServerFn = createServerFn({ method: "POST" })
  .validator((input: { gmailUser: string; appPassword: string }) => input)
  .handler(async ({ data }) => {
    const user = data.gmailUser?.trim();
    const pass = data.appPassword?.replace(/\s+/g, "").trim();

    if (!user || !user.includes("@")) {
      return { success: false, message: "A valid email address is required." };
    }
    if (!pass || pass.length < 10) {
      return {
        success: false,
        message: "A valid Google App Password (16 characters) is required.",
      };
    }

    process.env.GMAIL_USER = user;
    process.env.GMAIL_APP_PASSWORD = pass;

    try {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const envPath = path.resolve(process.cwd(), ".env");

      let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf-8") : "";

      if (content.includes("GMAIL_USER=")) {
        content = content.replace(/GMAIL_USER=.*/g, `GMAIL_USER=${user}`);
      } else {
        content += `\nGMAIL_USER=${user}\n`;
      }

      if (content.includes("GMAIL_APP_PASSWORD=")) {
        content = content.replace(/GMAIL_APP_PASSWORD=.*/g, `GMAIL_APP_PASSWORD=${pass}`);
      } else {
        content += `GMAIL_APP_PASSWORD=${pass}\n`;
      }

      fs.writeFileSync(envPath, content, "utf-8");
    } catch (fsErr) {
      console.warn("Could not persist to .env file, process.env updated:", fsErr);
    }

    return {
      success: true,
      message: `Gmail sender (${user}) connected successfully! Live emails will now be sent directly to user inboxes.`,
    };
  });

/**
 * Server Function: Verify the entered 6-digit code
 */
export const verifyRealEmailOtpServerFn = createServerFn({ method: "POST" })
  .validator((input: { email: string; code: string }) => input)
  .handler(async ({ data }) => {
    const { email, code } = data;
    if (!email || !code) {
      return { success: false, valid: false, message: "Email and 6-digit code are required." };
    }

    const result = verifyStoredOtp(email, code);
    return {
      success: result.valid,
      valid: result.valid,
      message: result.message,
      purpose: result.purpose,
    };
  });

/**
 * Server Function: Check SMTP & Gmail Configuration Status
 */
export const getOtpSmtpStatusServerFn = createServerFn({ method: "GET" }).handler(async () => {
  const smtp = getActiveSmtpConfig();
  const hasResend = Boolean(process.env.RESEND_API_KEY);

  return {
    isConfigured: Boolean(smtp || hasResend),
    provider: smtp
      ? smtp.host.includes("gmail")
        ? "Gmail SMTP"
        : `Custom SMTP (${smtp.host})`
      : hasResend
        ? "Resend API"
        : "Not Configured",
    fromUser: smtp?.user
      ? `${smtp.user.substring(0, 3)}***@${smtp.user.split("@")[1] || "gmail.com"}`
      : null,
    port: smtp?.port || null,
  };
});

/**
 * Server Function: Test sending an email to any Gmail inbox
 */
export const testSendEmailServerFn = createServerFn({ method: "POST" })
  .validator((input: { targetEmail: string }) => input)
  .handler(async ({ data }) => {
    const email = data.targetEmail?.toLowerCase().trim();
    if (!email || !email.includes("@")) {
      return { success: false, message: "Please provide a valid destination email." };
    }

    const smtp = getActiveSmtpConfig();
    if (!smtp) {
      return {
        success: false,
        message:
          "Gmail SMTP credentials (GMAIL_USER and GMAIL_APP_PASSWORD) are not yet configured in .env. Add them to enable real email sending.",
      };
    }

    try {
      const testCode = generateSecureOtp();
      const html = buildOtpEmailHtml(testCode, email, "signup");
      await sendNativeSmtpEmail(smtp, {
        to: email,
        subject: `[Test] AfroKernel Gmail Verification Test - ${testCode}`,
        html,
      });

      return {
        success: true,
        message: `Test verification email sent successfully to ${email} via ${smtp.host}! Check your inbox.`,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "SMTP send error";
      return { success: false, message: `Failed to send test email: ${message}` };
    }
  });
