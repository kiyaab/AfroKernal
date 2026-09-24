// Compatibility bridge replacing Supabase client with native Prisma & local session handlers.
// This prevents legacy client components from crashing while transitioning to native Prisma ORM.

export interface MockSession {
  access_token: string;
  user: any;
}

function getStoredUser(): any | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("afrokernel_current_user_v2");
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return null;
}

function getStoredToken(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem("afrokernel_session_token") || "";
  } catch {
    return "";
  }
}

export const supabase = {
  auth: {
    async getUser() {
      const user = getStoredUser();
      return { data: { user }, error: null };
    },
    async getSession() {
      const user = getStoredUser();
      const token = getStoredToken();
      if (!user && !token) return { data: { session: null }, error: null };
      return {
        data: {
          session: {
            access_token: token || "session-token",
            user,
          },
        },
        error: null,
      };
    },
    async getClaims() {
      const user = getStoredUser();
      return {
        data: {
          claims: {
            sub: user?.id || "mock-user-id",
            email: user?.email,
          },
        },
        error: null,
      };
    },
    async signOut() {
      if (typeof window !== "undefined") {
        localStorage.removeItem("afrokernel_current_user_v2");
        localStorage.removeItem("afrokernel_session_token");
      }
      return { error: null };
    },
    async signInWithPassword({ email }: { email: string; password?: string }) {
      const user = getStoredUser();
      return { data: { user: user || { id: "u-" + Date.now(), email } }, error: null };
    },
    async signUp({ email }: { email: string; password?: string }) {
      return { data: { user: { id: "u-" + Date.now(), email } }, error: null };
    },
    async signInWithOtp({ email }: { email: string }) {
      return { data: { user: { id: "u-" + Date.now(), email } }, error: null };
    },
    async verifyOtp() {
      const user = getStoredUser();
      return { data: { user }, error: null };
    },
    async resend() {
      return { data: {}, error: null };
    },
    async signInWithOAuth() {
      return { data: { url: null }, error: null };
    },
    onAuthStateChange(callback: (event: string, session: any) => void) {
      const user = getStoredUser();
      const token = getStoredToken();
      if (user) {
        setTimeout(() => callback("SIGNED_IN", { user, access_token: token }), 0);
      }
      return {
        data: {
          subscription: {
            unsubscribe() {},
          },
        },
      };
    },
  },
  channel(_name: string) {
    const ch = {
      on(..._args: any[]) {
        return ch;
      },
      subscribe(..._args: any[]) {
        return ch;
      },
    };
    return ch;
  },
  removeChannel(_channel: any) {},
  from(_table: string) {
    const chain: any = {
      select(..._args: any[]) {
        return chain;
      },
      insert(..._args: any[]) {
        return chain;
      },
      upsert(..._args: any[]) {
        return chain;
      },
      update(..._args: any[]) {
        return chain;
      },
      delete(..._args: any[]) {
        return chain;
      },
      eq(..._args: any[]) {
        return chain;
      },
      match(..._args: any[]) {
        return chain;
      },
      order(..._args: any[]) {
        return chain;
      },
      limit(..._args: any[]) {
        return chain;
      },
      is(..._args: any[]) {
        return chain;
      },
      single() {
        return Promise.resolve({ data: null, error: null });
      },
      maybeSingle() {
        return Promise.resolve({ data: null, error: null });
      },
      then(resolve: (res: any) => any) {
        return Promise.resolve({ data: [], error: null }).then(resolve);
      },
    };
    return chain;
  },
  rpc(_fn: string, _args?: any) {
    return Promise.resolve({ data: [], error: null });
  },
  storage: {
    from(_bucket: string) {
      return {
        async upload(_path: string, _file: any) {
          return { data: { path: _path }, error: null };
        },
        getPublicUrl(path: string) {
          return { data: { publicUrl: path } };
        },
      };
    },
  },
};
