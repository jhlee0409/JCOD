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
import { ArrowLeft, BarChart3, CalendarIcon, Trophy } from "lucide-react";
import Link from "next/link";
import { getCommitHistory } from "@/lib/commit-service";
import { Calendar } from "@/components/ui/calendar";

// 최장 스트릭 계산 함수
const calculateLongestStreak = (dates: Date[]) => {
  let maxStreak = 0;
  let current = 0;
  let lastDate: Date | null = null;
  // 날짜순 정렬
  const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());
  sortedDates.forEach((date) => {
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
  return maxStreak;
};

// 월별 통계 계산 함수
const calculateMonthlyStats = (dates: Date[]) => {
  const monthly: { [key: string]: number } = {};
  dates.forEach((date) => {
    const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
    monthly[monthYear] = (monthly[monthYear] || 0) + 1;
  });
  return monthly;
};

// 현재 스트릭 계산 함수
const calculateCurrentStreak = (dates: Date[]) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const hasToday = dates.some((d) => d.toDateString() === today.toDateString());
  const hasYesterday = dates.some(
    (d) => d.toDateString() === yesterday.toDateString()
  );
  if (!hasToday && !hasYesterday) {
    return 0;
  }
  let streak = hasToday ? 1 : 0;
  const checkDate = hasToday ? yesterday : new Date(yesterday);
  checkDate.setDate(checkDate.getDate() - 1);
  while (dates.some((d) => d.toDateString() === checkDate.toDateString())) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }
  return streak;
};

// ==================================================

export default function StatsPage() {
  const [commitDates, setCommitDates] = useState<Date[]>([]);
  const [longestStreak, setLongestStreak] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [monthlyStats, setMonthlyStats] = useState<{ [key: string]: number }>(
    {}
  );

  useEffect(() => {
    const loadData = async () => {
      const history = await getCommitHistory();
      const dates = history.map((date) => new Date(date));
      setCommitDates(dates);
      // 월별 통계 계산 및 설정
      const monthly = calculateMonthlyStats(dates);
      setMonthlyStats(monthly);
      // 최장 스트릭 계산 및 설정
      const maxStreak = calculateLongestStreak(dates);
      setLongestStreak(maxStreak);
      // 현재 스트릭 계산 및 설정
      const currentStreakValue = calculateCurrentStreak(dates);
      setCurrentStreak(currentStreakValue);
    };
    loadData();
  }, []);

  // 월별 통계 데이터 정렬
  const sortedMonthlyStats = Object.entries(monthlyStats)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6); // 최근 6개월만 표시

  // 최대 월별 커밋 수 계산 (차트 높이 조정용)
  const maxMonthlyCommits = Math.max(...Object.values(monthlyStats), 1);

  return (
    <main className="flex w-full min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center">
          <Link href="/" className="absolute left-4 top-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <CardTitle className="text-2xl font-bold">나의 통계</CardTitle>
          <CardDescription>지금까지의 기록을 확인해보세요</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 요약 통계 */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{commitDates.length}</p>
              <p className="text-xs text-muted-foreground">총 달성일</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{currentStreak}</p>
              <p className="text-xs text-muted-foreground">현재 스트릭</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{longestStreak}</p>
              <p className="text-xs text-muted-foreground">최장 스트릭</p>
            </div>
          </div>

          {/* 월별 차트 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <h3 className="text-sm font-medium">월별 활동</h3>
            </div>
            <div className="h-32 flex items-end gap-1">
              {sortedMonthlyStats.map(([month, count]) => {
                const height = (count / maxMonthlyCommits) * 100;
                const [year, monthNum] = month.split("-");
                return (
                  <div
                    key={month}
                    className="flex flex-col items-center flex-1"
                  >
                    <div
                      className="w-full bg-primary rounded-t-sm"
                      style={{ height: `${height}%` }}
                    />
                    <p className="text-xs mt-1">{monthNum}월</p>
                  </div>
                );
              })}
              {sortedMonthlyStats.length === 0 && (
                <div className="w-full text-center text-muted-foreground">
                  데이터가 없습니다
                </div>
              )}
            </div>
          </div>

          {/* 캘린더 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <h3 className="text-sm font-medium">달력 보기</h3>
            </div>
            <Calendar
              mode="multiple"
              selected={commitDates}
              className="w-full border rounded-lg"
              disabled={(date) => date > new Date()}
              modifiers={{
                committed: commitDates,
              }}
              modifiersClassNames={{
                committed: "bg-green-100 text-green-700 font-bold",
              }}
            />
          </div>
        </CardContent>

        <CardFooter>
          <Button className="w-full" asChild>
            <Link href="/">
              <Trophy className="mr-2 h-4 w-4" />
              계속 도전하기
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
