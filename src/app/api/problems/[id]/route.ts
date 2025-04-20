import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

// DELETE handler to remove a problem (admin only)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Extract the problem ID from the URL params and await it
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Problem ID is required" },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = await createServerClient();

    // Get the current user with authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to perform this action" },
        { status: 401 }
      );
    }

    // Check if the user is an admin using user_metadata
    const isAdmin = user.user_metadata?.role === "admin";

    // Only allow admin users to delete problems
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only admins can delete problems" },
        { status: 403 }
      );
    }
    const adminSupabase = await createAdminClient();

    // Delete the problem
    const { error: deleteError } = await adminSupabase
      .from("problems")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting problem:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete problem" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Problem deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error in DELETE /api/problems/[id]:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// For upvoting a problem - moved from the main problems route
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Extract the problem ID from the URL params and await it
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Problem ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Get the current user with authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to upvote" },
        { status: 401 }
      );
    }

    // First try to insert into problem_upvotes
    const { error: upvoteError } = await supabase
      .from("problem_upvotes")
      .insert({
        user_id: user.id,
        problem_id: id,
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
    console.error("Unexpected error in PATCH /api/problems/[id]:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
