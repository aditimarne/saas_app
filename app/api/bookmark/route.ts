import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const supabase = createSupabaseClient();
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { companionId, path } = body as { companionId?: string; path?: string };

    if (!companionId) return NextResponse.json({ error: "companionId required" }, { status: 400 });

    const { error } = await supabase
      .from("bookmarks")
      .upsert({ user_id: userId, companion_id: companionId }, { onConflict: "user_id,companion_id" });

    if (error) {
      console.error("Supabase upsert bookmark error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (path) revalidatePath(path);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/bookmark error:", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
