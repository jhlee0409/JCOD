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
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CalendarIcon, Trophy } from "lucide-react";
import Link from "next/link";
import { getAttendanceHistory, getRewards } from "@/lib/attendance-service";

export default function CalendarPage() {
  const [attendanceDates, setAttendanceDates] = useState<Date[]>([]);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [monthlyStats, setMonthlyStats] = useState<{ [key: string]: number }>(
    {}
  );

  useEffect(() => {
    const loadData = async () => {
      const history = await getAttendanceHistory();
      const dates = history.map((date) => new Date(date));
      setAttendanceDates(dates);

      const { streak: currentStreak } = await getRewards();
      setStreak(currentStreak);

      // 월별 통계 계산
      const monthly: { [key: string]: number } = {};
      dates.forEach((date) => {
        const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
        monthly[monthYear] = (monthly[monthYear] || 0) + 1;
      });
      setMonthlyStats(monthly);

      // 최장 스트릭 계산
      let maxStreak = 0;
      let current = 0;
      let lastDate: Date | null = null;

      // 날짜순 정렬
      dates.sort((a, b) => a.getTime() - b.getTime());

      dates.forEach((date) => {
        if (!lastDate) {
          current = 1;
        } else {
          const diffTime = Math.abs(date.getTime() - lastDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            current++;
          } else if (diffDays > 1) {
            current = 1;
          }
        }

        maxStreak = Math.max(maxStreak, current);
        lastDate = date;
      });

      setLongestStreak(maxStreak);
    };

    loadData();
  }, []);

  // 현재 월의 출석률 계산
  const getCurrentMonthAttendanceRate = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const daysInCurrentMonth = new Date(
      currentYear,
      currentMonth + 1,
      0
    ).getDate();
    const currentMonthDates = attendanceDates.filter(
      (date) =>
        date.getMonth() === currentMonth && date.getFullYear() === currentYear
    );

    const dayOfMonth = now.getDate();
    const rate = Math.round((currentMonthDates.length / dayOfMonth) * 100);

    return rate;
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
          <CardTitle className="text-2xl font-bold">출석 기록</CardTitle>
          <CardDescription>나의 출석 현황을 확인해보세요</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 요약 통계 */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{attendanceDates.length}</p>
              <p className="text-xs text-muted-foreground">총 출석일</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{streak}</p>
              <p className="text-xs text-muted-foreground">현재 스트릭</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{longestStreak}</p>
              <p className="text-xs text-muted-foreground">최장 스트릭</p>
            </div>
          </div>

          {/* 이번 달 출석률 */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h3 className="text-sm font-medium mb-2">이번 달 출석률</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-primary" />
                <span className="text-sm">{new Date().getMonth() + 1}월</span>
              </div>
              <Badge variant="secondary">
                {getCurrentMonthAttendanceRate()}%
              </Badge>
            </div>
          </div>

          {/* 캘린더 */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">달력 보기</h3>
            <Calendar
              mode="multiple"
              selected={attendanceDates}
              className="w-full border rounded-lg"
              disabled={(date) => date > new Date()}
              modifiers={{
                attended: attendanceDates,
              }}
              modifiersClassNames={{
                attended: "bg-primary/20 text-primary font-bold",
              }}
            />
          </div>

          {/* 출석 배지 */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">획득한 배지</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {streak >= 3 && (
                <Badge className="bg-blue-500 p-2">3일 연속</Badge>
              )}
              {streak >= 7 && (
                <Badge className="bg-purple-500 p-2">7일 연속</Badge>
              )}
              {streak >= 30 && (
                <Badge className="bg-amber-500 p-2">30일 연속</Badge>
              )}
              {longestStreak >= 50 && (
                <Badge className="bg-emerald-500 p-2">50일 달성</Badge>
              )}
              {longestStreak >= 100 && (
                <Badge className="bg-rose-500 p-2">100일 달성</Badge>
              )}
              {attendanceDates.length >= 365 && (
                <Badge className="bg-indigo-500 p-2">1년 출석</Badge>
              )}
              {streak < 3 &&
                longestStreak < 50 &&
                attendanceDates.length < 365 && (
                  <p className="text-sm text-muted-foreground text-center w-full">
                    아직 획득한 배지가 없습니다. 꾸준히 출석해보세요!
                  </p>
                )}
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button className="w-full" asChild>
            <Link href="/">
              <Trophy className="mr-2 h-4 w-4" />
              계속 출석하기
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
