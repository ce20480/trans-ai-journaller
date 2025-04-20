import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { title, description, tags } = await request.json();

    // Initialize Supabase client
    const supabase = await createServerClient();

    // Get current user if available
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If user is authenticated, check their daily submission limit
    if (user) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get user's submission count for today
      const { data: submissionData, error: countError } = await supabase
        .from("user_problem_submissions")
        .select("count")
        .eq("user_id", user.id)
        .eq("submission_date", today.toISOString().split("T")[0])
        .single();

      if (!countError && submissionData && submissionData.count >= 3) {
        return NextResponse.json(
          { error: "You've reached the limit of 3 problems per day" },
          { status: 429 }
        );
      }
    }

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

    // Insert into database
    const { data, error } = await supabase
      .from("problems")
      .insert([
        {
          title: title.trim(),
          description: description.trim(),
          tags: processedTags,
          user_id: user?.id, // Add user ID if user is authenticated
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
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    console.log(`Fetching problems with limit: ${limit}, offset: ${offset}`);

    // Initialize Supabase client
    const supabase = await createServerClient();

    // Count total problems for pagination
    let countQuery = supabase.from("problems").select("*", { count: "exact" });

    // Add tag filter if provided to count query
    if (tag && tag.trim() !== "") {
      countQuery = countQuery.contains("tags", [tag.trim().toLowerCase()]);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error("Error counting problems:", countError);
      return NextResponse.json(
        { error: "Failed to count problems" },
        { status: 500 }
      );
    }

    console.log(`Total problems: ${count}`);

    // Base query for data
    let query = supabase
      .from("problems")
      .select("*")
      .order("created_at", { ascending: false });

    // Add tag filter if provided
    if (tag && tag.trim() !== "") {
      query = query.contains("tags", [tag.trim().toLowerCase()]);
    }

    // Add pagination
    query = query.range(offset, offset + limit - 1);

    console.log(`Query range: ${offset} to ${offset + limit - 1}`);

    // Execute query
    const { data, error } = await query;

    if (error) {
      console.error("Error fetching problems:", error);
      return NextResponse.json(
        { error: "Failed to fetch problems" },
        { status: 500 }
      );
    }

    console.log(`Fetched ${data?.length || 0} problems`);

    // Calculate if there are more pages
    const hasMore = offset + limit < (count || 0);

    return NextResponse.json({
      data,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore,
        currentPage: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
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

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Problem ID is required" },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = await createServerClient();

    // Get the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If there's no user, we don't delete as it could be done by anonymous users
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // The row-level security policy will handle permissions
    // Admins can delete any problem, users cannot delete anything
    const { error } = await supabase.from("problems").delete().eq("id", id);

    if (error) {
      console.error("Error deleting problem:", error);
      if (error.code === "42501") {
        return NextResponse.json(
          { error: "You don't have permission to delete this problem" },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: "Failed to delete problem" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error in DELETE /api/problems:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
