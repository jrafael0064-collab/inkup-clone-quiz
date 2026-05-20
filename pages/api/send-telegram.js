export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { name, phone, quizId } = req.body

    const botToken = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID
    
    console.log("BOT TOKEN:", botToken)
    console.log("CHAT ID:", chatId) 
    const adminUrl = "https://getinkflow.vercel.app/admin/leads"

    const message = `
🆕 Nuevo lead recibido

👤 Nombre: ${name || "Sin nombre"}
📱 Teléfono: ${phone || "Sin teléfono"}
🎨 Quiz ID: ${quizId}

👉 Abrir panel:
${adminUrl}
`

  const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`

  const telegramResponse = await fetch(telegramUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message
    })
  })

  const telegramData = await telegramResponse.json()

  console.log("TELEGRAM RESPONSE:", telegramData)

  if (!telegramResponse.ok) {
    return res.status(500).json({
      error: "Telegram failed",
      details: telegramData
    })
  }

  return res.status(200).json({ success: true })
}