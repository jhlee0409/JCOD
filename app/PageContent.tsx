"use client";

import Home from "@/components/home/Home";
import { GuestView } from "@/components/GuestView";
import { useUser } from "@/components/UserProvider";

export default function PageContent() {
  const { user, isLoading } = useUser();

  // 로딩 중일 때 표시할 스켈레톤 UI
  if (isLoading) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center">
        <div className="w-full max-w-md mx-auto p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-muted rounded-md w-3/4 mx-auto"></div>
            <div className="h-64 bg-muted rounded-md w-full"></div>
            <div className="h-8 bg-muted rounded-md w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col items-center">
      {user ? <Home /> : <GuestView />}
    </div>
  );
}
