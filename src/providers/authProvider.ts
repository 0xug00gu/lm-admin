import { AuthProvider } from "@refinedev/core";
import PocketBase from "pocketbase";
import { config } from "../config/env";

const pb = new PocketBase(config.pocketbaseUrl);

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      const authData = await pb.collection("users").authWithPassword(email, password);

      // 인증 정보 저장
      localStorage.setItem("pb_auth", JSON.stringify({
        token: pb.authStore.token,
        model: authData.record,
      }));

      // verified가 false면 승인 대기 페이지로
      if (!authData.record.verified) {
        return {
          success: true,
          redirectTo: "/pending-approval",
        };
      }

      return {
        success: true,
        redirectTo: "/",
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          name: "LoginError",
          message: "이메일 또는 비밀번호가 올바르지 않습니다.",
        },
      };
    }
  },

  logout: async () => {
    localStorage.removeItem("pb_auth");
    pb.authStore.clear();

    return {
      success: true,
      redirectTo: "/login",
    };
  },

  check: async () => {
    const authDataStr = localStorage.getItem("pb_auth");

    if (!authDataStr) {
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }

    try {
      const authData = JSON.parse(authDataStr);

      // 토큰이 없으면 로그인 페이지로
      if (!authData.token) {
        return {
          authenticated: false,
          redirectTo: "/login",
        };
      }

      // verified가 false면 승인 대기 페이지로
      if (!authData.model?.verified) {
        return {
          authenticated: true,
          redirectTo: "/pending-approval",
        };
      }

      return {
        authenticated: true,
      };
    } catch {
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }
  },

  getPermissions: async () => {
    const authDataStr = localStorage.getItem("pb_auth");
    if (!authDataStr) return null;

    try {
      const authData = JSON.parse(authDataStr);
      return authData.model?.verified ? ["admin"] : ["pending"];
    } catch {
      return null;
    }
  },

  getIdentity: async () => {
    const authDataStr = localStorage.getItem("pb_auth");
    if (!authDataStr) return null;

    try {
      const authData = JSON.parse(authDataStr);
      return {
        id: authData.model?.id,
        name: authData.model?.name || authData.model?.email,
        email: authData.model?.email,
        avatar: authData.model?.avatar,
        verified: authData.model?.verified,
      };
    } catch {
      return null;
    }
  },

  onError: async (error) => {
    if (error.status === 401 || error.status === 403) {
      return {
        logout: true,
        redirectTo: "/login",
        error,
      };
    }

    return { error };
  },
};
