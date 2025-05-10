"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogIn } from "lucide-react";

type Props = {
  signIn: (formData: FormData) => void;
  signUp: (formData: FormData) => void;
  message?: string;
};

export default function Login({ signIn, signUp, message }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (message) {
      toast({
        title: "로그인 실패",
        description: message,
        variant: "destructive",
      });
    }
  }, [message]);

  return (
    <main className="animate-in flex w-full min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center">
          <Link href="/" className="absolute left-4 top-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <CardTitle className="text-2xl font-bold">로그인</CardTitle>
          <CardDescription>
            계정에 로그인하고 출석체크를 시작하세요
          </CardDescription>
        </CardHeader>

        <form action={signIn}>
          <CardContent className=" space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                name="email"
                type="email"
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">비밀번호</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  비밀번호 찾기
                </Link>
              </div>
              <Input
                name="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              <LogIn className="mr-2 h-4 w-4" />
              {loading ? "로그인 중..." : "로그인"}
            </Button>
            <div className="text-center text-sm">
              계정이 없으신가요?{" "}
              <Link href="/register" className="text-primary hover:underline">
                회원가입
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
