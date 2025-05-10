import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    // 유효성 검사
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "모든 필드를 입력해주세요" },
        { status: 400 }
      );
    }
    
    if (password.length < 6) {
      return NextResponse.json(
        { error: "비밀번호는 최소 6자 이상이어야 합니다" },
        { status: 400 }
      );
    }
    
    const supabase = createClient();
    
    // 사용자 등록 및 메타데이터에 이름 저장
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name, // 메타데이터에 이름 저장
        },
        emailRedirectTo: `${request.nextUrl.origin}/auth/callback`,
      },
    });
    
    if (error) {
      console.error("회원가입 오류:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    // 프로필 테이블에 사용자 정보 추가 (선택 사항)
    if (data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            id: data.user.id,
            name: name,
            email: email,
            created_at: new Date().toISOString(),
          },
        ]);
      
      if (profileError) {
        console.error("프로필 생성 오류:", profileError);
        // 프로필 생성 실패해도 회원가입은 성공으로 처리
      }
    }
    
    return NextResponse.json(
      { message: "회원가입이 완료되었습니다. 이메일을 확인해주세요." },
      { status: 200 }
    );
  } catch (error) {
    console.error("서버 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}