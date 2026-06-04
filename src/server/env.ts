export function getExaApiKey(): string | undefined {
  return process.env.EXA_API_KEY;
}

export function getOpenAiApiKey(): string | undefined {
  return process.env.OPENAI_API_KEY;
}

export function getSupabaseUrl(): string | undefined {
  return process.env.SUPABASE_URL;
}

export function getSupabaseServiceRoleKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export const exaSearchTimeoutMs = Number(process.env.EXA_SEARCH_TIMEOUT_MS ?? 12000);
export const exaSearchRetries = Number(process.env.EXA_SEARCH_RETRIES ?? 2);
