import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function escapeSql(val: unknown): string {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (typeof val === "object") return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
  return `'${String(val).replace(/'/g, "''")}'`;
}

function buildInserts(table: string, rows: Record<string, unknown>[], excludeCols: string[] = []): string {
  if (!rows.length) return `-- No data in ${table}\n`;
  const cols = Object.keys(rows[0]).filter((c) => !excludeCols.includes(c));
  const lines = rows.map((row) => {
    const vals = cols.map((c) => escapeSql(row[c]));
    return `(${vals.join(", ")})`;
  });
  return `INSERT INTO public.${table} (${cols.join(", ")}) VALUES\n${lines.join(",\n")}\nON CONFLICT DO NOTHING;\n\n`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify admin
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role for full data access
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch all tables
    const [exams, examSections, questions, subQuestions, profiles, userRoles, userCredits, examAttempts] =
      await Promise.all([
        adminClient.from("exams").select("*").order("created_at"),
        adminClient.from("exam_sections").select("*").order("exam_id, sort_order"),
        adminClient.from("questions").select("*").order("exam_id, sort_order"),
        adminClient.from("sub_questions").select("*").order("question_id, sort_order"),
        adminClient.from("profiles").select("*").order("created_at"),
        adminClient.from("user_roles").select("*"),
        adminClient.from("user_credits").select("*").order("created_at"),
        adminClient.from("exam_attempts").select("*").order("created_at"),
      ]);

    // Build SQL
    let sql = `-- ============================================================
-- ICAN CBT Platform — Complete Database Export
-- Generated: ${new Date().toISOString()}
-- ============================================================
-- INSTRUCTIONS:
-- 1. First run the schema from full-schema.sql (creates tables, RLS, triggers)
-- 2. Then run THIS file to import all data
-- 3. Note: User accounts must be recreated via Supabase Auth
--    (profiles/roles data below assumes matching auth.users UUIDs)
-- ============================================================

`;

    // Content tables (no auth dependency)
    sql += "-- ===================== EXAMS =====================\n";
    sql += buildInserts("exams", exams.data || []);

    sql += "-- ===================== EXAM_SECTIONS =====================\n";
    sql += buildInserts("exam_sections", examSections.data || []);

    sql += "-- ===================== QUESTIONS =====================\n";
    sql += buildInserts("questions", questions.data || []);

    sql += "-- ===================== SUB_QUESTIONS =====================\n";
    sql += buildInserts("sub_questions", subQuestions.data || []);

    // User-related tables (will need matching auth.users)
    sql += "-- ===================== PROFILES =====================\n";
    sql += "-- NOTE: These require matching users in auth.users first\n";
    sql += buildInserts("profiles", profiles.data || []);

    sql += "-- ===================== USER_ROLES =====================\n";
    sql += buildInserts("user_roles", userRoles.data || []);

    sql += "-- ===================== USER_CREDITS =====================\n";
    sql += buildInserts("user_credits", userCredits.data || []);

    sql += "-- ===================== EXAM_ATTEMPTS =====================\n";
    sql += buildInserts("exam_attempts", examAttempts.data || []);

    return new Response(sql, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": "attachment; filename=ican-cbt-data-export.sql",
      },
    });
  } catch (e) {
    console.error("export-database error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
