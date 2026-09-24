// Server-side compatibility bridge replacing Supabase server client with safe handlers.
import { prisma, isDatabaseAvailable } from "@/lib/prisma.server";

export function createSupabaseServerClient() {
  return {
    prisma,
    isDatabaseAvailable,
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
    auth: {
      async getUser() {
        return { data: { user: null }, error: null };
      },
    },
  };
}
