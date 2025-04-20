import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { title, description, tags } = await request.json();

    // Validate fields
    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (title.length > 100) {
      return NextResponse.json(
        { error: "Title must be 100 characters or less" },
        { status: 400 }
      );
    }

    if (!description || description.trim().length === 0) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    if (description.length > 1000) {
      return NextResponse.json(
        { error: "Description must be 1000 characters or less" },
        { status: 400 }
      );
    }

    // Process tags (if provided)
    let processedTags: string[] = [];
    if (tags) {
      if (typeof tags === "string") {
        // If tags is a comma-separated string, split and trim
        processedTags = tags
          .split(",")
          .map((tag) => tag.trim().toLowerCase())
          .filter((tag) => tag.length > 0);
      } else if (Array.isArray(tags)) {
        // If tags is already an array, just trim and filter
        processedTags = tags
          .map((tag) => tag.trim().toLowerCase())
          .filter((tag) => tag.length > 0);
      }
    }

    // Initialize Supabase client
    const supabase = await createServerClient();

    // Insert into database
    const { data, error } = await supabase
      .from("problems")
      .insert([
        {
          title: title.trim(),
          description: description.trim(),
          tags: processedTags,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error inserting problem:", error);
      return NextResponse.json(
        { error: "Failed to save problem" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Unexpected error in POST /api/problems:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get("tag");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    // Initialize Supabase client
    const supabase = await createServerClient();

    // Base query
    let query = supabase
      .from("problems")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    // Add tag filter if provided
    if (tag && tag.trim() !== "") {
      query = query.contains("tags", [tag.trim().toLowerCase()]);
    }

    // Execute query
    const { data, error } = await query;

    if (error) {
      console.error("Error fetching problems:", error);
      return NextResponse.json(
        { error: "Failed to fetch problems" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Unexpected error in GET /api/problems:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// For the bonus feature - upvoting a problem
export async function PATCH(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Problem ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Increment the votes for the given problem
    const { data, error } = await supabase.rpc("increment_problem_votes", {
      problem_id: id,
    });

    if (error) {
      console.error("Error upvoting problem:", error);

      // Try fallback method if RPC fails
      const { data: updateData, error: updateError } = await supabase
        .from("problems")
        .update({ votes: supabase.rpc("increment", { amount: 1 }) })
        .eq("id", id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json(
          { error: "Failed to upvote problem" },
          { status: 500 }
        );
      }

      return NextResponse.json(updateData);
    }

    return NextResponse.json({ success: true, votes: data });
  } catch (error) {
    console.error("Unexpected error in PATCH /api/problems:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
