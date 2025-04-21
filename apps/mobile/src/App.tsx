/**
 * ---------------------------------------------------------------
 *  App.tsx — Mobile entry point (Expo / React Native)
 * ---------------------------------------------------------------
 *
 *  🧭 Responsibilities
 *  ‑ Mount global providers (navigation, theming, analytics, etc.)
 *  ‑ Hold top‑level auth state and decide which navigator to render
 *  ‑ Stay as thin as possible; heavy logic lives in hooks/contexts
 *
 *  ✨ Tips for new contributors
 *  ‑ If you're new to React Navigation, read the "Fundamentals" doc.
 *  ‑ Avoid creating functions inline inside JSX to prevent re‑renders.
 *  ‑ Keep screens presentational; side‑effects belong in hooks.
 */
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { View, Text, ActivityIndicator } from "react-native";

// Import providers and navigation stacks
import { AuthProvider, useAuth } from "./context/AuthProvider";
import { PublicStack } from "./navigation/PublicStack";
import { PrivateStack } from "./navigation/PrivateStack";

// ────────────────────────────────────────────────────────────────
// Navigator Switcher component - conditionally renders stacks based on auth state
// ────────────────────────────────────────────────────────────────
const NavigationSwitcher = () => {
  const { session, loading } = useAuth();

  // Show loading screen while checking auth
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#121212",
        }}
      >
        <ActivityIndicator size="large" color="#facc15" />
        <Text style={{ color: "white", marginTop: 20 }}>Loading...</Text>
      </View>
    );
  }

  // Render the appropriate stack based on authentication state
  return session ? <PrivateStack /> : <PublicStack />;
};

// ────────────────────────────────────────────────────────────────
// Root component – rendered once by Expo.
// ────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <AuthProvider>
        <NavigationSwitcher />
      </AuthProvider>
    </NavigationContainer>
  );
}
