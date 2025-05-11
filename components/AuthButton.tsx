"use client";

import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "./UserProvider";

export default function AuthButton() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  };

  return user ? (
    <div className="flex items-center gap-4">
      <span className="text-sm">안녕하세요, {user.email}!</span>
      <Button
        variant="outline"
        size="sm"
        onClick={signOut}
        disabled={loading && !user}
        className="w-16"
      >
        {loading && !user ? "처리 중..." : "로그아웃"}
      </Button>
    </div>
  ) : (
    <Button variant="outline" size="sm" asChild className="w-16">
      <Link href="/login">로그인</Link>
    </Button>
  );
}
