-- profiles 테이블 생성
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 행 수준 보안(RLS) 설정
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 정책 생성: 사용자는 자신의 프로필만 볼 수 있음
CREATE POLICY "사용자는 자신의 프로필만 볼 수 있음" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- 정책 생성: 사용자는 자신의 프로필만 업데이트할 수 있음
CREATE POLICY "사용자는 자신의 프로필만 업데이트할 수 있음" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 정책 생성: 사용자는 회원가입 시 프로필을 생성할 수 있음
CREATE POLICY "사용자는 회원가입 시 프로필을 생성할 수 있음" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 함수 생성: 사용자 생성 시 자동으로 프로필 생성
CREATE OR REPLACE FUNCTION public.create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '사용자'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성: 사용자 생성 시 프로필 자동 생성
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;
CREATE TRIGGER create_profile_trigger
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_user();