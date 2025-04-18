// file: app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { z } from "zod";

// 1) Build a Zod schema that also enforces password === confirmPassword
const SignupSchema = z
  .object({
    name: z.string().trim().max(100).optional(),
    email: z.string().trim().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match",
  });

export async function POST(req: NextRequest) {
  // 2) Parse & validate
  let input: z.infer<typeof SignupSchema>;
  try {
    input = SignupSchema.parse(await req.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      const message = err.errors.map((e) => e.message).join("; ");
      return NextResponse.json({ error: message }, { status: 422 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // 3) Sign up with Supabase
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: { name: input.name, role: "user" },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // 4a) No session → confirmation email has gone out
    if (!data.session) {
      return NextResponse.json(
        { needsConfirmation: true, message: "Verification email sent" },
        { status: 201 }
      );
    }

    // 4b) Rare immediate session case → go to payment
    return NextResponse.json({ redirect: "/payment" }, { status: 200 });
  } catch (err) {
    console.error("Signup failed:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Server error" },
      { status: 500 }
    );
  }
}
