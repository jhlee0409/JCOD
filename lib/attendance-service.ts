const STORAGE_KEY = "daily-attendance-tracker"
const POINTS_KEY = "attendance-points"
const STREAK_KEY = "attendance-streak"

// 오늘 출석체크하기
export async function checkAttendance(): Promise<{
  newStreak: number
  newPoints: number
  specialReward: number | null
}> {
  const history = await getAttendanceHistory()
  const today = new Date().toISOString().split("T")[0] // YYYY-MM-DD 형식

  // 오늘 날짜가 이미 있는지 확인
  if (!history.includes(today)) {
    history.push(today)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))

    // 현재 스트릭과 포인트 가져오기
    const { streak, points } = await getRewards()

    // 스트릭 증가
    const newStreak = streak + 1
    localStorage.setItem(STREAK_KEY, newStreak.toString())

    // 기본 포인트 증가 (매일 5포인트)
    let pointsToAdd = 5
    let specialReward = null

    // 특별 보상 체크
    if (newStreak % 3 === 0) {
      pointsToAdd += 10 // 3일마다 추가 10포인트
      specialReward = 10
    }
    if (newStreak % 7 === 0) {
      pointsToAdd += 30 // 7일마다 추가 30포인트
      specialReward = 30
    }
    if (newStreak % 30 === 0) {
      pointsToAdd += 150 // 30일마다 추가 150포인트
      specialReward = 150
    }

    const newPoints = points + pointsToAdd
    localStorage.setItem(POINTS_KEY, newPoints.toString())

    return { newStreak, newPoints, specialReward }
  }

  // 이미 출석한 경우 현재 값 반환
  const { streak, points } = await getRewards()
  return { newStreak: streak, newPoints: points, specialReward: null }
}

// 출석 기록 가져오기
export async function getAttendanceHistory(): Promise<string[]> {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

// 현재 스트릭과 포인트 가져오기
export async function getRewards(): Promise<{
  streak: number
  points: number
}> {
  const streakStr = localStorage.getItem(STREAK_KEY)
  const pointsStr = localStorage.getItem(POINTS_KEY)

  const streak = streakStr ? Number.parseInt(streakStr) : 0
  const points = pointsStr ? Number.parseInt(pointsStr) : 0

  // 스트릭 유효성 검사 (하루 이상 놓쳤는지 확인)
  const history = await getAttendanceHistory()
  if (history.length > 0) {
    const lastAttendance = new Date(history[history.length - 1])
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // 마지막 출석이 어제 또는 오늘이 아니면 스트릭 초기화
    if (
      lastAttendance.toDateString() !== today.toDateString() &&
      lastAttendance.toDateString() !== yesterday.toDateString()
    ) {
      localStorage.setItem(STREAK_KEY, "0")
      return { streak: 0, points }
    }
  }

  return { streak, points }
}

// 사용 가능한 보상 목록 가져오기
export async function getAvailableRewards(): Promise<
  {
    id: string
    name: string
    description: string
    cost: number
    image: string
  }[]
> {
  // 실제로는 서버에서 가져와야 하지만, 예시로 하드코딩
  return [
    {
      id: "reward1",
      name: "프로필 배지",
      description: "프로필에 표시되는 특별 배지",
      cost: 50,
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: "reward2",
      name: "테마 변경",
      description: "앱 테마 색상 변경 권한",
      cost: 100,
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: "reward3",
      name: "프리미엄 기능",
      description: "1주일 동안 프리미엄 기능 사용",
      cost: 200,
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: "reward4",
      name: "특별 이모티콘",
      description: "채팅에서 사용 가능한 특별 이모티콘",
      cost: 75,
      image: "/placeholder.svg?height=80&width=80",
    },
  ]
}

// 보상 구매하기
export async function purchaseReward(rewardId: string): Promise<{
  success: boolean
  message: string
  remainingPoints: number
}> {
  const { points } = await getRewards()
  const rewards = await getAvailableRewards()
  const reward = rewards.find((r) => r.id === rewardId)

  if (!reward) {
    return {
      success: false,
      message: "존재하지 않는 보상입니다.",
      remainingPoints: points,
    }
  }

  if (points < reward.cost) {
    return {
      success: false,
      message: "포인트가 부족합니다.",
      remainingPoints: points,
    }
  }

  // 포인트 차감
  const newPoints = points - reward.cost
  localStorage.setItem(POINTS_KEY, newPoints.toString())

  // 실제로는 사용자의 보상 목록에 추가하는 로직이 필요

  return {
    success: true,
    message: `${reward.name} 보상을 성공적으로 구매했습니다!`,
    remainingPoints: newPoints,
  }
}

