import { google, sheets_v4 } from "googleapis";

// Define the structure of the service account credentials
interface ServiceAccountCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
}

// Helper function for exponential backoff retry
async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function writeToGoogleSheets(
  summaryPoints: string[],
  maxRetries = 3
): Promise<sheets_v4.Schema$AppendValuesResponse> {
  // Validate input first
  if (!Array.isArray(summaryPoints) || summaryPoints.length === 0) {
    throw new Error("Cannot write empty summary points to Google Sheets");
  }

  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      // Check for required environment variables
      const base64EncodedServiceAccount =
        process.env.BASE64_ENCODED_SERVICE_ACCOUNT;
      const spreadsheetId = process.env.SPREADSHEET_ID;

      if (!base64EncodedServiceAccount) {
        throw new Error(
          "BASE64_ENCODED_SERVICE_ACCOUNT not found in environment variables"
        );
      }
      if (!spreadsheetId) {
        throw new Error("SPREADSHEET_ID not found in environment variables");
      }

      // Decode and parse the service account credentials
      let credentials: ServiceAccountCredentials;
      try {
        const decodedServiceAccount = Buffer.from(
          base64EncodedServiceAccount,
          "base64"
        ).toString("utf-8");
        credentials = JSON.parse(decodedServiceAccount);
      } catch (parseError) {
        console.error(
          "Failed to decode/parse service account JSON:",
          parseError
        );
        throw new Error("Invalid BASE64_ENCODED_SERVICE_ACCOUNT format");
      }

      // Validate essential credential properties
      if (!credentials.client_email || !credentials.private_key) {
        throw new Error(
          "Parsed service account credentials missing client_email or private_key"
        );
      }

      // Set up Google Sheets client for writing
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: credentials.client_email,
          private_key: credentials.private_key,
        },
        scopes: ["https://www.googleapis.com/auth/spreadsheets"], // Write scope needed for append
      });

      const sheets = google.sheets({ version: "v4", auth });

      // --- BEGIN: Log data before sending ---
      console.log("Data received by writeToGoogleSheets:", summaryPoints);
      if (!Array.isArray(summaryPoints) || summaryPoints.length === 0) {
        console.warn(
          "Attempting to write empty or invalid summaryPoints array to Google Sheets."
        );
        // Optionally, throw an error or return early if empty is not expected
        // throw new Error("Cannot write empty summary points.");
      }
      // --- END: Log data before sending ---

      // Prepare data for insertion
      const timestamp = new Date().toISOString();
      const values = summaryPoints.map((point) => [timestamp, point]);
      console.log(
        "Data prepared for Google Sheets append:",
        JSON.stringify(values)
      ); // Log the final array

      // Add data to the sheet
      console.log(
        `Attempt ${attempts + 1}: Appending data to Google Sheets...`
      );
      const response = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "'Idea Sheet'!A:B", // Use single quotes for sheet names with spaces
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
          values,
        },
      });

      if (!response.data) {
        throw new Error("No data returned from Google Sheets API after append");
      }

      console.log(
        "Data successfully appended to Google Sheets:",
        response.data
      );
      return response.data;
    } catch (error: unknown) {
      attempts++;
      console.error(
        `Google Sheets error (Attempt ${attempts}/${maxRetries}):`,
        error
      );

      // Check if it's a potentially retryable error (e.g., 5xx or 429)
      // Note: Error structure might vary depending on the library/API
      const isRetryable =
        error instanceof Error &&
        (error.message.includes("502") ||
          error.message.includes("503") ||
          error.message.includes("429")); // Add other codes if needed

      if (isRetryable && attempts < maxRetries) {
        const delayTime = Math.pow(2, attempts) * 1000; // Exponential backoff
        console.log(`Retrying Google Sheets append in ${delayTime / 1000}s...`);
        await delay(delayTime);
      } else {
        // If not retryable or max retries reached, throw a final error
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unknown Google Sheets error";
        throw new Error(
          `Failed to write to Google Sheets after ${attempts} attempts: ${errorMessage}`
        );
      }
    }
  }
  // Should not be reached if maxRetries > 0, but satisfies TypeScript
  throw new Error("Failed to write to Google Sheets after max retries.");
}
