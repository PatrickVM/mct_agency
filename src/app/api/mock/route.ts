import { NextResponse } from "next/server";

// Mock Supabase endpoints for local development
export async function GET() {
  return NextResponse.json({
    message: "Mock Supabase endpoint for local development",
    auth: "disabled",
    storage: "local-only"
  });
}

export async function POST() {
  return NextResponse.json({ success: true });
}