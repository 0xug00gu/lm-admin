import { DataProvider } from "@refinedev/core";
import PocketBase from "pocketbase";

// Singleton PocketBase instance
let pbInstance: PocketBase | null = null;
let isAuthenticating = false;
let authPromise: Promise<void> | null = null;

export const pocketbaseDataProvider = (
  apiUrl: string,
  email?: string,
  password?: string
): DataProvider => {
  // Use singleton instance
  if (!pbInstance) {
    pbInstance = new PocketBase(apiUrl);
    console.log("🔧 PocketBase instance created");
    console.log("📍 API URL:", apiUrl);
    console.log("📧 Email:", email ? `${email.substring(0, 3)}***` : "NOT PROVIDED");
    console.log("🔑 Password:", password ? "***PROVIDED***" : "NOT PROVIDED");
  }
  const pb = pbInstance;

  // Auto-login as admin if credentials provided
  const ensureAuth = async () => {
    // If already authenticated, return immediately
    if (pb.authStore.isValid) {
      console.log("✅ Already authenticated");
      return;
    }

    // If authentication is in progress, wait for it
    if (isAuthenticating && authPromise) {
      console.log("⏳ Waiting for authentication in progress...");
      await authPromise;
      return;
    }

    // Start authentication
    if (email && password) {
      console.log("🔐 Starting authentication...");
      isAuthenticating = true;
      authPromise = (async () => {
        try {
          console.log("📤 Sending auth request to:", `${apiUrl}/api/admins/auth-with-password`);
          const authData = await pb.admins.authWithPassword(email, password);
          console.log("✅ PocketBase admin authenticated");
          console.log("👤 Admin:", authData.admin?.email);
          console.log("🎫 Auth token:", pb.authStore.token ? "Present" : "Missing");
        } catch (error: any) {
          console.error("❌ PocketBase authentication failed:", error);
          console.error("📋 Error details:", {
            url: error.url,
            status: error.status,
            data: error.data,
            isAbort: error.isAbort,
          });
        } finally {
          isAuthenticating = false;
        }
      })();
      await authPromise;
    } else {
      console.warn("⚠️ No credentials provided for authentication");
    }
  };

  return {
    getList: async ({ resource, pagination, filters, sorters, meta }) => {
      await ensureAuth();

      const page = pagination?.current || 1;
      const perPage = pagination?.pageSize || 10;

      const result = await pb.collection(resource).getList(page, perPage, {
        expand: meta?.expand,
      });

      return {
        data: result.items,
        total: result.totalItems,
      };
    },

    getOne: async ({ resource, id, meta }) => {
      await ensureAuth();

      const record = await pb.collection(resource).getOne(id, {
        expand: meta?.expand,
      });

      return {
        data: record,
      };
    },

    create: async ({ resource, variables }) => {
      await ensureAuth();

      const record = await pb.collection(resource).create(variables);

      return {
        data: record,
      };
    },

    update: async ({ resource, id, variables }) => {
      await ensureAuth();

      const record = await pb.collection(resource).update(id, variables);

      return {
        data: record,
      };
    },

    deleteOne: async ({ resource, id }) => {
      await ensureAuth();

      await pb.collection(resource).delete(id);

      return {
        data: {} as any,
      };
    },

    getApiUrl: () => apiUrl,

    custom: async ({ url, method, payload, headers }) => {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: payload ? JSON.stringify(payload) : undefined,
      });

      const data = await response.json();

      return {
        data,
      };
    },
  };
};
