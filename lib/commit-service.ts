const STORAGE_KEY = "daily-commit-tracker";

// 오늘 커밋하기
export async function commitToday(): Promise<void> {
  const history = await getCommitHistory();
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD 형식
  // 오늘 날짜가 이미 있는지 확인
  if (!history.includes(today)) {
    history.push(today);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("커밋 저장 중 오류 발생:", error);
      throw new Error("커밋을 저장하는 중 문제가 발생했습니다.");
    }
  }
}

// 커밋 기록 가져오기
export async function getCommitHistory(): Promise<string[]> {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// 현재 연속 스트릭 계산
export async function getStreak(): Promise<number> {
  const history = await getCommitHistory();
  if (history.length === 0) return 0;

  // 날짜순으로 정렬
  history.sort();

  let streak = 0;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // 오늘 또는 어제 커밋했는지 확인
  const todayStr = today.toISOString().split("T")[0];
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const lastCommitDate = history[history.length - 1];

  // 마지막 커밋이 오늘이나 어제가 아니면 스트릭 0
  if (lastCommitDate !== todayStr && lastCommitDate !== yesterdayStr) {
    return 0;
  }

  // 연속된 날짜 계산
  const currentDate = new Date(history[history.length - 1]);

  for (let i = history.length - 1; i >= 0; i--) {
    const commitDate = new Date(history[i]);
    const expectedDate = new Date(currentDate);

    // 같은 날짜의 중복 커밋은 건너뛰기
    if (
      i < history.length - 1 &&
      commitDate.toISOString().split("T")[0] ===
        new Date(history[i + 1]).toISOString().split("T")[0]
    ) {
      continue;
    }

    // 예상 날짜와 실제 커밋 날짜가 다르면 스트릭 종료
    if (
      commitDate.toISOString().split("T")[0] !==
      expectedDate.toISOString().split("T")[0]
    ) {
      break;
    }

    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}

// 특정 날짜에 커밋했는지 확인
export async function hasCommittedOn(date: Date): Promise<boolean> {
  const history = await getCommitHistory();
  const dateStr = date.toISOString().split("T")[0];
  return history.includes(dateStr);
}
