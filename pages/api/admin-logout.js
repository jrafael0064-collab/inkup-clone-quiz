export default function handler(req, res) {
  // Borra la cookie de sesión
  res.setHeader(
    "Set-Cookie",
    "admin-session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure"
  )

  return res.status(200).json({ ok: true })
}