"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { Share2, Copy, Check, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getCommitHistory, getStreak } from "@/lib/commit-service";
import { useToast } from "@/hooks/use-toast";

export default function SharePage() {
  const [streak, setStreak] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}?ref=${encodeURIComponent(
          localStorage.getItem("user-id") || "anonymous"
        )}`
      : "";

  useEffect(() => {
    const loadData = async () => {
      const history = await getCommitHistory();
      setTotalDays(history.length);

      const currentStreak = await getStreak();
      setStreak(currentStreak);
    };

    loadData();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({
      title: "링크가 복사되었습니다!",
      description: "친구들에게 공유해보세요.",
    });

    setTimeout(() => setCopied(false), 2000);
  };

  const shareToSocial = (platform: string) => {
    let url = "";
    const text = `나는 지금까지 ${totalDays}일 동안 1일 1커밋 챌린지를 진행 중이에요! ${streak}일 연속 달성 중! 함께 해볼래요?`;

    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          text
        )}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          shareUrl
        )}&quote=${encodeURIComponent(text)}`;
        break;
      case "kakaotalk":
        // 카카오톡 공유는 SDK가 필요하지만, 여기서는 간단히 처리
        toast({
          title: "카카오톡 공유",
          description: "실제 구현 시 카카오톡 SDK를 연동해야 합니다.",
        });
        return;
    }

    if (url) {
      window.open(url, "_blank");
    }
  };

  return (
    <main className="flex w-full min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center">
          <Link href="/" className="absolute left-4 top-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <CardTitle className="text-2xl font-bold">친구 초대하기</CardTitle>
          <CardDescription>친구들과 함께 꾸준함을 만들어보세요</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="p-4 bg-muted rounded-lg text-center">
            <p className="text-lg font-medium">나의 기록</p>
            <div className="flex justify-center gap-8 mt-2">
              <div>
                <p className="text-2xl font-bold">{totalDays}</p>
                <p className="text-sm text-muted-foreground">총 달성일</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{streak}</p>
                <p className="text-sm text-muted-foreground">연속 달성</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="share-link">초대 링크</Label>
            <div className="flex gap-2">
              <Input
                id="share-link"
                value={shareUrl}
                readOnly
                className="flex-1"
              />
              <Button onClick={handleCopy} variant="outline" size="icon">
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>소셜 미디어에 공유하기</Label>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => shareToSocial("twitter")}
                variant="outline"
                className="flex-1"
              >
                Twitter
              </Button>
              <Button
                onClick={() => shareToSocial("facebook")}
                variant="outline"
                className="flex-1"
              >
                Facebook
              </Button>
              <Button
                onClick={() => shareToSocial("kakaotalk")}
                variant="outline"
                className="flex-1"
              >
                카카오톡
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button className="w-full" asChild>
            <Link href="/">
              <Share2 className="mr-2 h-4 w-4" />
              초대하고 돌아가기
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
