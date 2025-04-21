import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import {
  useAuthStore,
  useAuthStatus,
  useAuthError,
  useIsLoading,
} from "../store/authStore";

type LoginScreenProps = {
  navigation: any;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  // Get auth state and actions from the store
  const status = useAuthStatus();
  const error = useAuthError();
  const isLoading = useIsLoading();
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    processGoogleRedirect,
  } = useAuthStore();

  // Set up deep link handler
  useEffect(() => {
    // Handle deep linking from Google Auth redirect
    const handleDeepLink = async (event: { url: string }) => {
      // Only log the URL path without tokens for security
      console.log("Deep link received:", event.url.split("?")[0]);

      try {
        // Check if the URL contains an access token in the fragment
        if (event.url.includes("#access_token=")) {
          console.log("Auth access token received in URL fragment");

          // For fragment URLs, we need to manually parse them
          // Extract the hash fragment
          const hashFragment = event.url.split("#")[1];
          if (!hashFragment) {
            throw new Error("Invalid auth response");
          }

          // Parse the fragment string into key-value pairs
          const params = new URLSearchParams(hashFragment);
          const accessToken = params.get("access_token");
          const refreshToken = params.get("refresh_token");

          if (!accessToken) {
            throw new Error("No access token found");
          }

          console.log("Access token present, processing...");

          // Process the redirect with our new state machine
          await processGoogleRedirect({
            access_token: accessToken,
            refresh_token: refreshToken || undefined,
          });

          // Force status back to authenticated if needed
          setTimeout(() => {
            const currentStatus = useAuthStore.getState().status;
            console.log("[LoginScreen] Auth state after OAuth:", currentStatus);

            // If still in loading, force it to authenticated
            if (currentStatus === "loading" || currentStatus === "idle") {
              console.log("[LoginScreen] Forcing auth state to authenticated");
              useAuthStore.setState({ status: "authenticated" });
            }
          }, 1000);
        } else if (event.url.includes("?code=")) {
          // Handle code-based auth flow (less common with Supabase)
          console.log(
            "Code-based auth flow detected - this is uncommon with Supabase OAuth"
          );
        }
      } catch (error) {
        console.error("Deep link error:", error);
      }
    };

    // Add event listener for deep links
    Linking.addEventListener("url", handleDeepLink);

    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log("App opened with URL:", url.split("?")[0]);
        handleDeepLink({ url });
      }
    });

    return () => {
      // Clean up listener if needed (depends on React Native version)
    };
  }, [processGoogleRedirect]);

  const handleAuth = async () => {
    // Basic validation
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    try {
      if (isSignUp) {
        // Sign up
        await signUpWithEmail(email, password);

        // If we get here without an error and status isn't authenticated,
        // it likely means email confirmation is required
        if (status === "unauthenticated") {
          Alert.alert(
            "Sign Up Successful",
            "Please check your email to confirm your account before logging in.",
            [{ text: "OK", onPress: () => setIsSignUp(false) }]
          );
        }
      } else {
        // Login
        await signInWithEmail(email, password);
      }
    } catch (err) {
      // Error handling is done in the store, this is just for unexpected errors
      console.error("Unexpected auth error:", err);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // Start Google sign-in process
      const result = await signInWithGoogle();

      // Once we have the URL, we need to open it in the browser
      // At this point, the auth process will continue in the browser,
      // so we should not show the loading state until we get back to the app
      if (result?.url) {
        // Open browser for Google OAuth flow
        await Linking.openURL(result.url);
        // The loading state will be set again when we return to the app
        // via the deep link handler in useEffect
      }
    } catch (err) {
      // Error handling is done in the store, this is just for unexpected errors
      console.error("Unexpected Google sign-in error:", err);
    }
  };

  // Use status to determine loading, not a separate isLoading flag
  const showLoading = status === "loading";

  if (showLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#facc15" />
        <Text style={styles.loadingText}>
          {isSignUp ? "Creating account..." : "Logging in..."}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Trans AI Journaller</Text>
        <Text style={styles.subtitle}>Your personal AI-powered journal</Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              textContentType="emailAddress"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="password"
            />
          </View>

          {error && <Text style={styles.errorText}>{error.message}</Text>}

          <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
            <Text style={styles.authButtonText}>
              {isSignUp ? "Sign Up" : "Login"}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
          >
            <MaterialIcons name="email" size={20} color="#fff" />
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsSignUp(!isSignUp)}
          >
            <Text style={styles.switchButtonText}>
              {isSignUp
                ? "Already have an account? Login"
                : "Don't have an account? Sign up"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  innerContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#facc15",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#b3b3b3",
    textAlign: "center",
    marginBottom: 40,
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: "#b3b3b3",
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#262626",
    borderWidth: 1,
    borderColor: "#373737",
    borderRadius: 8,
    padding: 12,
    color: "white",
    fontSize: 16,
  },
  errorText: {
    color: "#ef4444",
    marginBottom: 15,
  },
  authButton: {
    backgroundColor: "#facc15",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  authButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
  switchButton: {
    marginTop: 20,
    alignItems: "center",
  },
  switchButtonText: {
    color: "#b3b3b3",
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  loadingText: {
    color: "white",
    marginTop: 10,
    fontSize: 16,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#373737",
  },
  dividerText: {
    color: "#b3b3b3",
    paddingHorizontal: 10,
    fontSize: 14,
  },
  googleButton: {
    flexDirection: "row",
    backgroundColor: "#4285F4",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  googleButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});
