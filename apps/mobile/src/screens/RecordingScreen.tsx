import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Audio } from "expo-av";
import { MaterialIcons } from "@expo/vector-icons";
import api, { setBearerToken } from "../services/api";
import { useAuthStore, useUser } from "../store/authStore";

type RecordingScreenProps = {
  navigation: any;
};

type ProcessingStep =
  | "recording"
  | "uploading"
  | "transcribing"
  | "analyzing"
  | "saving"
  | "idle";

export default function RecordingScreen({ navigation }: RecordingScreenProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<ProcessingStep>("idle");
  const [processingProgress, setProcessingProgress] = useState("");
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Get user and session from zustand store
  const user = useUser();
  const session = useAuthStore((state) => state.session);

  useEffect(() => {
    // Clean up on unmount
    return () => {
      if (timer) clearInterval(timer);
      stopRecording();
    };
  }, []);

  // Request permissions for audio recording
  async function requestPermissions() {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Failed to get audio recording permissions:", error);
      return false;
    }
  }

  async function startRecording() {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) {
      Alert.alert(
        "Permission Required",
        "You need to grant audio recording permissions to use this feature."
      );
      return;
    }

    try {
      // Configure audio session
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setCurrentStep("recording");

      // Start timer
      const intervalId = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      setTimer(intervalId);
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Error", "Failed to start recording. Please try again.");
    }
  }

  async function stopRecording() {
    if (!recording) return;

    try {
      // Stop timer
      if (timer) {
        clearInterval(timer);
        setTimer(null);
      }

      setIsRecording(false);

      // Stop recording
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      setRecording(null);

      if (uri && user) {
        // Store the URI and show confirmation instead of immediately processing
        setRecordingUri(uri);
        setShowConfirmation(true);
      } else if (!user) {
        Alert.alert(
          "Authentication Error",
          "You need to be logged in to save recordings."
        );
      }
    } catch (error) {
      console.error("Failed to stop recording:", error);
      Alert.alert("Error", "Failed to save recording. Please try again.");
    }
  }

  async function processRecording() {
    if (!recordingUri || !user) return;

    setIsProcessing(true);
    setShowConfirmation(false);

    try {
      // Get the JWT token from the session
      const jwtToken = session?.access_token;

      if (!jwtToken) throw new Error("Authentication token missing");
      // Configure our API client to send the Bearer token on all requests
      setBearerToken(jwtToken);

      // Process the recording with our API using the user ID
      setCurrentStep("uploading");
      setProcessingProgress("Uploading recording...");

      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay

      setCurrentStep("transcribing");
      setProcessingProgress("Transcribing audio...");

      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay

      setCurrentStep("analyzing");
      setProcessingProgress("Analyzing with AI...");

      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay

      setCurrentStep("saving");
      setProcessingProgress("Saving your note...");

      // Call our unified processRecording (token already set)
      const result = await api.processRecording(recordingUri);

      setIsProcessing(false);
      setRecordingDuration(0);
      setCurrentStep("idle");
      setRecordingUri(null);

      // Success! Navigate to Notes List
      Alert.alert(
        "Processing Complete",
        `Your note has been saved with tag: ${result.tag}`,
        [
          {
            text: "View Notes",
            onPress: () => navigation.navigate("Notes"),
          },
        ]
      );
    } catch (error) {
      setIsProcessing(false);
      setCurrentStep("idle");
      console.error("Failed to process recording:", error);
      Alert.alert(
        "Processing Error",
        "There was an error processing your recording. Please try again."
      );
    }
  }

  function deleteRecording() {
    setRecordingUri(null);
    setShowConfirmation(false);
    setRecordingDuration(0);
    Alert.alert("Recording Deleted", "Your recording has been discarded.");
  }

  // Format seconds into MM:SS
  function formatDuration(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  // If processing, show loading indicator with current step
  if (isProcessing) {
    return (
      <View style={styles.processingContainer}>
        <ActivityIndicator size="large" color="#facc15" />
        <Text style={styles.processingText}>
          {currentStep === "uploading" && "Uploading..."}
          {currentStep === "transcribing" && "Transcribing..."}
          {currentStep === "analyzing" && "Analyzing with AI..."}
          {currentStep === "saving" && "Saving note..."}
        </Text>
        <Text style={styles.processingSubtext}>{processingProgress}</Text>
      </View>
    );
  }

  // Show confirmation screen after recording is complete
  if (showConfirmation && recordingUri) {
    return (
      <View style={styles.container}>
        <View style={styles.recordingInfo}>
          <Text style={styles.title}>Recording Complete</Text>
          <Text style={styles.subtitle}>
            Duration: {formatDuration(recordingDuration)}
          </Text>

          <View style={styles.confirmationContainer}>
            <Text style={styles.confirmationText}>
              Would you like to save this recording or try again?
            </Text>
          </View>
        </View>

        <View style={styles.confirmationButtons}>
          <TouchableOpacity
            style={[styles.confirmButton, styles.deleteButton]}
            onPress={deleteRecording}
          >
            <MaterialIcons name="delete" size={24} color="white" />
            <Text style={styles.confirmButtonText}>Discard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.confirmButton, styles.saveButton]}
            onPress={processRecording}
          >
            <MaterialIcons name="check" size={24} color="black" />
            <Text style={[styles.confirmButtonText, { color: "black" }]}>
              Process
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.recordingInfo}>
        <Text style={styles.title}>Record a New Note</Text>
        <Text style={styles.subtitle}>
          {isRecording
            ? "Recording in progress..."
            : "Tap the microphone to start recording"}
        </Text>

        <View style={styles.timerContainer}>
          <Text
            style={[
              styles.timer,
              isRecording ? { color: "#facc15" } : { color: "white" },
            ]}
          >
            {formatDuration(recordingDuration)}
          </Text>
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.recordButton, isRecording && styles.recordingActive]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <MaterialIcons
            name={isRecording ? "stop" : "mic"}
            size={36}
            color={isRecording ? "#ef4444" : "white"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
    backgroundColor: "#121212",
  },
  recordingInfo: {
    alignItems: "center",
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#b3b3b3",
    textAlign: "center",
  },
  timerContainer: {
    marginTop: 40,
    backgroundColor: "#262626",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
  },
  timer: {
    fontSize: 48,
    fontVariant: ["tabular-nums"],
  },
  controlsContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#262626",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#facc15",
  },
  recordingActive: {
    backgroundColor: "#facc15",
  },
  processingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
    padding: 20,
  },
  processingText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginTop: 20,
    marginBottom: 10,
  },
  processingSubtext: {
    fontSize: 16,
    color: "#b3b3b3",
    textAlign: "center",
  },
  confirmationContainer: {
    marginTop: 30,
    backgroundColor: "#262626",
    padding: 20,
    borderRadius: 12,
    width: "100%",
  },
  confirmationText: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    lineHeight: 24,
  },
  confirmationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
    paddingHorizontal: 20,
    width: "100%",
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    width: "48%",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
  },
  saveButton: {
    backgroundColor: "#facc15",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginLeft: 8,
  },
});
