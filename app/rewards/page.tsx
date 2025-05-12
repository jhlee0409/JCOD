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
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Gift, Star, ShoppingCart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  getRewards,
  getAvailableRewards,
  purchaseReward,
} from "@/lib/attendance-service";

import type { Reward } from "@/lib/attendance-service";
import { useToast } from "@/hooks/use-toast";

export default function RewardsPage() {
  const [points, setPoints] = useState(0);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const { points } = await getRewards();
        const availableRewards = await getAvailableRewards();

        setPoints(points);
        setRewards(availableRewards);
      } catch (error) {
        toast({
          title: "데이터 로딩 실패",
          description: "보상 정보를 불러오는 중 오류가 발생했습니다.",
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handlePurchase = async (rewardId: string) => {
    setLoading(true);

    try {
      const result = await purchaseReward(rewardId);

      if (result.success) {
        setPoints(result.remainingPoints);
        toast({
          title: "구매 성공!",
          description: result.message,
          variant: "success",
        });
      } else {
        toast({
          title: "구매 실패",
          description: result.message,
          variant: "error",
        });
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "보상 구매 중 오류가 발생했습니다.",
        variant: "error",
      });
    } finally {
      setLoading(false);
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
          <CardTitle className="text-2xl font-bold">보상 상점</CardTitle>
          <CardDescription>포인트를 사용하여 보상을 획득하세요</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 현재 포인트 */}
          <div className="flex items-center justify-center gap-2 p-3 bg-muted rounded-lg">
            <Star className="h-5 w-5 text-yellow-500" />
            <span className="text-xl font-bold">{points} 포인트</span>
          </div>

          {/* 보상 목록 */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">사용 가능한 보상</h3>
            <div className="grid gap-4">
              {rewards.map((reward) => (
                <Card key={reward.id} className="overflow-hidden">
                  <div className="flex items-center p-4">
                    <div className="relative w-16 h-16 mr-4 rounded-md overflow-hidden">
                      <Image
                        src={reward.image || "/placeholder.svg"}
                        alt={reward.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{reward.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {reward.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span>{reward.cost} 포인트</span>
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => handlePurchase(reward.id)}
                          disabled={points < reward.cost || loading}
                          className="flex items-center gap-1"
                        >
                          <ShoppingCart className="h-3 w-3" />
                          구매하기
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {rewards.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  사용 가능한 보상이 없습니다.
                </p>
              )}
            </div>
          </div>

          {/* 포인트 획득 방법 */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <h3 className="text-sm font-medium">포인트 획득 방법</h3>
            <ul className="text-sm space-y-1">
              <li className="flex justify-between">
                <span>매일 출석</span>
                <span>5 포인트</span>
              </li>
              <li className="flex justify-between">
                <span>3일 연속 출석</span>
                <span>+10 포인트</span>
              </li>
              <li className="flex justify-between">
                <span>7일 연속 출석</span>
                <span>+30 포인트</span>
              </li>
              <li className="flex justify-between">
                <span>30일 연속 출석</span>
                <span>+150 포인트</span>
              </li>
            </ul>
          </div>
        </CardContent>

        <CardFooter>
          <Button className="w-full" asChild>
            <Link href="/">
              <Gift className="mr-2 h-4 w-4" />
              출석체크로 돌아가기
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
