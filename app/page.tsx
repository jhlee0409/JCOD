import { Suspense } from "react";
import { UserProvider } from "@/components/UserProvider";
import PageContent from "./PageContent";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          로딩 중...
        </div>
      }
    >
      <UserProvider>
        <PageContent />
      </UserProvider>
    </Suspense>
  );
}
