import { createClient } from "@supabase/supabase-js"

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const adminCookie = req.cookies?.["admin-session"]

  if (adminCookie !== "ok") {
    return res.status(401).json({ error: "Unauthorized" })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data, error } = await supabaseAdmin
    .from("answers")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  return res.status(200).json({ leads: data || [] })
}