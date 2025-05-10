"use client";

import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AuthButton() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // 컴포넌트 마운트 시 사용자 정보 가져오기
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    };

    fetchUser();

    // Auth 상태 변경 구독
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      // 컴포넌트 언마운트 시 구독 해제
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="h-8 rounded-md px-3 text-xs bg-muted animate-pulse w-16"></div>
    );
  }

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
        {loading ? "처리 중..." : "로그아웃"}
      </Button>
    </div>
  ) : (
    <Button variant="outline" size="sm" asChild className="w-16">
      <Link href="/login">로그인</Link>
    </Button>
  );
}
