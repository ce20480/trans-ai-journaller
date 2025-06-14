// app/api/notes/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { FREE_NOTES_LIMIT } from "@/utils/constants";

export async function GET(request: NextRequest) {
  // 1️⃣ Derive authenticated user via JWT or session cookie
  const authHeader = request.headers.get("authorization") || "";
  let supabase;
  let user;
  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const adminClient = createAdminClient();
    const {
      data: { user: mobileUser },
      error: jwtError,
    } = await adminClient.auth.getUser(token);
    if (jwtError || !mobileUser) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    supabase = adminClient;
    user = mobileUser;
  } else {
    const serverClient = await createServerClient();
    const {
      data: { user: webUser },
      error: authError,
    } = await serverClient.auth.getUser();
    if (authError || !webUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    supabase = serverClient;
    user = webUser;
  }
  const userId = user.id;

  // Fetch notes
  const { data: notes, error: notesError } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (notesError) {
    console.error("notes fetch failed", notesError);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }

  // Fetch user profile for subscription status and note count
  const { data: userProfile, error: profileError } = await supabase
    .from("profiles")
    .select("subscription_status, free_notes_count")
    .eq("id", userId)
    .single();

  if (profileError) {
    console.error("profile fetch failed", profileError);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }

  // Check if user is admin from auth metadata
  const isAdmin = user.user_metadata?.role === "admin";

  return NextResponse.json({
    data: notes,
    userProfile: {
      subscription_status: userProfile?.subscription_status,
      free_notes_count: userProfile?.free_notes_count ?? 0,
      role: isAdmin ? "admin" : "user",
      canCreateNote:
        userProfile?.subscription_status === "active" ||
        isAdmin ||
        (userProfile?.free_notes_count ?? 0) < FREE_NOTES_LIMIT,
    },
  });
}

export async function POST(request: NextRequest) {
  console.log("🔍 Notes API - POST request received");

  // Get JWT token from headers for mobile requests
  const authHeader = request.headers.get("authorization");
  let token = null;
  let user = null;
  let supabase;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);

    // Mobile flow with JWT token
    try {
      const adminClient = createAdminClient();

      // Verify the JWT token and get the user
      const { data: userData, error: jwtError } =
        await adminClient.auth.getUser(token);

      if (jwtError || !userData.user) {
        console.log("❌ Notes API - Invalid JWT token");
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }

      user = userData.user;
      supabase = adminClient; // Use admin client to bypass RLS

      console.log(
        `✅ Notes API - Mobile request authenticated with JWT for user: ${user.id}`
      );
    } catch (error) {
      console.error("JWT validation failed", error);
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }
  } else {
    // 1) Get authenticated user (web flow)
    supabase = await createServerClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    user = authUser;
  }

  if (!user) {
    console.log("❌ Notes API - Unauthorized: No user found");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log(`✅ Notes API - Authenticated user: ${user.id}`);

  // 2) Parse note data
  let noteData;
  try {
    noteData = await request.json();
    if (!noteData.title || !noteData.content) {
      throw new Error("Title and content are required");
    }
    console.log(
      `📝 Notes API - Note data received: ${noteData.title.substring(0, 30)}...`
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    console.log(`❌ Notes API - Invalid request: ${message}`);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // 3) Get user profile to check subscription status and note count
  console.log(`🔍 Notes API - Fetching profile for user: ${user.id}`);
  const { data: userProfile, error: profileError } = await supabase
    .from("profiles")
    .select("subscription_status, free_notes_count")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("❌ Notes API - Profile fetch failed:", profileError);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }

  // 4) Check if free user has reached note limit
  const freeNotesCount = userProfile?.free_notes_count ?? 0;
  const isSubscribed = userProfile?.subscription_status === "active";
  const isAdmin = token ? false : user.user_metadata?.role === "admin";

  console.log(`📊 Notes API - User status:
    - Free notes count: ${freeNotesCount}
    - Subscription: ${isSubscribed ? "Active" : "Inactive"}
    - Admin: ${isAdmin ? "Yes" : "No"}
  `);

  if (!isSubscribed && !isAdmin && freeNotesCount >= FREE_NOTES_LIMIT) {
    console.log(
      `❌ Notes API - Free limit reached: ${freeNotesCount}/${FREE_NOTES_LIMIT}`
    );
    return NextResponse.json(
      {
        error: `Free note limit reached (${freeNotesCount}/${FREE_NOTES_LIMIT}). Please subscribe to create more notes.`,
        code: "FREE_LIMIT_REACHED",
      },
      { status: 402 }
    );
  }

  // 5) Create the note
  const newNote = {
    user_id: user.id,
    title: noteData.title,
    content: noteData.content,
    created_at: new Date().toISOString(),
  };

  console.log(`📝 Notes API - Creating note for user: ${user.id}`);
  const { data: note, error: insertError } = await supabase
    .from("notes")
    .insert(newNote)
    .select()
    .single();

  if (insertError) {
    console.error("❌ Notes API - Error creating note:", insertError);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }

  console.log(`✅ Notes API - Note created with ID: ${note.id}`);

  // 6) Increment free_notes_count for non-subscribers
  if (!isSubscribed && !isAdmin) {
    const newCount = freeNotesCount + 1;
    console.log(
      `📈 Notes API - Updating free notes count from ${freeNotesCount} to ${newCount}`
    );

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ free_notes_count: newCount })
      .eq("id", user.id);

    if (updateError) {
      console.error(
        "❌ Notes API - Failed to update free_notes_count:",
        updateError
      );
      // Note still created, so continue with success response
    } else {
      console.log(
        `✅ Notes API - Successfully updated free notes count to ${newCount}`
      );

      // Double-check if the update was successful by fetching profile again
      const { data: updatedProfile } = await supabase
        .from("profiles")
        .select("free_notes_count")
        .eq("id", user.id)
        .single();

      console.log(
        `🔍 Notes API - Verification check: free_notes_count is now ${updatedProfile?.free_notes_count ?? "unknown"}`
      );
    }
  } else {
    console.log(
      `ℹ️ Notes API - Skipping free notes count update (subscribed: ${isSubscribed}, admin: ${isAdmin})`
    );
  }

  // 7) Return the created note
  console.log(`🎉 Notes API - Success! Returning note with status 201`);
  return NextResponse.json(note, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  // 1️⃣ Authenticate user via JWT or session cookie
  const authHeader = request.headers.get("authorization") || "";
  let supabase;
  let user;
  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const adminClient = createAdminClient();
    const {
      data: { user: mobileUser },
      error: jwtError,
    } = await adminClient.auth.getUser(token);
    if (jwtError || !mobileUser) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    supabase = adminClient;
    user = mobileUser;
  } else {
    const serverClient = await createServerClient();
    const {
      data: { user: webUser },
      error: authError,
    } = await serverClient.auth.getUser();
    if (authError || !webUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    supabase = serverClient;
    user = webUser;
  }
  const userId = user.id;

  // 2️⃣ Parse note ID from request
  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // 3️⃣ Delete only the note belonging to this user
  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) {
    console.error("notes delete failed", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
  return NextResponse.json({ success: true });
}
