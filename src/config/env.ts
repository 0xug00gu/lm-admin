// 환경 변수 설정
// Vercel에서는 프록시를 통해 API 요청을 처리합니다.

const isProd = import.meta.env.PROD;

// 프로덕션에서는 현재 origin 사용 (Vercel 프록시)
// 개발 환경에서는 직접 서버 URL 사용
const getBaseUrl = () => {
  if (isProd && typeof window !== "undefined") {
    // Vercel 프록시를 통해 요청 - 현재 origin 사용
    return window.location.origin;
  }
  return import.meta.env.VITE_POCKETBASE_URL || "http://146.56.158.19";
};

export const config = {
  // PocketBase URL
  pocketbaseUrl: getBaseUrl(),

  // PocketBase Admin 인증 (dataProvider용 - 선택적)
  pocketbaseAdminEmail: import.meta.env.VITE_POCKETBASE_ADMIN_EMAIL || "",
  pocketbaseAdminPassword: import.meta.env.VITE_POCKETBASE_ADMIN_PASSWORD || "",

  // API 서버 URL (Discord 관련 API)
  apiBaseUrl: getBaseUrl(),

  // 환경 확인
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE,
};

// API 엔드포인트 헬퍼
export const api = {
  discord: {
    guilds: () => `${config.apiBaseUrl}/api/admin/discord/guilds`,
    guildCategories: (guildId: string) =>
      `${config.apiBaseUrl}/api/admin/discord/guilds/${guildId}/categories`,
    guildMembers: (guildId: string) =>
      `${config.apiBaseUrl}/api/admin/discord/guilds/${guildId}/members`,
    syncMembers: (guildId: string) =>
      `${config.apiBaseUrl}/api/admin/discord/guilds/${guildId}/sync-members`,
    channelMembers: (channelId: string) =>
      `${config.apiBaseUrl}/api/admin/discord/channels/${channelId}/members`,
    channelMember: (channelId: string, discordId: string) =>
      `${config.apiBaseUrl}/api/admin/discord/channels/${channelId}/members/${discordId}`,
  },
};
