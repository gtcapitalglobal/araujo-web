import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("gmail_access_token")?.value;
  if (accessToken) return accessToken;

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

export async function POST(request: Request) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ error: "not_connected" }, { status: 401 });
  }

  const { messageId, attachmentId, filename } = await request.json();

  if (!messageId || !attachmentId || !filename) {
    return NextResponse.json({ error: "missing_params" }, { status: 400 });
  }

  try {
    // Download attachment from Gmail
    const attRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const attData = await attRes.json();

    if (!attData.data) {
      return NextResponse.json({ error: "attachment_not_found" }, { status: 404 });
    }

    // Decode base64url to buffer
    const base64 = attData.data.replace(/-/g, "+").replace(/_/g, "/");
    const buffer = Buffer.from(base64, "base64");

    // Upload to Supabase Storage
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `install-packages/${Date.now()}_${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(path, buffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: "upload_failed", details: uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path,
      filename: safeName,
    });
  } catch (err) {
    console.error("Download error:", err);
    return NextResponse.json({ error: "download_failed" }, { status: 500 });
  }
}
