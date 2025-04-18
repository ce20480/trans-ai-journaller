// app/api/notes/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { requireActiveSubscription } from "@/utils/supabase/auth";

export async function GET(request: NextRequest) {
  const supabase = await createServerClient();
  const guard = await requireActiveSubscription(supabase);
  if (guard instanceof NextResponse) return guard;

  const { searchParams } = new URL(request.url);
  const targetUserId = searchParams.get("user_id");
  if (!targetUserId) {
    return NextResponse.json({ error: "user_id is required" }, { status: 400 });
  }

  // Only allow the logged‐in user to fetch *their* notes...
  if (guard.userId !== targetUserId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", targetUserId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("notes fetch failed", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
  return NextResponse.json({ data });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createServerClient();
  const guard = await requireActiveSubscription(supabase);
  if (guard instanceof NextResponse) return guard;

  const { id, user_id } = await request.json();
  if (!id || !user_id) {
    return NextResponse.json(
      { error: "id and user_id required" },
      { status: 400 }
    );
  }
  if (guard.userId !== user_id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Delete in one go
  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (error) {
    console.error("notes delete failed", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
  return NextResponse.json({ success: true });
}
