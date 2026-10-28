export const SUPABASE_URL = "https://qtrppoeefvzyhwywmcjb.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_5UmtL6FRiv7Uza2KPfI2zg_75JWTqjo";

export function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined);
    if (init?.headers) new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    if (headers.get("Authorization") === `Bearer ${supabaseKey}`) headers.delete("Authorization");
    headers.set("apikey", supabaseKey);
    return fetch(input, { ...init, headers });
  };
}
