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

/** Mirror client isNotificationForUser — all roles/devices that see in-app alert get push. */
const LEADERSHIP_INBOX_ROLES = new Set(["gm", "manager_ops"]);
const ADMIN_WORKFLOW_TYPES = new Set(["sph_request", "spp_request", "sph_ready", "spp_ready"]);

function isPushRecipient(row: PushRow, target: Target = {}, payload: Record<string, unknown> = {}) {
  const type = String(payload?.type || "system");
  const toRole = target.role || null;
  const toUsername = target.username || null;

  if (toUsername && row.username === toUsername) return true;
  if (toRole && row.role === toRole && !toUsername) return true;
  if (toRole === "admin" && !toUsername && LEADERSHIP_INBOX_ROLES.has(row.role) && ADMIN_WORKFLOW_TYPES.has(type)) {
    return true;
  }
  if (row.role === "super_admin" && (toRole || toUsername)) return true;
  return false;
}

function notificationUrl(link: unknown) {
  if (!link || typeof link !== "object") return "/";
  const l = link as Record<string, unknown>;
  const params = new URLSearchParams();
  if (l.view) params.set("view", String(l.view));
  if (l.id) params.set("id", String(l.id));
  const q = params.toString();
  return q ? `/?${q}` : "/";
}

const TITLE_MAP: Record<string, string> = {
  sph_request: "Permintaan SPH Baru",
  spp_request: "Permintaan SPP Baru",
  sph_ready: "SPH Siap Dikirim",
  spp_ready: "SPP Siap Dikirim",
  sph_sent: "SPH Terkirim",
  po_won: "PO Dimenangkan",
  dp_paid: "DP / Deposit Diterima",
  dp_followup: "Follow-up DP",
  invoice_ready: "Invoice Siap",
  billing_due: "Tagihan Jatuh Tempo",
  pnbp_due: "PNBP Jatuh Tempo",
  install_pending: "Instalasi Menunggu",
  training_scheduled: "Jadwal Training",
  shipping_arrived: "Barang Tiba",
  factory_po_sent: "PO ke Pabrik Terkirim",
  factory_dp_paid: "DP Pabrik Dibayar",
  pib_paid: "PIB Terbayar",
  factory_production: "Produksi Pabrik",
  customs_sppb: "SPPB Customs",
  system: "Notifikasi IMS",
};

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

    const matched = (await fetchSubscriptions()).filter((row) => isPushRecipient(row, target, payload));
    const byEndpoint = new Map<string, PushRow>();
    for (const row of matched) {
      if (row.endpoint && !byEndpoint.has(row.endpoint)) byEndpoint.set(row.endpoint, row);
    }
    const rows = [...byEndpoint.values()];

    const type = String(payload.type || "system");
    const pushPayload = JSON.stringify({
      title: payload.title || TITLE_MAP[type] || "IMS HNTI",
      body: payload.message || payload.body || "Notifikasi baru",
      type,
      tag: payload.tag || type || "ims-hnti",
      url: payload.url || notificationUrl(payload.link),
      link: payload.link || null,
      fromUser,
      createdAt: new Date().toISOString(),
    });

    const results = await Promise.allSettled(rows.map(async (row) => {
      try {
        await webpush.sendNotification(row.subscription as webpush.PushSubscription, pushPayload);
        return { id: row.id, username: row.username, role: row.role, ok: true };
      } catch (err: unknown) {
        const e = err as { statusCode?: number; message?: string };
        if (e?.statusCode === 404 || e?.statusCode === 410) await disableSubscription(row.endpoint);
        return { id: row.id, username: row.username, role: row.role, ok: false, statusCode: e?.statusCode || null, message: e?.message || "send_failed" };
      }
    }));

    return Response.json({ ok: true, matched: rows.length, results }, { headers: corsHeaders });
  } catch (err: unknown) {
    const e = err as { message?: string };
    return Response.json({ ok: false, error: e?.message || "send_push_failed" }, { status: 500, headers: corsHeaders });
  }
});
