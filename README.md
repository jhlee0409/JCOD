# JCOD: Next.js & Supabase 기반 개발자 습관 형성 앱

JCOD는 개발자들이 꾸준히 코딩하는 습관을 만들도록 돕는 웹 애플리케이션입니다.
Next.js와 Supabase를 활용하여 개발되었습니다.

<a href="#jcod-주요-기능"><strong>JCOD 주요 기능</strong></a> ·
<a href="#기술-스택"><strong>기술 스택</strong></a> ·
<a href="#프로젝트-구조"><strong>프로젝트 구조</strong></a> ·
<a href="#supabase-설정-상세"><strong>Supabase 설정</strong></a> ·
<a href="#라이선스"><strong>라이선스</strong></a>

## JCOD 주요 기능

- **출석 체크 시스템**: Supabase 데이터베이스와 연동된 일일 출석 체크 기능
- **스트릭 및 포인트**: 연속 출석(스트릭) 및 포인트 보상 시스템
- **데이터 시각화**: 출석 현황 및 통계 제공 (캘린더, 그래프 등)
- **사용자 인증**: Supabase Auth를 통한 간편한 로그인 및 회원가입
- **커밋 히스토리 연동**: GitHub 커밋 기록을 연동하여 출석을 자동화하는 기능 (개발 중/예정)

## 기술 스택

- **Framework**: [Next.js](https://nextjs.org) (v14.x, App Router, React v18.x)
- **Backend**: [Supabase](https://supabase.io)
  - Database: Supabase Postgres
  - Auth: Supabase Auth
  - Client Library: `@supabase/supabase-js` (v2.x)
  - Storage: Supabase Storage (필요시)
  - Supabase MCP: AI 에이전트를 통한 Supabase 프로젝트 관리 및 자동화 (스키마 관리, 데이터 작업, AI 기반 개발 지원 등)
- **Styling & UI**:
  - [Tailwind CSS](https://tailwindcss.com) (v3.x): 핵심 스타일링 프레임워크
  - [shadcn/ui](https://ui.shadcn.com/): UI 컴포넌트 라이브러리 (Radix UI, Tailwind CSS 기반)
  - [v0.dev](https://v0.dev): AI 기반 UI 프로토타이핑 및 코드 생성. 다음 라이브러리들을 활용한 컴포넌트 구성에 기여:
    - `framer-motion`: 애니메이션 효과
    - `canvas-confetti`: 특별 보상 애니메이션
    - `react-calendar`: 캘린더 UI
    - `date-fns`: 날짜/시간 처리
- **State Management**: React Context API, `useState`, `useEffect`, (필요시 `zustand` 등)
- **Language**: TypeScript (v5.x)
- **Deployment**: Vercel

## 프로젝트 구조

```text
/Users/jack/client/JCOD
├── app/                  # Next.js App Router (페이지 및 레이아웃)
│   ├── (auth)/           # 인증 관련 페이지 (로그인, 회원가입)
│   ├── (main)/           # 메인 애플리케이션 페이지 (로그인 후 접근)
│   │   ├── layout.tsx
│   │   └── page.tsx      # 홈 (출석체크 대시보드)
│   ├── stats/            # 통계 페이지
│   └── ...
├── components/           # 공용 React 컴포넌트
│   ├── ui/               # shadcn/ui 컴포넌트
│   ├── home/             # 홈 화면 관련 컴포넌트
│   └── AuthButton.tsx    # 인증 버튼 컴포넌트
├── services/             # 비즈니스 로직 (API 호출, 데이터 처리)
│   └── attendanceService.ts # 출석 관련 서비스
├── utils/                # 유틸리티 함수
│   └── supabase/         # Supabase 클라이언트 설정 (client, server, middleware)
├── types/                # TypeScript 타입 정의
├── public/               # 정적 에셋
├── .env.local.example    # 환경 변수 템플릿
├── next.config.js        # Next.js 설정
├── postcss.config.js     # PostCSS 설정
├── tailwind.config.ts    # Tailwind CSS 설정
└── package.json
```

## 애플리케이션 구성 참고

JCOD는 GNU Affero General Public License v3.0(AGPL-3.0) 하에 배포되는 자유 소프트웨어입니다. 이 프로젝트는 개발자 커뮤니티에 기여하고, 코드를 공유하며, 함께 발전시키기 위한 목적으로 공개되었습니다.
다음은 프로젝트의 Supabase 설정에 대한 참고 정보입니다.

### 1. Supabase 프로젝트 활용

JCOD는 백엔드로 [Supabase](https://supabase.io)를 사용합니다. 유사한 프로젝트를 구성하는 경우, [Supabase 대시보드](https://database.new)에서 새 프로젝트를 생성하여 활용할 수 있습니다.

### 2. 필요한 환경 변수

Next.js 애플리케이션에서 Supabase와 연동하기 위해서는 일반적으로 다음과 같은 환경 변수가 필요합니다:

```env
NEXT_PUBLIC_SUPABASE_URL=[Supabase 프로젝트 URL]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[Supabase 프로젝트 Anon Key]
```

이 값들은 Supabase 대시보드의 `Project Settings > API` 메뉴에서 확인할 수 있습니다.

### 3. Supabase 데이터베이스 설정

JCOD 애플리케이션이 사용하는 데이터베이스 테이블 및 함수에 대한 상세 내용은 아래 "Supabase 설정 상세" 섹션을 참고해 주십시오.

## Supabase 설정 상세

### 테이블

1. **`attendances`**: 사용자별 출석 기록

   ```sql
   CREATE TABLE attendances (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users(id) NOT NULL,
     check_date DATE NOT NULL,
     points_earned INT DEFAULT 0,
     special_reward TEXT,
     created_at TIMESTAMPTZ DEFAULT now(),
     UNIQUE (user_id, check_date)
   );
   ```

2. **`user_stats`**: 사용자별 통계 정보

   ```sql
   CREATE TABLE user_stats (
     user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
     current_streak INT DEFAULT 0,
     longest_streak INT DEFAULT 0,
     total_points INT DEFAULT 0,
     last_check_date DATE,
     updated_at TIMESTAMPTZ DEFAULT now()
   );
   ```

### 함수

1. **`check_attendance`**: 출석 기록 및 통계 업데이트 (트랜잭션)

   ```sql
   -- Supabase Function Editor에 다음 SQL을 입력하여 함수를 생성합니다.
   -- (자세한 함수 로직은 services/attendanceService.ts 또는 DB 스키마에서 확인)
   CREATE OR REPLACE FUNCTION check_attendance (
     p_user_id UUID,
     p_check_date DATE,
     p_points_earned INT,
     p_special_reward TEXT,
     p_new_streak INT,
     p_new_longest_streak INT,
     p_new_total_points INT
   )
   RETURNS VOID AS $$
   BEGIN
     -- 출석 기록 추가
     INSERT INTO public.attendances (user_id, check_date, points_earned, special_reward)
     VALUES (p_user_id, p_check_date, p_points_earned, p_special_reward);

     -- 사용자 통계 업데이트 (기존 레코드가 없으면 새로 생성, 있으면 업데이트)
     INSERT INTO public.user_stats (user_id, current_streak, longest_streak, total_points, last_check_date, updated_at)
     VALUES (p_user_id, p_new_streak, p_new_longest_streak, p_new_total_points, p_check_date, now())
     ON CONFLICT (user_id)
     DO UPDATE SET
       current_streak = p_new_streak,
       longest_streak = p_new_longest_streak,
       total_points = p_new_total_points,
       last_check_date = p_check_date,
       updated_at = now();
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```

   **참고:** `check_attendance` 함수의 실제 구현은 프로젝트의 `supabase/migrations` 폴더 또는 Supabase 대시보드에서 확인하는 것이 가장 정확합니다. 위 SQL은 예시입니다.

---

## 설치 및 실행 방법

1. 저장소 클론

```bash
git clone https://github.com/jhlee0409/JCOD.git
cd JCOD
```

2. 의존성 설치

```bash
yarn install
```

3. 환경 변수 설정

`.env.local.example` 파일을 `.env.local`로 복사하고 필요한 환경 변수를 설정합니다.

4. 개발 서버 실행

```bash
yarn dev
```

## 라이선스

이 프로젝트는 [GNU Affero General Public License v3.0(AGPL-3.0)](https://www.gnu.org/licenses/agpl-3.0.html) 하에 배포됩니다. AGPL-3.0은 자유 소프트웨어 라이선스로, 다음과 같은 주요 특징이 있습니다:

- 소프트웨어를 사용, 연구, 공유, 수정할 자유를 보장합니다.
- 수정된 버전을 배포하거나 네트워크를 통해 서비스로 제공할 경우, 해당 소스 코드도 AGPL-3.0 라이선스로 공개해야 합니다.
- 네트워크를 통해 사용자와 상호작용하는 경우에도 소스 코드 공개 의무가 있습니다.

### 소스 코드 접근

AGPL-3.0 라이선스 13조에 따라, 이 소프트웨어를 네트워크 서비스로 제공하는 경우 사용자가 소스 코드에 접근할 수 있는 방법을 제공해야 합니다. 이 프로젝트의 소스 코드는 GitHub 저장소에서 확인할 수 있습니다: [JCOD](https://github.com/jhlee0409/JCOD)

---

이 프로젝트는 [Next.js](https://nextjs.org/)와 [Supabase](https://supabase.io/)를 핵심 기술 스택으로 사용합니다.
Next.js는 서버사이드 렌더링, 정적 사이트 생성 등 효율적인 웹 애플리케이션 구축을 지원하며,
Supabase는 PostgreSQL 데이터베이스, 인증, 스토리지 등의 백엔드 기능을 손쉽게 통합할 수 있도록 도와줍니다.
이 조합을 통해 JCOD 애플리케이션은 빠르고 안정적인 개발 환경을 갖추고 사용자에게 뛰어난 경험을 제공합니다.
