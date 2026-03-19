import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("gmail_access_token")?.value;

  if (accessToken) return accessToken;

  // Try refresh
  const refreshToken = cookieStore.get("gmail_refresh_token")?.value;
  if (!refreshToken) return null;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();
  if (!data.access_token) return null;

  cookieStore.set("gmail_access_token", data.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: data.expires_in || 3600,
    path: "/",
  });

  return data.access_token;
}

export async function GET() {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ error: "not_connected" }, { status: 401 });
  }

  try {
    // Search for emails from USIG with attachments
    const query = encodeURIComponent("from:service@us-installations.com has:attachment filename:pdf");
    const listRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${query}&maxResults=20`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const listData = await listRes.json();

    if (!listData.messages || listData.messages.length === 0) {
      return NextResponse.json({ emails: [] });
    }

    // Fetch details for each message
    const emails = await Promise.all(
      listData.messages.slice(0, 20).map(async (msg: { id: string }) => {
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=Date&metadataHeaders=From`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const msgData = await msgRes.json();

        const headers = msgData.payload?.headers || [];
        const subject = headers.find((h: { name: string }) => h.name === "Subject")?.value || "Sem assunto";
        const date = headers.find((h: { name: string }) => h.name === "Date")?.value || "";
        const from = headers.find((h: { name: string }) => h.name === "From")?.value || "";

        // Get attachment info
        const parts = msgData.payload?.parts || [];
        const attachments = parts
          .filter((p: { filename: string; mimeType: string }) => p.filename && p.mimeType === "application/pdf")
          .map((p: { filename: string; body: { attachmentId: string; size: number } }) => ({
            filename: p.filename,
            attachmentId: p.body?.attachmentId,
            size: p.body?.size || 0,
          }));

        return {
          id: msg.id,
          subject,
          date: new Date(date).toISOString(),
          from,
          attachments,
        };
      })
    );

    return NextResponse.json({ emails });
  } catch (err) {
    console.error("Gmail API error:", err);
    return NextResponse.json({ error: "gmail_error" }, { status: 500 });
  }
}
