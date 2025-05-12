// /Users/jack/client/JCOD/utils/validate.ts

// ========== 유효성 검사 결과 타입 ==========
type ValidationResult =
  | {
      valid: true;
      message: null;
    }
  | {
      valid: false;
      message: string;
    };

// ========== 공통 오류 메시지 ==========
const ERROR_MESSAGES = {
  EMAIL_REQUIRED: "이메일 주소를 입력해 주세요.",
  EMAIL_MISSING_AT: "이메일 주소에 '@'를 꼭 포함해 주세요.",
  EMAIL_MISSING_LOCAL: "'@' 앞에 아이디를 입력해 주세요.",
  EMAIL_INVALID_DOMAIN:
    "이메일의 뒷부분은 웹사이트 주소처럼 입력해 주세요. 예: example.com",
  EMAIL_INVALID_DOTS:
    "이메일 주소에 마침표(.)를 연속하거나 처음·끝에 사용할 수 없어요.",

  PASSWORD_TOO_SHORT: (min: number) =>
    `안전을 위해 비밀번호는 최소 ${min}자 이상 입력해 주세요.`,
  PASSWORD_REPEATING_CHAR:
    "같은 문자를 계속 반복하면 쉽게 노출돼요. 다양한 문자를 조합해 주세요.",
  PASSWORD_REPEATING_PATTERN:
    "간단한 패턴을 반복하면 비밀번호가 쉽게 노출될 수 있어요. (예: abcabc, 1212)",
  PASSWORD_SEQUENTIAL:
    "연속된 숫자(12345)나 문자(abcde)는 사용하지 않는 게 더 안전해요.",

  NAME_LENGTH: (min: number, max: number) =>
    `이름은 최소 ${min}자에서 최대 ${max}자까지 입력할 수 있어요.`,
  NAME_INVALID_CHARS:
    "이름에는 영문, 숫자, 한글, 특수문자(._+-)만 쓸 수 있어요.",
  NAME_CONSECUTIVE_SPECIAL:
    "특수문자(._+-)를 연속해서 쓰면 안 돼요. (예: .., __)",
  NAME_START_END_SPECIAL:
    "이름의 처음과 끝에는 특수문자(._+-)를 사용하지 말아 주세요.",
};

// ========== 이메일 검사 ==========
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { valid: false, message: ERROR_MESSAGES.EMAIL_REQUIRED };
  }

  if (!email.includes("@")) {
    return { valid: false, message: ERROR_MESSAGES.EMAIL_MISSING_AT };
  }

  const [local, domain] = email.split("@");

  if (!local) {
    return { valid: false, message: ERROR_MESSAGES.EMAIL_MISSING_LOCAL };
  }
  if (!domain || !domain.includes(".")) {
    return { valid: false, message: ERROR_MESSAGES.EMAIL_INVALID_DOMAIN };
  }

  if (email.startsWith(".") || email.endsWith(".") || email.includes("..")) {
    return { valid: false, message: ERROR_MESSAGES.EMAIL_INVALID_DOTS };
  }

  // 모든 검사 통과
  return { valid: true, message: null };
};

// ========== 비밀번호 검사 ==========
const MIN_PASSWORD_LENGTH = 12;
const SEQUENTIAL_THRESHOLD = 3;

const repeatPattern = (s: string): boolean => {
  for (let len = 1; len <= Math.floor(s.length / 2); len++) {
    const p = s.slice(0, len);
    if (p.repeat(Math.ceil(s.length / len)).slice(0, s.length) === s) {
      return true;
    }
  }
  return false;
};

const hasSequential = (s: string, seq: string): boolean => {
  for (let i = 0; i <= seq.length - SEQUENTIAL_THRESHOLD; i++) {
    const asc = seq.slice(i, i + SEQUENTIAL_THRESHOLD);
    const desc = asc.split("").reverse().join("");
    if (s.includes(asc) || s.includes(desc)) return true;
  }
  return false;
};

export const validatePassword = (password: string): ValidationResult => {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      valid: false,
      message: ERROR_MESSAGES.PASSWORD_TOO_SHORT(MIN_PASSWORD_LENGTH),
    };
  }
  // 같은 문자 3회 이상 연속 검사 (aaa, 111)
  if (/(.)\1\1/.test(password)) {
    return { valid: false, message: ERROR_MESSAGES.PASSWORD_REPEATING_CHAR };
  }
  // 반복 패턴 3회 이상 검사
  if (repeatPattern(password)) {
    return { valid: false, message: ERROR_MESSAGES.PASSWORD_REPEATING_PATTERN };
  }
  // 연속된 문자/숫자 3개 이상 검사
  const seqs = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  if (hasSequential(password, seqs)) {
    return { valid: false, message: ERROR_MESSAGES.PASSWORD_SEQUENTIAL };
  }

  return { valid: true, message: null };
};

// ========== 이름 검사 ==========
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 20;

export const validateName = (name: string): ValidationResult => {
  if (name.length < MIN_NAME_LENGTH || name.length > MAX_NAME_LENGTH) {
    return {
      valid: false,
      message: ERROR_MESSAGES.NAME_LENGTH(MIN_NAME_LENGTH, MAX_NAME_LENGTH),
    };
  }
  if (!/^[A-Za-z0-9가-힣._+-]+$/.test(name)) {
    return { valid: false, message: ERROR_MESSAGES.NAME_INVALID_CHARS };
  }
  if (/(?:[._+-]){2,}/.test(name)) {
    return { valid: false, message: ERROR_MESSAGES.NAME_CONSECUTIVE_SPECIAL };
  }
  if (/^[._+-]|[._+-]$/.test(name)) {
    return { valid: false, message: ERROR_MESSAGES.NAME_START_END_SPECIAL };
  }

  return { valid: true, message: null };
};
