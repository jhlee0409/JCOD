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
import { Progress } from "@/components/ui/progress";
import { Check, Gift, Calendar, Trophy, Sparkles, Star } from "lucide-react";
import { motion } from "framer-motion";
import {
  checkAttendance,
  getAttendanceHistory,
  getRewards,
} from "@/lib/attendance-service";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import confetti from "canvas-confetti";
import AuthButton from "../AuthButton";

export default function Home() {
  const [streak, setStreak] = useState(0);
  const [todayChecked, setTodayChecked] = useState(false);
  const [points, setPoints] = useState(0);
  const [nextReward, setNextReward] = useState(7);
  const [progress, setProgress] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);
  const { toast } = useToast();

  const messages = [
    "오늘도 출석 완료! 내일도 잊지 마세요.",
    "좋아요! 포인트가 적립되었습니다.",
    "꾸준한 출석으로 더 많은 보상을 받으세요!",
    "오늘의 출석체크 완료!",
    "출석 성공! 내일도 기다릴게요.",
  ];

  useEffect(() => {
    // 로컬 스토리지에서 데이터 로드
    const loadData = async () => {
      const history = await getAttendanceHistory();
      const { streak: currentStreak, points: currentPoints } =
        await getRewards();

      setStreak(currentStreak);
      setPoints(currentPoints);

      // 오늘 이미 출석했는지 확인
      const today = new Date().toDateString();
      const checked = history.some(
        (date) => new Date(date).toDateString() === today
      );
      setTodayChecked(checked);

      // 다음 보상까지 남은 일수 계산
      const daysUntilNextReward = 7 - (currentStreak % 7);
      setNextReward(daysUntilNextReward);

      // 진행률 계산
      const progressValue = ((7 - daysUntilNextReward) / 7) * 100;
      setProgress(progressValue);
    };

    loadData();
  }, []);

  const handleAttendance = async () => {
    if (todayChecked) {
      toast({
        title: "이미 오늘 출석했습니다!",
        description: "내일 다시 방문해주세요.",
        variant: "default",
      });
      return;
    }

    const { newStreak, newPoints, specialReward } = await checkAttendance();

    // 출석체크 성공 애니메이션
    setShowAnimation(true);

    // 컨페티 효과
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    // 상태 업데이트
    setTodayChecked(true);
    setStreak(newStreak);
    setPoints(newPoints);

    // 다음 보상까지 남은 일수 계산
    const daysUntilNextReward = 7 - (newStreak % 7);
    setNextReward(daysUntilNextReward);

    // 진행률 계산
    const progressValue = ((7 - daysUntilNextReward) / 7) * 100;
    setProgress(progressValue);

    // 특별 보상 메시지
    if (specialReward) {
      toast({
        title: "🎉 특별 보상 획득!",
        description: `${newStreak}일 연속 출석 달성! ${specialReward} 포인트가 추가 지급되었습니다.`,
        variant: "default",
      });
    } else {
      // 일반 출석 메시지
      const randomMessage =
        messages[Math.floor(Math.random() * messages.length)];
      toast({
        title: "출석 완료!",
        description: randomMessage,
        variant: "default",
      });
    }

    // 애니메이션 종료
    setTimeout(() => {
      setShowAnimation(false);
    }, 2000);
  };

  return (
    <main className="flex w-full flex-1 flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <Card className="w-full max-w-md mx-auto shadow-lg relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-xl" />

        <CardHeader className="text-center relative z-10">
          <div className="flex justify-end">
            <AuthButton />
          </div>
          <CardTitle className="text-2xl font-bold">데일리 출석체크</CardTitle>
          <CardDescription>매일 출석하고 보상을 받으세요!</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-6 relative z-10">
          {/* 포인트 및 스트릭 표시 */}
          <div className="flex justify-between w-full">
            <Badge
              variant="outline"
              className="flex items-center gap-1 px-3 py-1 text-sm"
            >
              <Star className="h-4 w-4 text-yellow-500" />
              <span>{points} 포인트</span>
            </Badge>
            <Badge
              variant="outline"
              className="flex items-center gap-1 px-3 py-1 text-sm"
            >
              <Trophy className="h-4 w-4 text-orange-500" />
              <span>{streak}일 연속 출석</span>
            </Badge>
          </div>

          {/* 다음 보상까지 진행 상황 */}
          <div className="w-full space-y-2">
            <div className="flex justify-between text-sm">
              <span>다음 보상까지</span>
              <span className="font-medium">{nextReward}일 남음</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>오늘</span>
              <span>7일 보상</span>
            </div>
          </div>

          {/* 메인 출석체크 버튼 - 원형 버튼으로 변경 */}
          <div className="w-full flex justify-center items-center py-6 relative">
            {/* 배경 효과 - 원형 그라데이션 */}
            <div className="absolute inset-0 flex justify-center items-center">
              <div className="w-48 h-48 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-full blur-md" />
            </div>

            {/* 빛나는 효과 애니메이션 */}
            {!todayChecked && (
              <>
                <motion.div
                  className="absolute w-52 h-52 rounded-full bg-primary/5"
                  animate={{ scale: [1, 1.05, 1], opacity: [0.7, 0.4, 0.7] }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="absolute w-56 h-56 rounded-full bg-primary/5"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.2, 0.5] }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: 0.3,
                  }}
                />
              </>
            )}

            <motion.button
              onClick={handleAttendance}
              disabled={todayChecked}
              className={`w-44 h-44 rounded-full flex flex-col items-center justify-center text-white font-bold relative z-10 shadow-lg ${
                todayChecked
                  ? "bg-green-500 cursor-default"
                  : "bg-gradient-to-br from-primary to-purple-700 hover:from-primary/90 hover:to-purple-600 cursor-pointer"
              }`}
              whileHover={!todayChecked ? { scale: 1.05 } : {}}
              whileTap={!todayChecked ? { scale: 0.95 } : {}}
              animate={
                !todayChecked
                  ? {
                      boxShadow: [
                        "0 0 0 0 rgba(124, 58, 237, 0)",
                        "0 0 0 15px rgba(124, 58, 237, 0.2)",
                        "0 0 0 0 rgba(124, 58, 237, 0)",
                      ],
                    }
                  : {}
              }
              transition={
                !todayChecked
                  ? {
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "loop",
                    }
                  : {}
              }
            >
              {todayChecked ? (
                <>
                  <Check className="h-10 w-10 mb-2" />
                  <span className="text-lg">출석 완료!</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-10 w-10 mb-2" />
                  <span className="text-lg">출석체크</span>
                  <span className="text-sm mt-1">터치하세요</span>
                </>
              )}
            </motion.button>

            {/* 출석체크 성공 애니메이션 */}
            {showAnimation && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center z-20"
              >
                <div className="text-green-500 text-4xl">
                  <Check className="h-20 w-20" />
                </div>
              </motion.div>
            )}
          </div>
          {/* 보상 안내 */}
          <div className="grid grid-cols-3 gap-2 w-full">
            <Card className="bg-muted/50">
              <CardContent className="p-3 flex flex-col items-center">
                <Badge className="mb-1 bg-blue-500">3일</Badge>
                <span className="text-xs">10 포인트</span>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardContent className="p-3 flex flex-col items-center">
                <Badge className="mb-1 bg-purple-500">7일</Badge>
                <span className="text-xs">30 포인트</span>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardContent className="p-3 flex flex-col items-center">
                <Badge className="mb-1 bg-amber-500">30일</Badge>
                <span className="text-xs">150 포인트</span>
              </CardContent>
            </Card>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between gap-2 relative z-10">
          <Button variant="outline" size="sm" asChild>
            <Link href="/calendar">
              <Calendar className="h-4 w-4 mr-1" />
              출석 기록
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/rewards">
              <Gift className="h-4 w-4 mr-1" />
              보상 받기
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
