export interface IdentityData {
  email: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  sub: string;
}

export interface Identity {
  identity_id: string;
  id: string;
  user_id: string;
  identity_data: IdentityData;
  provider: string;
  last_sign_in_at: string;
  created_at: string;
  updated_at: string;
  email: string | null;
}

export interface AppMetadata {
  provider: string;
  providers: string[];
}

export interface UserMetadata {
  email: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  sub: string;
}

export interface User {
  id: string;
  aud: string;
  role?: string;
  email: string | null;
  email_confirmed_at: string;
  phone: string;
  confirmed_at: string;
  last_sign_in_at: string;
  app_metadata: AppMetadata;
  user_metadata: UserMetadata;
  identities: Identity[];
  created_at: string;
  updated_at: string;
  is_anonymous: boolean;
}

export interface DataWrapper {
  user: User;
}

export interface SupabaseUserApiResponse {
  data: DataWrapper;
  error: string | null;
}
