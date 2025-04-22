import { create } from "zustand";
import { Session, User } from "@supabase/supabase-js";
import supabase from "../supabaseClient";
import { useEffect } from "react";
import React from "react";
import { createContext, useContext } from "react";

// Auth state types
export type AuthStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "error";

// Define the auth state interface
interface AuthState {
  status: AuthStatus;
  user: User | null;
  session: Session | null;
  error: Error | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetError: () => void;
  initialize: () => Promise<void>;

  // Additional auth methods
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<{ url?: string } | undefined>;
  processGoogleRedirect: (params: {
    access_token: string;
    refresh_token?: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
}

// Create the auth store
export const useAuthStore = create<AuthState>((set, get) => ({
  status: "idle",
  user: null,
  session: null,
  error: null,

  initialize: async () => {
    set({ status: "loading" });

    // Safety timeout to ensure we don't get stuck in loading state
    const safetyTimeout = setTimeout(() => {
      const currentStatus = useAuthStore.getState().status;
      if (currentStatus === "loading") {
        console.warn(
          "[Auth] Safety timeout triggered - forcing unauthenticated state"
        );
        set({
          status: "unauthenticated",
          user: null,
          session: null,
          error: null,
        });
      }
    }, 5000); // 5 second safety

    try {
      console.log("[Auth] Initializing auth state");
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("[Auth] Session error:", error.message);
        throw error;
      }

      if (data.session) {
        console.log("[Auth] Found existing session");
        set({
          status: "authenticated",
          user: data.session.user,
          session: data.session,
          error: null,
        });
      } else {
        console.log("[Auth] No session found, setting unauthenticated");
        set({
          status: "unauthenticated",
          user: null,
          session: null,
          error: null,
        });
      }
    } catch (error) {
      console.error("[Auth] Initialize error:", error);
      set({
        status: "unauthenticated", // Change to unauthenticated instead of error
        user: null,
        session: null,
        error: null, // Don't set error state on initialization failures
      });
    } finally {
      // Clear the safety timeout since we've completed initialization
      clearTimeout(safetyTimeout);
    }
  },

  login: async (email, password) => {
    set({ status: "loading", error: null });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      set({
        status: "authenticated",
        user: data.user,
        session: data.session,
        error: null,
      });
    } catch (error) {
      set({
        status: "error",
        error: error as Error,
      });
    }
  },

  register: async (email, password) => {
    set({ status: "loading", error: null });

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        set({
          status: "authenticated",
          user: data.user,
          session: data.session,
          error: null,
        });
      } else {
        // Email confirmation required
        set({
          status: "unauthenticated",
          error: null,
        });
      }
    } catch (error) {
      set({
        status: "error",
        error: error as Error,
      });
    }
  },

  logout: async () => {
    set({ status: "loading", error: null });

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      set({
        status: "unauthenticated",
        user: null,
        session: null,
        error: null,
      });
    } catch (error) {
      set({
        status: "error",
        error: error as Error,
      });
    }
  },

  resetError: () => {
    set({ error: null });
  },

  // Alias for login - used by components that expect signInWithEmail
  signInWithEmail: async (email, password) => {
    return get().login(email, password);
  },

  // Alias for register - used by components that expect signUpWithEmail
  signUpWithEmail: async (email, password) => {
    return get().register(email, password);
  },

  // Alias for logout - used by components that expect signOut
  signOut: async () => {
    return get().logout();
  },

  // Google OAuth authentication
  signInWithGoogle: async () => {
    set({ status: "loading", error: null });

    try {
      // For development with Expo, use the Expo development URL
      // This must be added to the allowed redirect URLs in Supabase Dashboard
      // const redirectTo = "com.t2a.journaller://auth/callback";
      // Go to Authentication > URL Configuration
      const redirectTo = "exp://192.168.0.133:8081/--/auth/callback";

      console.log("[Auth] Starting Google OAuth with redirect:", redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: true, // Keep true for mobile
          scopes: "email profile",
        },
      });

      if (error) {
        console.error("[Auth] OAuth error:", error.message);
        throw error;
      }

      if (!data.url) {
        throw new Error("No OAuth URL returned from Supabase");
      }

      console.log("[Auth] OAuth URL generated:", data.url.split("?")[0]);
      return data;
    } catch (error) {
      console.error("[Auth] Google sign-in error:", error);
      set({
        status: "error",
        error: error as Error,
      });
      return undefined;
    }
  },

  // Process OAuth redirect with token
  processGoogleRedirect: async (params) => {
    set({ status: "loading", error: null });

    try {
      console.log("[Auth] Processing OAuth redirect");
      const { data, error } = await supabase.auth.setSession({
        access_token: params.access_token,
        refresh_token: params.refresh_token || "",
      });

      if (error) {
        console.error("[Auth] Set session error:", error.message);
        throw error;
      }

      console.log("[Auth] Session established successfully");
      set({
        status: "authenticated",
        user: data.user,
        session: data.session,
        error: null,
      });
    } catch (error) {
      console.error("[Auth] Process redirect error:", error);
      set({
        status: "error",
        error: error as Error,
      });
    }
  },
}));

// Helper hooks
export const useAuthStatus = () => useAuthStore((state) => state.status);
export const useUser = () => useAuthStore((state) => state.user);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.status === "authenticated");
export const useIsLoading = () =>
  useAuthStore(
    (state) => state.status === "loading" || state.status === "idle"
  );
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useIsInitializing = () =>
  useAuthStore(
    (state) => state.status === "idle" || state.status === "loading"
  );

// Setup auth listener function
export const setupAuthListener = () => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" && session) {
      useAuthStore.setState({
        status: "authenticated",
        user: session.user,
        session: session,
        error: null,
      });
    } else if (event === "SIGNED_OUT") {
      useAuthStore.setState({
        status: "unauthenticated",
        user: null,
        session: null,
        error: null,
      });
    }
  });

  return () => {
    subscription.unsubscribe();
  };
};

// Create a context for any additional auth values we might need (if any component still relies on it)
interface AuthContextValue {
  isInitializing: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  isInitializing: true,
});

export const useAuth = () => useContext(AuthContext);

// Main AuthProvider component - this is the only one we should use
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const status = useAuthStatus();
  const initialize = useAuthStore((state) => state.initialize);

  // Initialize auth on mount
  useEffect(() => {
    console.log("[AuthProvider] Setting up auth");

    // Initialize auth session
    initialize();

    // Setup auth listener for changes
    const cleanup = setupAuthListener();

    // Return cleanup function
    return () => {
      console.log("[AuthProvider] Cleaning up auth");
      cleanup();
    };
  }, []); // No dependencies to avoid re-initialization

  // Determine if we're still initializing
  const isInitializing = status === "idle" || status === "loading";

  // Provide the minimal context needed for legacy components
  return (
    <AuthContext.Provider value={{ isInitializing }}>
      {children}
    </AuthContext.Provider>
  );
};
