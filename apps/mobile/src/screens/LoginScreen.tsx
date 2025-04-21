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
} from "react-native";
import { useAuth } from "../context/AuthProvider";

type LoginScreenProps = {
  navigation: any;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // Use the Auth context
  const { signIn, signUp } = useAuth();

  const handleAuth = async () => {
    // Basic validation
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (isSignUp) {
        // Sign up
        const { error: signUpError, data } = await signUp(email, password);

        if (signUpError) throw signUpError;

        if (data?.user) {
          Alert.alert(
            "Sign Up Successful",
            "Please check your email to confirm your account before logging in.",
            [{ text: "OK", onPress: () => setIsSignUp(false) }]
          );
        }
      } else {
        // Login
        const { error: signInError } = await signIn(email, password);

        if (signInError) throw signInError;

        // AuthProvider will automatically update the navigation
        // No manual navigation needed here
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      setError(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
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

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
            <Text style={styles.authButtonText}>
              {isSignUp ? "Sign Up" : "Login"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
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
});
