import { google } from "googleapis";

export async function writeToGoogleSheets(
  summaryPoints: string[]
): Promise<any> {
  try {
    // Check for required environment variables
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const spreadsheetId = process.env.SPREADSHEET_ID;

    if (!clientEmail || !privateKey || !spreadsheetId) {
      throw new Error(
        "Google Sheets credentials not found in environment variables"
      );
    }

    // Set up Google Sheets client
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // Prepare data for insertion
    const timestamp = new Date().toISOString();
    const values = summaryPoints.map((point) => [timestamp, point]);

    // Add data to the sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A2:A39", // Adjust based on your sheet structure
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Google Sheets error:", error);
    throw new Error(`Failed to write to Google Sheets: ${error.message}`);
  }
}
