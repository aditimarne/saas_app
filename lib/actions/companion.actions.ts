'use server';

// import { createSupabaseClient } from "@/lib/supabaseAuth";
import { supabasePublic } from "@/lib/supabasePublic";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export const createCompanion = async (formData: CreateCompanion) => {
    const { userId: author } = await auth();
      const supabase = supabasePublic;


    const { data, error } = await supabase
        .from('companions')
        .insert({...formData, author })
        .select();

    if(error || !data) throw new Error(error?.message || 'Failed to create a companion');

    return data[0];
}

export const getAllCompanions = async ({ limit = 10, page = 1, subject, topic }: GetAllCompanions) => {
      const supabase = supabasePublic;

      let query = supabase
      .from('companions')
      .select()
      .order('created_at', { ascending: false });

    if(subject && topic) {
        query = query.ilike('subject', `%${subject}%`)
            .or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`)
    } else if(subject) {
        query = query.ilike('subject', `%${subject}%`)
    } else if(topic) {
        query = query.or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`)
    }

    const { data, error } = await query.range(
    (page - 1) * limit,
    page * limit - 1
  );

  if (error) {
    console.error(error);
    return [];
  }

  return data ?? [];
};

export const getCompanion = async (id: string) => {
      const supabase = supabasePublic;


    const { data, error } = await supabase
        .from('companions')
        .select()
        .eq('id', id);

    if(error) return console.log(error);

    return data[0];
}

export const addToSessionHistory = async (companionId: string) => {
    const { userId } = await auth();
      const supabase = supabasePublic;

    const { data, error } = await supabase.from('session_history')
        .insert({
            companion_id: companionId,
            user_id: userId,
        })

    if(error) throw new Error(error.message);

    return data;
}

export const getRecentSessions = async (limit = 10) => {
     const supabase = supabasePublic;

    const { data, error } = await supabase
        .from('session_history')
        .select(`companions:companion_id (*)`)
        .order('created_at', { ascending: false })
        .limit(limit)

    if(error) throw new Error(error.message);

    return data.map(({ companions }) => companions);
}

export const getUserSessions = async (userId: string, limit = 10) => {
      const supabase = supabasePublic;

    const { data, error } = await supabase
        .from('session_history')
        .select(`companions:companion_id (*)`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

    if(error) throw new Error(error.message);

    return data.map(({ companions }) => companions);
}

export const getUserCompanions = async (userId: string) => {
      const supabase = supabasePublic;

    const { data, error } = await supabase
        .from('companions')
        .select()
        .eq('author', userId)

    if(error) throw new Error(error.message);

    return data;
}

export const newCompanionPermissions = async () => {
  const { userId, has } = await auth();
   const supabase = supabasePublic;

  console.log("newCompanionPermissions: userId=", userId);
    console.log("newCompanionPermissions: has()", typeof has, has ? Object.keys(has) : has);

  
  let limit = 3;

  if (has({ plan: "pro_learner" })) {
    return true; // unlimited
  } else if (has({ feature: "10_companion_limit" })) {
    limit = 10;
  } else if (has({ feature: "3_companion_limit" })) {
    limit = 3;
  }

  const { data, error } = await supabase
    .from("companions")
    .select("id", { count: "exact" })
    .eq("author", userId);

  if (error) throw new Error(error.message);

  const companionCount = data?.length ?? 0;

  return companionCount < limit;
};



export const addBookmark = async (companionId: string, path: string) => {
  const { userId } = await auth();
  if (!userId) return;
    const supabase = supabasePublic;

  const { data, error } = await supabase.from("bookmarks").insert({
    companion_id: companionId,
    user_id: userId,
  });
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(path);
  return data;
};

export const removeBookmark = async (companionId: string, path: string) => {
  const { userId } = await auth();
  if (!userId) return;
    const supabase = supabasePublic;

  const { data, error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("companion_id", companionId)
    .eq("user_id", userId);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath(path);
  return data;
};

export const getBookmarkedCompanions = async (userId: string) => {
    const supabase = supabasePublic;

  const { data, error } = await supabase
    .from("bookmarks")
    .select(`companions:companion_id (*)`)
    .eq("user_id", userId);

  if (error) {
    console.error("Error loading bookmarks:", error);
    return [];
  }

  const rows = data ?? [];
  return rows.map(({ companions }) => companions);
};
