import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";
import { Resend } from "resend";

// Initialize Resend for email
const resend = new Resend(process.env.RESEND_API_KEY);

// More comprehensive email regex
const EMAIL_REGEX =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export async function POST(request: Request) {
  try {
    // Parse the request body
    const { email, name, source = "landing_page" } = await request.json();

    // Validate inputs
    const errors = [];

    if (!email) {
      errors.push("Email is required");
    } else if (!EMAIL_REGEX.test(email.toLowerCase())) {
      errors.push("Please enter a valid email address");
    }

    // Check email domain has valid MX record (optional but effective)
    const emailDomain = email ? email.split("@")[1] : null;
    const commonDomains = [
      "gmail.com",
      "yahoo.com",
      "outlook.com",
      "hotmail.com",
      "icloud.com",
    ];
    if (emailDomain && !commonDomains.includes(emailDomain.toLowerCase())) {
      // More rigorous validation for non-common domains could be added here
      // This would require DNS lookup which is not easily done in Edge functions
    }

    if (name && name.length > 100) {
      errors.push("Name must be less than 100 characters");
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(". ") }, { status: 400 });
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();

    // Add user to Supabase waitlist table
    const { error } = await supabase
      .from("waitlist")
      .insert([{ email: normalizedEmail, name, source }]);

    if (error) {
      console.error("Error inserting to waitlist:", error);

      // Check if it's a unique constraint error (email already exists)
      if (error.code === "23505") {
        return NextResponse.json(
          { message: "You're already on our waitlist!" },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { error: "Failed to join waitlist" },
        { status: 500 }
      );
    }

    // Send confirmation email
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: "T2A <noreply@yourdomain.com>",
          to: normalizedEmail,
          subject: "Welcome to the T2A Waitlist!",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #000; margin-bottom: 10px;">Welcome to T2A!</h1>
                <div style="display: inline-block; background-color: #262626; border-radius: 20px; padding: 5px 15px; font-size: 14px; color: white;">
                  <span style="color: #facc15; margin-right: 5px;">🚀</span>
                  <span>30-Day MVP Challenge: Building in Public</span>
                </div>
              </div>
              
              <p style="margin-bottom: 15px;">Hi ${name || "there"},</p>
              <p style="margin-bottom: 15px;">Thanks for joining our waitlist. We're excited to have you on board!</p>
              <p style="margin-bottom: 15px;">We're building T2A to help you capture your brilliant ideas before they disappear. Your brain creates ideas — we store them.</p>
              <p style="margin-bottom: 25px;">We'll keep you updated on our progress and let you know when you can start using our platform.</p>
              
              <div style="background-color: #f7f7f7; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
                <p style="margin-top: 0; font-weight: bold;">Why T2A?</p>
                <p style="margin-bottom: 0;">Ever had a brilliant idea... and forgot it 10 minutes later? Your brain wasn't built to store ideas — it was built to create them. But your system? That's where most ideas die. We're changing that.</p>
              </div>
              
              <div style="text-align: center; margin-bottom: 25px;">
                <p style="font-size: 14px; margin-bottom: 10px;">Follow our journey:</p>
                <div>
                  <!-- Instagram -->
                  <a href="https://www.instagram.com/aviinilimited/" style="display: inline-block; margin: 0 10px; color: #262626; text-decoration: none;" target="_blank">
                    <img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" width="24" height="24" alt="Instagram" style="vertical-align: middle;">
                  </a>
                  <!-- TikTok -->
                  <a href="https://www.tiktok.com/@aviinilimited" style="display: inline-block; margin: 0 10px; color: #262626; text-decoration: none;" target="_blank">
                    <img src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" width="24" height="24" alt="TikTok" style="vertical-align: middle;">
                  </a>
                  <!-- Twitter/X -->
                  <a href="https://x.com/AviniLimited" style="display: inline-block; margin: 0 10px; color: #262626; text-decoration: none;" target="_blank">
                    <img src="https://cdn-icons-png.flaticon.com/512/5969/5969020.png" width="24" height="24" alt="X (Twitter)" style="vertical-align: middle;">
                  </a>
                  <!-- YouTube -->
                  <a href="https://www.youtube.com/channel/UCji0gg2Vbq16XWxlVn0KygA" style="display: inline-block; margin: 0 10px; color: #262626; text-decoration: none;" target="_blank">
                    <img src="https://cdn-icons-png.flaticon.com/512/174/174883.png" width="24" height="24" alt="YouTube" style="vertical-align: middle;">
                  </a>
                </div>
              </div>
              
              <p style="font-size: 12px; color: #666; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
                This project is part of a 30-day challenge to build and ship an MVP in public.<br>
                © ${new Date().getFullYear()} Thoughts2Action. All rights reserved.
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Continue anyway, as the user was added to the waitlist
      }
    }

    return NextResponse.json({
      success: true,
      message: "Successfully joined the waitlist!",
    });
  } catch (err) {
    console.error("Waitlist API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
