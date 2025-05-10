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
} from "@/services/attendanceService";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import confetti from "canvas-confetti";
import AuthButton from "../AuthButton";
import { useUser } from "../UserProvider";

export default function Home() {
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [todayChecked, setTodayChecked] = useState(false);
  const [points, setPoints] = useState(0);
  const [nextReward, setNextReward] = useState(7);
  const [progress, setProgress] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

  const messages = [
    "오늘도 출석 완료! 내일도 잊지 마세요.",
    "좋아요! 포인트가 적립되었습니다.",
    "꾸준한 출석으로 더 많은 보상을 받으세요!",
    "오늘의 출석체크 완료!",
    "출석 성공! 내일도 기다릴게요.",
  ];

  useEffect(() => {
    // 데이터 로드
    loadData();
  }, [user]);

  // Supabase에서 데이터 로드
  const loadData = async () => {
    if (!user) return;
    
    try {
      // 출석 기록 및 통계 가져오기
      const history = await getAttendanceHistory();
      const { streak: currentStreak, points: currentPoints, longestStreak: maxStreak } =
        await getRewards();

      setStreak(currentStreak);
      setPoints(currentPoints);
      setLongestStreak(maxStreak);

      // 오늘 이미 출석했는지 확인
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD 형식
      const checked = history.some(date => date === today);
      setTodayChecked(checked);

      // 다음 보상까지 남은 일수 계산
      calculateNextReward(currentStreak);
    } catch (error) {
      console.error("데이터 로드 오류:", error);
    }
  };

  // 다음 보상까지 남은 일수 및 진행률 계산
  const calculateNextReward = (currentStreak: number) => {
    // 다음 보상 계산 (3일, 7일, 30일 주기)
    let daysUntilNextReward = 0;
    let progressValue = 0;
    
    if (currentStreak % 30 === 0) {
      // 30일 보상을 받은 직후
      daysUntilNextReward = 3;
      progressValue = 0;
    } else if (currentStreak % 7 === 0) {
      // 7일 보상을 받은 직후
      daysUntilNextReward = 3;
      progressValue = 0;
    } else if (currentStreak % 3 === 0) {
      // 3일 보상을 받은 직후
      daysUntilNextReward = 4; // 다음 7일 보상까지
      progressValue = 0;
    } else {
      // 가장 가까운 보상 계산
      const daysUntil3 = 3 - (currentStreak % 3);
      const daysUntil7 = 7 - (currentStreak % 7);
      const daysUntil30 = 30 - (currentStreak % 30);
      
      daysUntilNextReward = Math.min(daysUntil3, daysUntil7, daysUntil30);
      
      // 진행률 계산
      if (daysUntilNextReward === daysUntil3) {
        progressValue = ((3 - daysUntilNextReward) / 3) * 100;
      } else if (daysUntilNextReward === daysUntil7) {
        progressValue = ((7 - daysUntilNextReward) / 7) * 100;
      } else {
        progressValue = ((30 - daysUntilNextReward) / 30) * 100;
      }
    }
    
    setNextReward(daysUntilNextReward);
    setProgress(progressValue);
  };

  // 출석체크 처리
  const handleAttendance = async () => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "출석체크를 위해 로그인해주세요.",
        variant: "error",
      });
      return;
    }
    
    if (todayChecked) {
      toast({
        title: "이미 출석했습니다",
        description: "오늘은 이미 출석체크를 완료했습니다.",
        variant: "info",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { newStreak, newPoints, specialReward, success, message } = await checkAttendance();
      
      if (success) {
        // 애니메이션 표시
        setShowAnimation(true);
        
        // 랜덤 메시지 선택
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        // 특별 보상이 있는 경우 메시지 추가
        const rewardMessage = specialReward 
          ? `축하합니다! ${specialReward} 포인트 추가 보상을 받았습니다.` 
          : randomMessage;
        
        // 폭죽 효과
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        
        toast({
          title: "출석체크 완료!",
          description: rewardMessage,
          variant: "success",
        });
        
        // 상태 업데이트
        setStreak(newStreak);
        setPoints(newPoints);
        setTodayChecked(true);
        
        // 다음 보상 계산
        calculateNextReward(newStreak);
        
        // 최장 스트릭 업데이트
        if (newStreak > longestStreak) {
          setLongestStreak(newStreak);
        }
        
        // 3초 후 애니메이션 숨기기
        setTimeout(() => {
          setShowAnimation(false);
        }, 3000);
      } else {
        toast({
          title: "출석체크 실패",
          description: message || "출석체크 중 오류가 발생했습니다.",
          variant: "error",
        });
      }
    } catch (error) {
      console.error("출석체크 오류:", error);
      toast({
        title: "출석체크 실패",
        description: "출석체크 중 오류가 발생했습니다.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <AuthButton />
      </div>
      
      <Card className="w-full max-w-md mx-auto shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10 z-0" />
        
        <CardHeader className="relative z-10">
          <CardTitle className="text-2xl font-bold text-center">
            오늘의 출석체크
          </CardTitle>
          <CardDescription className="text-center">
            매일 출석하고 포인트를 모아보세요!
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 relative z-10">
          {/* 스트릭 및 포인트 정보 */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">
                {streak}일 연속 출석
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">{points} 포인트</span>
            </div>
          </div>
          
          {/* 최장 스트릭 */}
          <div className="flex justify-center items-center">
            <Badge variant="outline" className="flex items-center gap-1">
              <Trophy className="h-3 w-3 text-amber-500" />
              <span className="text-xs">최장 기록: {longestStreak}일</span>
            </Badge>
          </div>
          
          {/* 다음 보상까지 진행률 */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>다음 보상까지</span>
              <span>{nextReward}일 남음</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          {/* 출석체크 버튼 */}
          <div className="flex justify-center py-4 relative">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <Button
                onClick={handleAttendance}
                disabled={todayChecked || loading}
                className={`rounded-full w-24 h-24 flex flex-col items-center justify-center ${
                  todayChecked ? "bg-green-500 hover:bg-green-500" : ""
                }`}
              >
                {todayChecked ? (
                  <>
                    <Check className="h-8 w-8 mb-1" />
                    <span className="text-xs">완료</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-8 w-8 mb-1" />
                    <span className="text-xs">{loading ? "처리 중..." : "출석하기"}</span>
                  </>
                )}
              </Button>
            </motion.div>
            
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