import { createClient } from "@/utils/supabase/client";

// 오늘 출석체크하기
export async function checkAttendance(): Promise<{
  newStreak: number;
  newPoints: number;
  specialReward: number | null;
  success: boolean;
  message?: string;
}> {
  try {
    const supabase = createClient();
    
    // 현재 로그인한 사용자 확인
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        newStreak: 0,
        newPoints: 0,
        specialReward: null,
        success: false,
        message: "로그인이 필요합니다."
      };
    }
    
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD 형식
    
    // 오늘 이미 출석했는지 확인
    const { data: existingAttendance } = await supabase
      .from("attendances")
      .select("*")
      .eq("user_id", user.id)
      .eq("check_date", todayStr)
      .single();
    
    if (existingAttendance) {
      // 이미 출석한 경우 현재 통계 반환
      const { data: userStats } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      return {
        newStreak: userStats?.current_streak || 0,
        newPoints: userStats?.total_points || 0,
        specialReward: null,
        success: false,
        message: "오늘은 이미 출석체크를 완료했습니다."
      };
    }
    
    // 사용자 통계 가져오기
    const { data: userStats } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", user.id)
      .single();
    
    let currentStreak = 0;
    let totalPoints = 0;
    let longestStreak = 0;
    let lastCheckDate = null;
    
    if (userStats) {
      currentStreak = userStats.current_streak;
      totalPoints = userStats.total_points;
      longestStreak = userStats.longest_streak;
      lastCheckDate = userStats.last_check_date;
    }
    
    // 스트릭 계산 (어제 출석했는지 확인)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    
    // 어제 출석하지 않았고, 마지막 출석일이 어제가 아니면 스트릭 초기화
    if (lastCheckDate && lastCheckDate !== yesterdayStr && lastCheckDate !== todayStr) {
      currentStreak = 0;
    }
    
    // 스트릭 증가
    const newStreak = currentStreak + 1;
    
    // 기본 포인트 증가 (매일 5포인트)
    let pointsToAdd = 5;
    let specialReward = null;
    
    // 특별 보상 체크
    if (newStreak % 3 === 0) {
      pointsToAdd += 10; // 3일마다 추가 10포인트
      specialReward = 10;
    }
    if (newStreak % 7 === 0) {
      pointsToAdd += 30; // 7일마다 추가 30포인트
      specialReward = 30;
    }
    if (newStreak % 30 === 0) {
      pointsToAdd += 150; // 30일마다 추가 150포인트
      specialReward = 150;
    }
    
    const newPoints = totalPoints + pointsToAdd;
    
    // 최장 스트릭 업데이트
    const newLongestStreak = Math.max(longestStreak, newStreak);
    
    // 트랜잭션으로 출석 기록 및 통계 업데이트
    const { error } = await supabase.rpc('check_attendance', {
      p_user_id: user.id,
      p_check_date: todayStr,
      p_points_earned: pointsToAdd,
      p_special_reward: specialReward,
      p_new_streak: newStreak,
      p_longest_streak: newLongestStreak,
      p_new_total_points: newPoints
    });
    
    if (error) {
      console.error("출석체크 오류:", error);
      return {
        newStreak: currentStreak,
        newPoints: totalPoints,
        specialReward: null,
        success: false,
        message: "출석체크 중 오류가 발생했습니다."
      };
    }
    
    return {
      newStreak,
      newPoints,
      specialReward,
      success: true
    };
  } catch (error) {
    console.error("출석체크 오류:", error);
    return {
      newStreak: 0,
      newPoints: 0,
      specialReward: null,
      success: false,
      message: "출석체크 중 오류가 발생했습니다."
    };
  }
}

// 출석 기록 가져오기
export async function getAttendanceHistory(): Promise<string[]> {
  try {
    const supabase = createClient();
    
    // 현재 로그인한 사용자 확인
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }
    
    // 사용자의 출석 기록 가져오기
    const { data } = await supabase
      .from("attendances")
      .select("check_date")
      .eq("user_id", user.id)
      .order("check_date", { ascending: true });
    
    return data ? data.map(item => item.check_date) : [];
  } catch (error) {
    console.error("출석 기록 조회 오류:", error);
    return [];
  }
}

// 현재 스트릭과 포인트 가져오기
export async function getRewards(): Promise<{
  streak: number;
  points: number;
  longestStreak: number;
}> {
  try {
    const supabase = createClient();
    
    // 현재 로그인한 사용자 확인
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { streak: 0, points: 0, longestStreak: 0 };
    }
    
    // 사용자 통계 가져오기
    const { data } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", user.id)
      .single();
    
    if (!data) {
      // 통계가 없으면 새로 생성
      const { data: newStats, error } = await supabase
        .from("user_stats")
        .insert([
          {
            user_id: user.id,
            current_streak: 0,
            longest_streak: 0,
            total_points: 0
          }
        ])
        .select()
        .single();
      
      if (error) {
        console.error("통계 생성 오류:", error);
        return { streak: 0, points: 0, longestStreak: 0 };
      }
      
      return {
        streak: newStats.current_streak,
        points: newStats.total_points,
        longestStreak: newStats.longest_streak
      };
    }
    
    // 스트릭 유효성 검사 (하루 이상 놓쳤는지 확인)
    if (data.last_check_date) {
      const lastCheckDate = new Date(data.last_check_date);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // 마지막 출석이 어제 또는 오늘이 아니면 스트릭 초기화
      if (
        lastCheckDate.toISOString().split("T")[0] !== yesterday.toISOString().split("T")[0] &&
        lastCheckDate.toISOString().split("T")[0] !== today.toISOString().split("T")[0]
      ) {
        // 스트릭 초기화
        const { error } = await supabase
          .from("user_stats")
          .update({ current_streak: 0, updated_at: new Date().toISOString() })
          .eq("user_id", user.id);
        
        if (error) {
          console.error("스트릭 초기화 오류:", error);
        }
        
        return {
          streak: 0,
          points: data.total_points,
          longestStreak: data.longest_streak
        };
      }
    }
    
    return {
      streak: data.current_streak,
      points: data.total_points,
      longestStreak: data.longest_streak
    };
  } catch (error) {
    console.error("통계 조회 오류:", error);
    return { streak: 0, points: 0, longestStreak: 0 };
  }
}