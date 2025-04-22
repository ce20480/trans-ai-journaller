"use client";

import Script from "next/script";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Define the credential response type
interface CredentialResponse {
  credential: string;
  select_by: string;
}

// Define the notification interface for Google One Tap
interface GoogleNotification {
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  getNotDisplayedReason: () => string;
  getSkippedReason: () => string;
}

// Define Google global types to avoid TypeScript errors
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: GoogleOneTapConfig) => void;
          prompt: (
            callback?: (notification: GoogleNotification) => void
          ) => void;
          renderButton: (parent: HTMLElement, options: object) => void;
        };
      };
    };
  }
}

// Define the Google One Tap configuration interface
interface GoogleOneTapConfig {
  client_id: string;
  callback: (response: CredentialResponse) => void;
  nonce: string;
  use_fedcm_for_prompt: boolean;
  prompt_parent_id?: string;
}

const GoogleOneTap = ({ redirect = "/dashboard" }: { redirect?: string }) => {
  const supabase = createClient();
  const router = useRouter();

  // Generate nonce to use for google id token sign-in
  const generateNonce = async (): Promise<string[]> => {
    const nonce = btoa(
      String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))
    );
    const encoder = new TextEncoder();
    const encodedNonce = encoder.encode(nonce);
    const hashBuffer = await crypto.subtle.digest("SHA-256", encodedNonce);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedNonce = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return [nonce, hashedNonce];
  };

  useEffect(() => {
    if (!window.google || !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      console.log("Google client ID not available or Google not loaded yet");
      return;
    }

    const initializeGoogleOneTap = async () => {
      console.log("Initializing Google One Tap");

      // Check if there's already an existing session before initializing the one-tap UI
      const { data: sessionData, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session", error);
      }

      if (sessionData.session) {
        console.log("User already has a session, not showing One Tap");
        return;
      }

      const [nonce, hashedNonce] = await generateNonce();
      console.log("Google One Tap nonce generated");

      try {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          callback: async (response: CredentialResponse) => {
            try {
              console.log("Google One Tap response received");

              // Send id token returned in response.credential to supabase
              const { error: signInError } =
                await supabase.auth.signInWithIdToken({
                  provider: "google",
                  token: response.credential,
                  nonce,
                });

              if (signInError) {
                console.error(
                  "Error logging in with Google One Tap",
                  signInError
                );
                return;
              }

              console.log("Successfully logged in with Google One Tap");

              // Redirect to the specified page or dashboard
              router.push(redirect);
            } catch (error) {
              console.error("Error processing Google One Tap login", error);
            }
          },
          nonce: hashedNonce,
          // With Chrome's removal of third-party cookies, we need to use FedCM instead
          use_fedcm_for_prompt: true,
          prompt_parent_id: "oneTap", // ID of the div where the One Tap UI will appear
        });

        // Display the One Tap UI
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log(
              "One Tap not displayed or skipped:",
              notification.getNotDisplayedReason() ||
                notification.getSkippedReason()
            );
          }
        });
      } catch (error) {
        console.error("Error initializing Google One Tap", error);
      }
    };

    // Initialize One Tap once the script is loaded
    initializeGoogleOneTap();

    // Clean up
    return () => {
      // No specific cleanup required
    };
  }, [router, redirect, supabase.auth]);

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => console.log("Google One Tap script loaded")}
      />
      <div id="oneTap" className="fixed top-12 right-4 z-[100]" />
    </>
  );
};

export default GoogleOneTap;
