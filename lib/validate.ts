// Threads API ID는 숫자 문자열 (최대 20자리)
const THREADS_ID_PATTERN = /^\d{1,20}$/;

export function isValidThreadsId(id: string): boolean {
  return THREADS_ID_PATTERN.test(id);
}
