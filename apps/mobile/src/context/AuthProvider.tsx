import React, { createContext, useState, useContext, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import supabase from "../supabaseClient";

// Define the shape of the auth context
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{
    error: Error | null;
    data?: { session: Session | null; user: User | null };
  }>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{
    error: Error | null;
    data?: { session: Session | null; user: User | null };
  }>;
  signOut: () => Promise<void>;
}

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => ({ error: new Error("Not implemented") }),
  signUp: async () => ({ error: new Error("Not implemented") }),
  signOut: async () => {},
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component that wraps the app and makes auth available
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Debug function to help trace auth state changes
  const logAuthState = (
    method: string,
    user: User | null,
    session: Session | null
  ) => {
    console.log(`[Auth Debug] ${method}: 
      User: ${user ? user.id : "null"} 
      Session: ${session ? "present" : "null"}`);
  };

  useEffect(() => {
    // Get initial session and set up auth state listener
    const initializeAuth = async () => {
      try {
        setLoading(true);
        console.log("[Auth] Starting auth initialization");

        // Get current session
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("[Auth] Session retrieval error:", error.message);
        }

        if (currentSession) {
          console.log("[Auth] Found existing session");

          // Get user details
          const {
            data: { user: currentUser },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError) {
            console.error("[Auth] User retrieval error:", userError.message);
          }

          if (currentUser) {
            console.log("[Auth] User found with session");
            setUser(currentUser);
            setSession(currentSession);
            logAuthState("initializeAuth", currentUser, currentSession);
          } else {
            console.warn("[Auth] Session exists but no user found");
          }
        } else {
          console.log("[Auth] No existing session found");
        }
      } catch (error) {
        console.error("[Auth] Error initializing auth:", error);
      } finally {
        setLoading(false);
        console.log("[Auth] Auth initialization complete");
      }
    };

    // Initialize auth
    initializeAuth();

    // Set up listener for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log(`[Auth] State changed: ${event}`);

        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          // Get the latest user when signed in or token refreshed
          try {
            const {
              data: { user: currentUser },
            } = await supabase.auth.getUser();
            console.log(
              `[Auth] After ${event}, user:`,
              currentUser?.id || "null"
            );
            setUser(currentUser);
            setSession(newSession);
            logAuthState(event, currentUser, newSession);
          } catch (error) {
            console.error(`[Auth] Error getting user after ${event}:`, error);
          }
        } else if (event === "SIGNED_OUT") {
          console.log("[Auth] User signed out");
          setUser(null);
          setSession(null);
        } else {
          // For other events, update the session
          setSession(newSession);
          if (newSession?.user) {
            setUser(newSession.user);
          }
        }

        setLoading(false);
      }
    );

    // Clean up subscription on unmount
    return () => {
      console.log("[Auth] Cleaning up auth listener");
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      console.log("[Auth] Attempting sign in for:", email);
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("[Auth] Sign in error:", error.message);
        return { error };
      }

      console.log("[Auth] Sign in successful, user:", data.user?.id || "null");
      return { data, error: null };
    } catch (error) {
      console.error("[Auth] Sign in exception:", error);
      return {
        error:
          error instanceof Error
            ? error
            : new Error("Unknown error during sign in"),
      };
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    try {
      console.log("[Auth] Attempting sign up for:", email);
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error("[Auth] Sign up error:", error.message);
        return { error };
      }

      console.log("[Auth] Sign up successful, user:", data.user?.id || "null");
      return { data, error: null };
    } catch (error) {
      console.error("[Auth] Sign up exception:", error);
      return {
        error:
          error instanceof Error
            ? error
            : new Error("Unknown error during sign up"),
      };
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      console.log("[Auth] Attempting sign out");
      setLoading(true);

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("[Auth] Sign out error:", error.message);
        throw error;
      }

      console.log("[Auth] Sign out successful");
    } catch (error) {
      console.error("[Auth] Sign out exception:", error);
    } finally {
      setLoading(false);
    }
  };

  // The value that will be given to the context
  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
