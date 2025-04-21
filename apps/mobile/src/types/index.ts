// User profile type
export interface UserProfile {
  id: string;
  email: string;
  subscription_status?: string;
  free_notes_count?: number;
  role?: string;
}

// Note type
export interface Note {
  id: string;
  title: string;
  content: string;
  summary: string;
  tag: string | null;
  created_at: string;
  user_id: string;
}

// Processing step type
export type ProcessingStep =
  | "recording"
  | "uploading"
  | "transcribing"
  | "analyzing"
  | "saving"
  | "idle";

// Import the navigation types from their respective files
import { PublicStackParamList } from "../navigation/PublicStack";
import { PrivateStackParamList } from "../navigation/PrivateStack";

// Export the navigation types
export type { PublicStackParamList, PrivateStackParamList };
