// Mock Supabase clients for local development

export function createClient() {
  return {
    auth: {
      getUser: async () => ({
        data: {
          user: {
            id: "local-user-1",
            email: "admin@local.dev"
          }
        },
        error: null
      }),
      signInWithOtp: async ({ email }: { email: string }) => ({
        data: { user: null, session: null },
        error: null,
      }),
      signOut: async () => ({ error: null }),
    },
    storage: {
      from: (bucket: string) => ({
        upload: async (path: string, file: File) => ({
          data: { path: `mock/${path}` },
          error: null,
        }),
        getPublicUrl: (path: string) => ({
          data: { publicUrl: `/api/mock-storage/${path}` },
        }),
        remove: async (paths: string[]) => ({ error: null }),
      }),
    },
  };
}

export async function createServerClient() {
  return createClient();
}

export const createBrowserClient = createClient;