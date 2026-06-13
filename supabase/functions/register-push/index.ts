import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return Response.json({ ok: false, error: "missing_env" }, { status: 500, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const username = String(body.username || "").trim();
    const role = String(body.role || "").trim();
    const endpoint = String(body.endpoint || body.subscription?.endpoint || "").trim();
    const subscription = body.subscription;
    if (!username || !role || !endpoint || !subscription) {
      return Response.json({ ok: false, error: "invalid_payload" }, { status: 400, headers: corsHeaders });
    }

    const row = {
      username,
      role,
      endpoint,
      subscription,
      user_agent: String(body.user_agent || ""),
      active: true,
      updated_at: new Date().toISOString(),
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions?on_conflict=endpoint`, {
      method: "POST",
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(row),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return Response.json({ ok: false, error: "db_save_failed", status: res.status, detail }, { status: 500, headers: corsHeaders });
    }

    return Response.json({ ok: true }, { headers: corsHeaders });
  } catch (err: any) {
    return Response.json({ ok: false, error: err?.message || "register_push_failed" }, { status: 500, headers: corsHeaders });
  }
});
