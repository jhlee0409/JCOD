"use client";

import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "./UserProvider";

export default function AuthButton() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      // 성공 시 추가 조치 가능
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
      // 사용자에게 오류 알림 (토스트 메시지 등)
    } finally {
      setLoading(false);
    }
  };

  return user ? (
    <div className="flex items-center gap-4">
      <span className="text-sm">안녕하세요, {user.email}!</span>
      <Button
        variant="outline"
        size="sm"
        onClick={signOut}
        disabled={loading}
        className="w-16"
      >
        {loading ? "" : "로그아웃"}
      </Button>
    </div>
  ) : (
    <Button variant="outline" size="sm" asChild className="w-16">
      <Link href="/login">로그인</Link>
    </Button>
  );
}
