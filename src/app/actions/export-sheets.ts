"use server";

import { google } from "googleapis";

export async function exportCustomersToSheets(customers: any[]) {
    try {
        const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
        const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;

        if (!clientEmail || !privateKey) {
            return { success: false, error: "Google API credentials are not configured." };
        }
        if (!spreadsheetId) {
            return { success: false, error: "GOOGLE_SHEET_ID environment variable is not set." };
        }

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: clientEmail,
                private_key: privateKey,
            },
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });
        const sheets = google.sheets({ version: "v4", auth });

        const headers = ["Name", "Phone", "Email", "Total Orders", "Lifetime Value"];
        const rows = customers.map((c) => [
            c.customer_name ?? "",
            c.customer_phone ?? "",
            c.customer_email ?? "",
            c.total_orders ?? 0,
            c.lifetime_value ?? 0,
        ]);

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: "Sheet1!A1",
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [headers, ...rows],
            },
        });

        return { success: true };
    } catch (err) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred.";
        return { success: false, error: message };
    }
}
