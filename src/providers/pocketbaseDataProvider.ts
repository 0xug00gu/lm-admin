import { DataProvider } from "@refinedev/core";
import PocketBase from "pocketbase";

// Singleton PocketBase instance
let pbInstance: PocketBase | null = null;
let isAuthenticating = false;
let authPromise: Promise<void> | null = null;
let savedCredentials: { email: string; password: string } | null = null;

// Export function to get PocketBase instance (with auth) - async version
export const getPocketBaseInstance = async (): Promise<PocketBase | null> => {
  if (!pbInstance) return null;

  // 이미 인증됨
  if (pbInstance.authStore.isValid) {
    return pbInstance;
  }

  // 인증 진행 중이면 대기
  if (isAuthenticating && authPromise) {
    await authPromise;
    return pbInstance;
  }

  // 인증 시도
  if (savedCredentials?.email && savedCredentials?.password) {
    isAuthenticating = true;
    authPromise = (async () => {
      try {
        await pbInstance!.admins.authWithPassword(savedCredentials!.email, savedCredentials!.password);
      } catch (error) {
        console.error("PocketBase auth failed:", error);
      } finally {
        isAuthenticating = false;
      }
    })();
    await authPromise;
  }

  return pbInstance;
};

// Sync version (for backwards compatibility, but may not be authenticated)
export const getPocketBaseInstanceSync = (): PocketBase | null => {
  return pbInstance;
};

export const pocketbaseDataProvider = (
  apiUrl: string,
  email?: string,
  password?: string
): DataProvider => {
  // Use singleton instance
  if (!pbInstance) {
    pbInstance = new PocketBase(apiUrl);
  }
  const pb = pbInstance;

  // Save credentials for later use
  if (email && password) {
    savedCredentials = { email, password };
  }

  // Auto-login as admin if credentials provided
  const ensureAuth = async () => {
    // If already authenticated, return immediately
    if (pb.authStore.isValid) {
      return;
    }

    // If authentication is in progress, wait for it
    if (isAuthenticating && authPromise) {
      await authPromise;
      return;
    }

    // Start authentication
    if (email && password) {
      isAuthenticating = true;
      authPromise = (async () => {
        try {
          await pb.admins.authWithPassword(email, password);
        } catch (error: any) {
          console.error("❌ PocketBase authentication failed:", error);
        } finally {
          isAuthenticating = false;
        }
      })();
      await authPromise;
    }
  };

  return {
    getList: async ({ resource, pagination, filters, sorters, meta }) => {
      await ensureAuth();

      const page = pagination?.current || 1;
      const perPage = pagination?.pageSize || 10;

      // Build PocketBase filter string from refine filters
      let filterStr = "";
      if (filters && filters.length > 0) {
        const filterParts = filters
          .map((filter: any) => {
            const { field, operator, value } = filter;
            if (value === undefined || value === null || value === "") {
              return null;
            }
            switch (operator) {
              case "eq":
                return `${field}="${value}"`;
              case "ne":
                return `${field}!="${value}"`;
              case "contains":
                return `${field}~"${value}"`;
              case "gt":
                return `${field}>"${value}"`;
              case "gte":
                return `${field}>="${value}"`;
              case "lt":
                return `${field}<"${value}"`;
              case "lte":
                return `${field}<="${value}"`;
              default:
                return `${field}="${value}"`;
            }
          })
          .filter(Boolean);
        filterStr = filterParts.join(" && ");
      }

      // Build sort string from refine sorters
      let sortStr = "";
      if (sorters && sorters.length > 0) {
        sortStr = sorters
          .map((sorter: any) => {
            const prefix = sorter.order === "desc" ? "-" : "";
            return `${prefix}${sorter.field}`;
          })
          .join(",");
      }

      const result = await pb.collection(resource).getList(page, perPage, {
        expand: meta?.expand,
        filter: filterStr || undefined,
        sort: sortStr || undefined,
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
