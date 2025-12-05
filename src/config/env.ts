// 환경 변수 설정
// Vercel에서는 환경 변수를 Dashboard에서 설정해야 합니다.

export const config = {
  // PocketBase URL
  pocketbaseUrl: import.meta.env.VITE_POCKETBASE_URL || "http://146.56.158.19",

  // PocketBase Admin 인증 (dataProvider용 - 선택적)
  pocketbaseAdminEmail: import.meta.env.VITE_POCKETBASE_ADMIN_EMAIL || "",
  pocketbaseAdminPassword: import.meta.env.VITE_POCKETBASE_ADMIN_PASSWORD || "",

  // API 서버 URL (Discord 관련 API)
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://146.56.158.19",

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
    channelMembers: (channelId: string) =>
      `${config.apiBaseUrl}/api/admin/discord/channels/${channelId}/members`,
    channelMember: (channelId: string, discordId: string) =>
      `${config.apiBaseUrl}/api/admin/discord/channels/${channelId}/members/${discordId}`,
  },
};
