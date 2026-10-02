import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // 303 turns the POST into a GET for the home page.
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
