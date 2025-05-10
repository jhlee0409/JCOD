"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export const GuestView = () => {
  const router = useRouter();
  return (
    <main className="flex w-full flex-1 flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <Card className="w-full max-w-md mx-auto shadow-lg relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-xl" />

        <CardHeader className="text-center relative z-10">
          {/* 로그인/로그아웃 버튼 */}
          {/* <div className="absolute right-4 top-4 flex gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">
                <LogIn className="h-4 w-4 mr-1" />
                로그인
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/register">
                <UserPlus className="h-4 w-4 mr-1" />
                가입
              </Link>
            </Button>
          </div> */}

          <CardTitle className="text-2xl font-bold mt-4">
            데일리 출석체크
          </CardTitle>
          <CardDescription>로그인하고 출석체크를 시작하세요!</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-6 relative z-10">
          {/* 메인 출석체크 버튼 */}
          <div className="w-full text-center space-y-4">
            <p className="text-muted-foreground">
              출석체크를 시작하려면 로그인이 필요합니다
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full relative"
            >
              <Button
                onClick={() => router.push("/login")}
                size="lg"
                className="w-full h-16 text-xl rounded-xl transition-all bg-primary hover:bg-primary/90"
              >
                <span className="flex items-center gap-2">
                  <LogIn className="h-5 w-5" />
                  로그인하기
                </span>
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};
