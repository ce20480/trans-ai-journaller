import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useAuthStore, useAuthUser } from "../store/authStore";
import supabase from "../supabaseClient";

type Note = {
  id: string;
  created_at: string;
  title: string;
  content: string;
  user_id: string;
};

export default function NotesScreen({ navigation }: { navigation: any }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Get user from auth store
  const user = useAuthUser();
  const { signOut } = useAuthStore();

  useEffect(() => {
    if (!user) {
      console.error("No user found in Notes screen");
      return;
    }

    console.log("[NotesScreen] Fetching notes for user:", user.id);
    fetchNotes();
  }, [user]);

  const fetchNotes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("[NotesScreen] Querying Supabase for notes");
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user?.id || "")
        .order("created_at", { ascending: false });

      if (error) throw error;

      console.log(`[NotesScreen] Found ${data?.length || 0} notes`);
      setNotes(data || []);
    } catch (err: any) {
      console.error("Error fetching notes:", err.message);
      setError("Failed to load notes");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = async () => {
    try {
      await signOut();
      // The auth store will handle navigation via the auth state
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#facc15" />
        <Text style={styles.loadingText}>Loading notes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Journal</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search notes..."
        placeholderTextColor="#888"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      {filteredNotes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No notes found</Text>
          <TouchableOpacity
            style={styles.createFirstButton}
            onPress={() => navigation.navigate("Recording")}
          >
            <Text style={styles.createFirstButtonText}>
              Record your first note
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={filteredNotes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.noteCard}
                onPress={() => {
                  // For now, just show the content since NoteDetail isn't set up
                  Alert.alert(item.title, item.content);
                }}
              >
                <Text style={styles.noteTitle}>{item.title}</Text>
                <Text style={styles.noteDate}>
                  {formatDate(item.created_at)}
                </Text>
                <Text style={styles.noteContent} numberOfLines={2}>
                  {item.content}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.notesList}
          />

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("Recording")}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  headerTitle: {
    color: "#facc15",
    fontSize: 24,
    fontWeight: "bold",
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#333",
    borderRadius: 20,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 14,
  },
  notesList: {
    padding: 15,
  },
  noteCard: {
    backgroundColor: "#1c1c1c",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: "#facc15",
  },
  noteTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  noteDate: {
    color: "#888",
    fontSize: 12,
    marginBottom: 8,
  },
  noteContent: {
    color: "#b3b3b3",
    fontSize: 14,
  },
  addButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#facc15",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButtonText: {
    fontSize: 32,
    color: "black",
    fontWeight: "bold",
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
  errorText: {
    color: "#ef4444",
    margin: 15,
    textAlign: "center",
  },
  searchInput: {
    backgroundColor: "#262626",
    margin: 15,
    borderRadius: 8,
    padding: 12,
    color: "white",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "#888",
    fontSize: 16,
    marginBottom: 20,
  },
  createFirstButton: {
    backgroundColor: "#facc15",
    padding: 15,
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: "black",
    fontWeight: "bold",
  },
});
