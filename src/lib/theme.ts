export const THEME_STORAGE_KEY = "theme";

// 첫 페인트 전에 실행해 저장된 테마(없으면 시스템 설정)를 <html>에 반영한다. 깜빡임 방지용.
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;
