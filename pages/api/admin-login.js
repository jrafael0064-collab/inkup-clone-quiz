export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" })
  }

  const { password } = req.body

  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ error: "Falta ADMIN_PASSWORD en variables de entorno" })
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Contraseña incorrecta" })
  }

  res.setHeader(
    "Set-Cookie",
    "admin-session=ok; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800; Secure"
  )

  return res.status(200).json({ ok: true })
}