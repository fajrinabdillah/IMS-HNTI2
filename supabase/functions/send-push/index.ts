import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") || "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") || "";
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:admin@hntindonesia.id";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

type Target = { role?: string | null; username?: string | null };
type PushRow = {
  id: string;
  username: string;
  role: string;
  endpoint: string;
  subscription: unknown;
};

function isTargetMatch(row: PushRow, target: Target = {}) {
  if (target.username && row.username === target.username) return true;
  if (target.role && row.role === target.role && !target.username) return true;
  return false;
}

function notificationUrl(link: any) {
  if (!link || typeof link !== "object") return "/";
  const params = new URLSearchParams();
  if (link.view) params.set("view", String(link.view));
  if (link.id) params.set("id", String(link.id));
  const q = params.toString();
  return q ? `/?${q}` : "/";
}

async function fetchSubscriptions() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions?active=eq.true&select=id,username,role,endpoint,subscription`, {
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`subscription_fetch_failed_${res.status}`);
  return await res.json() as PushRow[];
}

async function disableSubscription(endpoint: string) {
  await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions?endpoint=eq.${encodeURIComponent(endpoint)}`, {
    method: "PATCH",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ active: false, updated_at: new Date().toISOString() }),
  }).catch(() => {});
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return Response.json({ ok: false, error: "missing_env" }, { status: 500, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const target: Target = body.target || {};
    const payload = body.payload || {};
    const fromUser = body.fromUser || {};
    const rows = (await fetchSubscriptions()).filter(row => isTargetMatch(row, target));

    const pushPayload = JSON.stringify({
      title: payload.title || "IMS HNTI",
      body: payload.message || payload.body || "Notifikasi baru",
      type: payload.type || "system",
      tag: payload.type || "ims-hnti",
      url: payload.url || notificationUrl(payload.link),
      link: payload.link || null,
      fromUser,
      createdAt: new Date().toISOString(),
    });

    const results = await Promise.allSettled(rows.map(async (row) => {
      try {
        await webpush.sendNotification(row.subscription as any, pushPayload);
        return { id: row.id, ok: true };
      } catch (err: any) {
        if (err?.statusCode === 404 || err?.statusCode === 410) await disableSubscription(row.endpoint);
        return { id: row.id, ok: false, statusCode: err?.statusCode || null, message: err?.message || "send_failed" };
      }
    }));

    return Response.json({ ok: true, matched: rows.length, results }, { headers: corsHeaders });
  } catch (err: any) {
    return Response.json({ ok: false, error: err?.message || "send_push_failed" }, { status: 500, headers: corsHeaders });
  }
});
