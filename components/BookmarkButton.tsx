"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function BookmarkButton({
  companionId,
  revalidatePathProp = "/journey",
}: {
  companionId: string;
  revalidatePathProp?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const router = useRouter();

  const handle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companionId, path: revalidatePathProp }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed");
      setOk(true);
      router.refresh();
    } catch (err) {
      console.error("bookmark error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handle}
      disabled={loading}
      aria-label={ok ? "Bookmarked" : "Add bookmark"}
      className={`companion-bookmark ${loading ? "companion-bookmark--loading" : ok ? "companion-bookmark--booked" : ""}`}
    >
      {loading ? (

        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.25" strokeWidth="3"></circle>
          <path d="M22 12a10 10 0 0 1-10 10" stroke="white" strokeWidth="3" strokeLinecap="round"></path>
        </svg>
      ) : ok ? (
        <Image src="/icons/bookmark-filled.svg" alt="bookmarked" width={16} height={16} />
      ) : (
        <Image src="/icons/bookmark.svg" alt="bookmark" width={16} height={16} />
      )}
    </button>
  );
}
