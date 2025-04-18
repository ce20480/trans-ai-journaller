import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  // cookieStore.getAll().forEach(({ name, value }) => {
  //   const decodedValue = value.startsWith("base64-")
  //     ? Buffer.from(value.slice(7), "base64").toString("utf-8")
  //     : value;
  //   cookieStore.set(name, decodedValue);
  // });

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          try {
            return cookieStore.getAll().map(({ name, value }) => ({
              name,
              value,
            }));
          } catch (err) {
            console.error("Error getting cookies:", err);
            return []; // Return empty array on error
          }
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              try {
                cookieStore.set(name, value, options);
              } catch (err) {
                console.error(`Error setting cookie ${name}:`, err);
              }
            });
          } catch (err) {
            console.error("Error in setAll cookies:", err);
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
