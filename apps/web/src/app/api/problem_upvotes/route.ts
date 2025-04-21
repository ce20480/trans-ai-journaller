import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/utils/supabase/server";

// POST handler to create an upvote
export async function POST(request: NextRequest) {
  try {
    const { problem_id } = await request.json();

    if (!problem_id) {
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

    // If there's no user, we don't allow upvoting
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // First try to insert into problem_upvotes
    const { error: upvoteError } = await supabase
      .from("problem_upvotes")
      .insert({
        user_id: user.id,
        problem_id,
      });

    // If the insert fails due to a duplicate, the user has already upvoted
    if (upvoteError) {
      if (upvoteError.code === "23505") {
        // Unique constraint violation
        return NextResponse.json(
          { error: "You have already upvoted this problem" },
          { status: 409 }
        );
      }
      console.error("Error recording upvote:", upvoteError);
      return NextResponse.json(
        { error: "Failed to record upvote" },
        { status: 500 }
      );
    }

    // Now increment the votes count for the problem
    const { data, error } = await supabase.rpc("increment_problem_votes", {
      problem_id,
    });

    if (error) {
      console.error("Error upvoting problem:", error);
      return NextResponse.json(
        { error: "Failed to upvote problem" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, votes: data });
  } catch (error) {
    console.error("Unexpected error in POST /api/problem_upvotes:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// DELETE handler to remove an upvote
export async function DELETE(request: NextRequest) {
  try {
    const { problem_id } = await request.json();

    if (!problem_id) {
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

    // If there's no user, we don't allow un-voting
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Delete the upvote record
    const { error: deleteError } = await supabase
      .from("problem_upvotes")
      .delete()
      .eq("problem_id", problem_id)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Error removing upvote:", deleteError);
      return NextResponse.json(
        { error: "Failed to remove upvote" },
        { status: 500 }
      );
    }

    // Decrement the votes count for the problem
    const { data, error } = await supabase.rpc("decrement_problem_votes", {
      problem_id,
    });

    if (error) {
      console.error("Error decrementing votes:", error);
      return NextResponse.json(
        { error: "Failed to update vote count" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, votes: data });
  } catch (error) {
    console.error("Unexpected error in DELETE /api/problem_upvotes:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
