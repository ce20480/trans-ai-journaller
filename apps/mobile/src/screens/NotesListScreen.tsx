import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import { Note } from "../types";
import api from "../services/api";
import { useAuth } from "../context/AuthProvider";

// Import shared UI components
import { Card } from "ui";

type NotesListScreenProps = {
  navigation: any;
};

export default function NotesListScreen({ navigation }: NotesListScreenProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user, session and signOut from Auth context
  const { user, session, loading: authLoading, signOut } = useAuth();

  // Add sign out button to header
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <MaterialIcons name="logout" size={24} color="#facc15" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Watch for auth state and fetch notes when the user is available
  useEffect(() => {
    if (!authLoading && user && session) {
      console.log("[Notes] Auth state ready, user available:", user.id);
      fetchNotes();
    } else if (!authLoading && !user) {
      console.log("[Notes] Auth loaded but no user available");
    }
  }, [user, authLoading, session]);

  // Only add the focus listener if we don't reload on auth state changes
  useEffect(() => {
    // Reload notes when the screen is focused (if user is available)
    const unsubscribe = navigation.addListener("focus", () => {
      if (user) {
        console.log("[Notes] Screen focused, refreshing notes");
        fetchNotes();
      }
    });

    // Clean up the listener on unmount
    return unsubscribe;
  }, [navigation, user]);

  // Sign out handler
  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            // Sign out using the auth context
            await signOut();
            console.log("Successfully signed out");

            // AuthProvider will automatically redirect to login
          } catch (error) {
            console.error("Sign out error:", error);
            Alert.alert("Error", "Failed to sign out. Please try again.");
          }
        },
      },
    ]);
  };

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        console.warn("[Notes] No authenticated user found when fetching notes");
        return;
      }

      // Get the JWT token from the session
      const jwtToken = session?.access_token || null;

      // Log token information for debugging
      console.log(
        `[Notes] Session token available: ${jwtToken ? "yes" : "no"}`
      );
      if (jwtToken) {
        // Log first and last few characters for debugging (don't log the entire token)
        const tokenStart = jwtToken.substring(0, 10);
        const tokenEnd = jwtToken.substring(jwtToken.length - 10);
        console.log(`[Notes] Token format check: ${tokenStart}...${tokenEnd}`);
      }

      console.log(`[Notes] Fetching notes for user: ${user.id}`);

      try {
        // Fetch notes using JWT token authentication - pass the token directly
        const notes = await api.getNotes(user.id, jwtToken);
        setNotes(notes);
        console.log(
          `[Notes] Fetched ${notes.length} notes with JWT authentication`
        );
      } catch (err) {
        console.error("[Notes] API error fetching notes:", err);
        // Fallback to mock data in development
        console.warn("[Notes] Using mock data due to API error");
        setNotes(MOCK_NOTES);
      }
    } catch (err) {
      console.error("[Notes] Failed to fetch notes:", err);
      setError("Failed to load notes. Please try again.");
      // Fallback to mock data
      setNotes(MOCK_NOTES);
    } finally {
      setLoading(false);
    }
  };

  // Format seconds into MM:SS
  function formatDuration(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  // Get emoji for tag
  function getTagEmoji(tag: string | null): string {
    if (!tag) return "🏷️"; // Return default emoji if tag is null or empty

    const lowerTag = tag.toLowerCase();
    if (lowerTag.includes("idea") || lowerTag.includes("concept")) return "💡";
    if (lowerTag.includes("tool") || lowerTag.includes("product")) return "🧰";
    if (lowerTag.includes("growth") || lowerTag.includes("market")) return "📈";
    if (lowerTag.includes("content") || lowerTag.includes("video")) return "📹";
    if (lowerTag.includes("design") || lowerTag.includes("ui")) return "🎨";
    if (lowerTag.includes("code") || lowerTag.includes("dev")) return "💻";
    if (lowerTag.includes("meeting") || lowerTag.includes("call")) return "📞";
    return "🏷️"; // Default tag emoji
  }

  function renderNoteItem({ item }: { item: Note }) {
    return (
      <TouchableOpacity
        style={styles.noteCard}
        onPress={() => {
          // In a real app, navigate to note details screen
          // navigation.navigate("NoteDetail", { noteId: item.id });

          // For now, just show alert with summary
          Alert.alert(item.title, item.summary, [
            { text: "OK", style: "default" },
          ]);
        }}
      >
        <View style={styles.noteHeader}>
          <Text style={styles.noteTitle}>{item.title}</Text>
          <Text style={styles.noteDate}>
            {format(new Date(item.created_at), "MMM d, yyyy")}
          </Text>
        </View>

        <View style={styles.noteBody}>
          <Text style={styles.noteText} numberOfLines={2}>
            {item.content}
          </Text>
        </View>

        <View style={styles.noteFooter}>
          <View style={styles.tagContainer}>
            <Text style={styles.tagText}>
              {getTagEmoji(item.tag)} {item.tag || "Untagged"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Loading states for both auth and content
  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#facc15" />
        <Text style={styles.loadingText}>Loading authentication...</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#facc15" />
        <Text style={styles.loadingText}>Loading notes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchNotes}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // If somehow we get here without a user, show a more helpful error
  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="account-circle" size={48} color="#ef4444" />
        <Text style={styles.errorText}>Session error: No user found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleSignOut}>
          <Text style={styles.retryButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        renderItem={renderNoteItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notes yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the button below to record your first note
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("Recording")}
      >
        <MaterialIcons name="add" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
}

// Mock data for development
const MOCK_NOTES: Note[] = [
  {
    id: "1",
    title: "Journal Entry #1",
    content:
      "Today I had my first appointment with the endocrinologist. We discussed various options for hormone therapy and what to expect in the coming months. The doctor was very understanding and answered all my questions patiently.",
    summary: "First appointment with endocrinologist to discuss HRT options.",
    tag: "Healthcare",
    created_at: "2023-07-15T10:30:00Z",
    user_id: "demo-user-id",
  },
  {
    id: "2",
    title: "Journal Entry #2",
    content:
      "Started a new medication today. Feeling hopeful about the changes that might happen. There are some side effects that I need to watch out for, but overall I'm optimistic about this new chapter.",
    summary:
      "Started new medication with optimism despite potential side effects.",
    tag: "Medication",
    created_at: "2023-07-17T14:20:00Z",
    user_id: "demo-user-id",
  },
  {
    id: "3",
    title: "Journal Entry #3",
    content:
      "Visited my support group for the first time. Everyone was so welcoming and shared their experiences openly. It's comforting to know that I'm not alone in this journey. I plan to attend regularly.",
    summary: "First support group meeting was welcoming and validating.",
    tag: "Community",
    created_at: "2023-07-20T18:45:00Z",
    user_id: "demo-user-id",
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  list: {
    padding: 16,
  },
  noteCard: {
    backgroundColor: "#262626",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#373737",
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  noteDate: {
    fontSize: 12,
    color: "#b3b3b3",
  },
  noteBody: {
    marginBottom: 12,
  },
  noteText: {
    fontSize: 14,
    color: "#e0e0e0",
    lineHeight: 20,
  },
  noteFooter: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  tagContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#373737",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: "#facc15",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#facc15",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#b3b3b3",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  loadingText: {
    fontSize: 18,
    color: "white",
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#facc15",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
  signOutButton: {
    padding: 8,
    marginRight: 8,
  },
});
