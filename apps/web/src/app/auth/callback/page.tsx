import ClientCallback from "../client-callback";

export default function CallbackPage() {
  // This component renders the client-side callback handler
  // The server-side component will handle standard code-based authentication
  // The client-side component will handle fragment-based authentication
  return <ClientCallback />;
}
