// file: app/api/auth/resend-confirmation/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { z } from "zod";

const BodySchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  // 1) validate
  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 400 }
    );
  }

  // 2) resend confirmation
  const supabase = await createServerClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: body.email,
  });

  if (error) {
    console.error("❌ resend-confirmation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 3) done
  return NextResponse.json(
    { message: "Confirmation email resent" },
    { status: 200 }
  );
}
