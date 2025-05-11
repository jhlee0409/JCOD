import { createClient } from "@/utils/supabase/client";
import type { User } from '@supabase/supabase-js';

export interface UserStats {
  current_streak: number;
  longest_streak: number;
  total_points: number;
  last_check_date: string | null;
  user_id?: string;
}

export interface UserAttendanceData {
  user: User | null;
  userStats: UserStats | null;
  attendanceHistory: string[];
  todayChecked: boolean;
  error: string | null;
}

// 사용자 데이터와 출석 기록을 한 번에 가져오는 함수
export async function getUserAttendanceData(user: User | null): Promise<UserAttendanceData> {
  console.log("getUserAttendanceData called with user:", user?.id);
  const supabase = createClient();
  try {
    if (!user) {
      return {
        user: null,
        userStats: null,
        attendanceHistory: [],
        todayChecked: false,
        error: "로그인이 필요합니다.",
      };
    }

    const todayStr = new Date().toISOString().split("T")[0];

    const [userStatsResponse, attendanceResponse] = await Promise.all([
      supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", user.id)
        .single<UserStats>(),
      supabase
        .from("attendances")
        .select("check_date")
        .eq("user_id", user.id)
        .order("check_date", { ascending: true }),
    ]);

    let userStats = userStatsResponse.data;
    if (
      userStatsResponse.error &&
      userStatsResponse.error.code === "PGRST116"
    ) {
      // PGROST116: 'No rows found'
      // 사용자 통계가 없으면 초기값으로 설정 또는 생성 (여기서는 초기값으로 반환)
      userStats = {
        user_id: user.id,
        current_streak: 0,
        longest_streak: 0,
        total_points: 0,
        last_check_date: null,
      };
    } else if (userStatsResponse.error) {
      throw userStatsResponse.error;
    }

    const attendanceHistory = attendanceResponse.data
      ? attendanceResponse.data.map((item) => item.check_date)
      : [];
    const todayChecked = attendanceHistory.includes(todayStr);

    return {
      user,
      userStats,
      attendanceHistory,
      todayChecked,
      error: null,
    };
  } catch (error: any) {
    console.error("데이터 로드 오류:", error);
    return {
      user: null,
      userStats: null,
      attendanceHistory: [],
      todayChecked: false,
      error: error.message || "데이터 로드 중 오류가 발생했습니다.",
    };
  }
}

// 오늘 출석체크하기
export async function checkAttendance(user: User | null): Promise<{
  newStreak: number;
  newPoints: number;
  specialReward: number | null;
  success: boolean;
  message?: string;
}> {
  const supabase = createClient();
  try {
    const data = await getUserAttendanceData(user);
    if (data.error || !data.user || !data.userStats) {
      return {
        newStreak: 0,
        newPoints: 0,
        specialReward: null,
        success: false,
        message: data.error || "사용자 정보를 가져올 수 없습니다.",
      };
    }

    const { user: userData, userStats, todayChecked } = data;
    const todayStr = new Date().toISOString().split("T")[0];

    if (todayChecked) {
      return {
        newStreak: userStats.current_streak,
        newPoints: userStats.total_points,
        specialReward: null,
        success: false,
        message: "오늘은 이미 출석체크를 완료했습니다.",
      };
    }

    let currentStreak = userStats.current_streak;
    let totalPoints = userStats.total_points;
    let longestStreak = userStats.longest_streak;
    const lastCheckDate = userStats.last_check_date;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (
      lastCheckDate &&
      lastCheckDate !== yesterdayStr &&
      lastCheckDate !== todayStr
    ) {
      currentStreak = 0;
    }

    const newStreak = currentStreak + 1;
    let pointsToAdd = 5;
    let specialReward: number | null = null;

    if (newStreak % 3 === 0) {
      pointsToAdd += 10;
      specialReward = 10;
    }
    if (newStreak % 7 === 0) {
      pointsToAdd += 30;
      specialReward = (specialReward || 0) + 30;
    }
    if (newStreak % 30 === 0) {
      pointsToAdd += 150;
      specialReward = (specialReward || 0) + 150;
    }

    const newPoints = totalPoints + pointsToAdd;
    const newLongestStreak = Math.max(longestStreak, newStreak);

    const { error: rpcError } = await supabase.rpc("check_attendance", {
      p_user_id: userData.id,
      p_check_date: todayStr,
      p_points_earned: pointsToAdd,
      p_special_reward: specialReward,
      p_new_streak: newStreak,
      p_longest_streak: newLongestStreak,
      p_new_total_points: newPoints,
    });

    if (rpcError) {
      console.error("출석체크 RPC 오류:", rpcError);
      return {
        newStreak: currentStreak, // 실패 시 이전 값 유지
        newPoints: totalPoints, // 실패 시 이전 값 유지
        specialReward: null,
        success: false,
        message: rpcError.message || "출석체크 중 오류가 발생했습니다.",
      };
    }

    return {
      newStreak,
      newPoints,
      specialReward,
      success: true,
    };
  } catch (error: any) {
    console.error("출석체크 전체 오류:", error);
    return {
      newStreak: 0,
      newPoints: 0,
      specialReward: null,
      success: false,
      message: error.message || "출석체크 중 알 수 없는 오류가 발생했습니다.",
    };
  }
}

// 출석 기록 가져오기
export async function getAttendanceHistory(user: User | null): Promise<string[]> {
  const { attendanceHistory, error } = await getUserAttendanceData(user);
  if (error) {
    console.error("출석 기록 조회 오류 (from getUserAttendanceData):", error);
    return [];
  }
  return attendanceHistory;
}

// 현재 스트릭과 포인트 가져오기
export async function getRewards(user: User | null): Promise<{
  streak: number;
  points: number;
  longestStreak: number;
}> {
  const { userStats, error } = await getUserAttendanceData(user);
  if (error || !userStats) {
    console.error("보상 정보 조회 오류 (from getUserAttendanceData):", error);
    return { streak: 0, points: 0, longestStreak: 0 };
  }
  return {
    streak: userStats.current_streak,
    points: userStats.total_points,
    longestStreak: userStats.longest_streak,
  };
}
