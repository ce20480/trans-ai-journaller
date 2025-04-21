export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { Resend } from "resend";
import { z } from "zod";

// 1) Zod schema for input validation + normalization
const WaitlistInput = z.object({
  email: z
    .string()
    .email()
    .transform((e) => e.trim().toLowerCase()),
  name: z.string().max(100).optional(),
  source: z.string().optional().default("landing_page"),
});

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(request: Request) {
  // 2) Parse & validate
  let input;
  try {
    input = WaitlistInput.parse(await request.json());
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid input";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { email, name, source } = input;

  // 3) Insert into Supabase
  const supabase = await createServerClient();
  const { error: dbError } = await supabase
    .from("waitlist")
    .insert({ email, name, source })
    .single();

  if (dbError) {
    console.error("❌ Waitlist insert error:", dbError);
    // Unique violation code from PostgreSQL
    if (dbError.code === "23505") {
      return NextResponse.json(
        { message: "You’re already on our waitlist!" },
        { status: 200 }
      );
    }
    return NextResponse.json(
      { error: "Failed to join waitlist" },
      { status: 500 }
    );
  }

  // 4) Fire off a welcome email (best‑effort)
  if (resend) {
    try {
      await resend.emails.send({
        from: "T2A <noreply@yourdomain.com>",
        to: email,
        subject: "Welcome to the T2A Waitlist!",
        html: `<div style="font-family: sans-serif; max-width:600px; margin:auto; padding:20px; color:#333">
  <h1 style="color:#000">Welcome to T2A!</h1>
  <p>Hi ${name ?? "there"}, thanks for joining our waitlist. We’ll notify you as soon as we launch.</p>
  <p style="font-size:12px; color:#666">© ${new Date().getFullYear()} Thoughts2Action</p>
  <p>Follow our journey:</p>
  <div>
    <a href="https://www.instagram.com/aviinilimited/">Instagram</a>
    <a href="https://www.tiktok.com/@aviinilimited">TikTok</a>
    <a href="https://x.com/AviniLimited">X (Twitter)</a>
    <a href="https://www.youtube.com/channel/UCji0gg2Vbq16XWxlVn0KygA">YouTube</a>
  </div>
</div>`,
      });
    } catch (emailError) {
      console.error("⚠️  Resend email error:", emailError);
    }
  }

  // 5) Success
  return NextResponse.json(
    { success: true, message: "Successfully joined the waitlist!" },
    { status: 201 }
  );
}

export function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
