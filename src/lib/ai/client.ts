import Anthropic from "@anthropic-ai/sdk";

// 서버 전용. ANTHROPIC_API_KEY는 환경 변수에서 읽는다
export const anthropic = new Anthropic();
