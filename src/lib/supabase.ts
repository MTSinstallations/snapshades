import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Whether a real Supabase backend is configured. When false, the app runs in
 * a self-contained "demo mode": auth reports a guest, the cart and projects
 * persist to localStorage, and any cloud query resolves to empty data instead
 * of throwing. This lets the full storefront be used and demoed end-to-end
 * without provisioning a backend.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const DEMO_ERROR = {
  message: 'Supabase is not configured — running in demo mode.',
  name: 'DemoModeError',
} as const;

// A thenable, infinitely-chainable query-builder stand-in. Every PostgREST
// method (select/eq/order/single/insert/upsert/…) returns the same object, and
// awaiting it resolves to `{ data: null, error: null }` so consumer guards like
// `if (error)` / `if (!data)` take their safe path instead of crashing.
function createDemoQuery(): unknown {
  const result = { data: null, error: null, count: null, status: 200, statusText: 'OK' };
  const handler: ProxyHandler<() => void> = {
    get(_target, prop) {
      if (prop === 'then') {
        return (resolve: (v: typeof result) => unknown) => resolve(result);
      }
      if (prop === 'catch' || prop === 'finally') {
        return () => createDemoQuery();
      }
      // Any other property access returns a callable that keeps the chain going.
      return () => createDemoQuery();
    },
    apply() {
      return createDemoQuery();
    },
  };
  return new Proxy(function () {}, handler);
}

function createDemoSupabaseClient(): SupabaseClient {
  const demo = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: (_cb: unknown) => ({
        data: { subscription: { id: 'demo', callback: () => {}, unsubscribe: () => {} } },
      }),
      signUp: async () => ({ data: { user: null, session: null }, error: DEMO_ERROR }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: DEMO_ERROR }),
      signInWithOAuth: async () => ({ data: { provider: 'google', url: null }, error: DEMO_ERROR }),
      signOut: async () => ({ error: null }),
    },
    from: (_table: string) => createDemoQuery(),
    rpc: () => createDemoQuery(),
    functions: {
      invoke: async () => ({ data: null, error: DEMO_ERROR }),
    },
    channel: () => ({
      on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
      subscribe: () => ({ unsubscribe: () => {} }),
    }),
    removeChannel: () => {},
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: DEMO_ERROR }),
        download: async () => ({ data: null, error: DEMO_ERROR }),
        remove: async () => ({ data: null, error: DEMO_ERROR }),
        getPublicUrl: (path: string) => ({ data: { publicUrl: path } }),
      }),
    },
  };
  return demo as unknown as SupabaseClient;
}

export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : createDemoSupabaseClient();
