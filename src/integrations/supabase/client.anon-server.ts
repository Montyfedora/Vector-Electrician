// Server-side Supabase client using the ANON (publishable) key.
// Unlike client.server.ts (which uses the service-role key and bypasses RLS),
// this client respects Row Level Security. Use it for operations that are
// explicitly allowed by an RLS policy — e.g. public lead capture — so the app
// does NOT depend on SUPABASE_SERVICE_ROLE_KEY being present in the host env.
//
// This is important for portability: Lovable Cloud injects the service-role key
// automatically, but Vercel/Cloudflare do not. Lead capture is the funnel's #1
// conversion event, so it must work with only the publishable key configured.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

function createSupabaseAnonServerClient() {
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY =
    process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    const missing = [
      ...(!SUPABASE_URL ? ["SUPABASE_URL"] : []),
      ...(!SUPABASE_PUBLISHABLE_KEY ? ["SUPABASE_PUBLISHABLE_KEY"] : []),
    ];
    const message = `Missing Supabase environment variable(s): ${missing.join(", ")}.`;
    console.error(`[Supabase] ${message}`);
    throw new Error(message);
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

let _client: ReturnType<typeof createSupabaseAnonServerClient> | undefined;

export const supabaseAnonServer = new Proxy(
  {} as ReturnType<typeof createSupabaseAnonServerClient>,
  {
    get(_, prop, receiver) {
      if (!_client) _client = createSupabaseAnonServerClient();
      return Reflect.get(_client, prop, receiver);
    },
  },
);
