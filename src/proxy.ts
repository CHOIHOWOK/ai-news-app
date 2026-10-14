import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 페이지는 로그인 모달을 보여주기 위해 통과시키고(page.tsx에서 Show로 분기),
// API 라우트는 인증되지 않은 요청을 401로 차단한다.
const isApiRoute = createRouteMatcher(["/api(.*)", "/trpc(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isApiRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    // Next.js 내부 파일과 정적 파일은 제외
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // API 라우트는 항상 실행
    "/(api|trpc)(.*)",
  ],
};
