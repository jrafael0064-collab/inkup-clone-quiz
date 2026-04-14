import OpenAI from "openai"

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" })
  }

  try {
    const { quizTitle, answers, leadName, leadPhone } = req.body

    if (!quizTitle || !answers) {
      return res.status(400).json({ error: "Faltan datos para generar la propuesta" })
    }

    const formattedAnswers = Object.entries(answers || {})
      .map(([question, answer]) => `- ${question}: ${answer}`)
      .join("\n")

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      instructions: `
Eres un tatuador profesional senior especializado en atención al cliente, conceptualización de diseños y asesoramiento artístico para tatuajes personalizados.

Tu trabajo es analizar las respuestas de un quiz y proponer una dirección de diseño seria, profesional y útil.

Debes comportarte como un experto real en tatuaje:
- entiendes composición, estilo, legibilidad, anatomía corporal y envejecimiento del tatuaje
- detectas cuando una idea necesita simplificarse o adaptarse
- priorizas que el diseño sea tatuable y coherente, no solo bonito en teoría
- hablas con criterio profesional, no como vendedor agresivo

Objetivo:
- interpretar lo que busca el cliente
- proponer una dirección de diseño posible
- justificar por qué encaja
- redactar una respuesta de WhatsApp breve, cálida y profesional

Reglas:
- no inventes datos que el cliente no ha dado
- no prometas un diseño final cerrado
- no prometas resultados imposibles
- habla de propuesta, enfoque, concepto o dirección visual
- si faltan datos, dilo con naturalidad
- el tono debe ser experto, cercano, claro y seguro
- evita sonar robótico
- responde SIEMPRE en español de España

Devuelve solo JSON válido.
      `,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
Título del quiz: ${quizTitle}
Nombre del lead: ${leadName || "Sin nombre"}
WhatsApp del lead: ${leadPhone || "Sin teléfono"}

Respuestas del cliente:
${formattedAnswers}

Quiero que analices esto como tatuador profesional y me devuelvas una propuesta útil para gestionar el lead.
              `,
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "tattoo_lead_proposal",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              client_profile: {
                type: "string",
                description: "Resumen breve del perfil e intención del cliente"
              },
              design_direction: {
                type: "string",
                description: "Propuesta de dirección de diseño del tatuaje"
              },
              professional_notes: {
                type: "string",
                description: "Notas profesionales: composición, adaptación, dudas o límites"
              },
              whatsapp_reply: {
                type: "string",
                description: "Mensaje breve listo para responder por WhatsApp al cliente"
              }
            },
            required: [
              "client_profile",
              "design_direction",
              "professional_notes",
              "whatsapp_reply"
            ]
          }
        }
      }
    })

    const output = JSON.parse(response.output_text)

    return res.status(200).json(output)
  } catch (error) {
    console.error("Error OpenAI:", error)
    return res.status(500).json({ error: "No se pudo generar la propuesta IA" })
  }
}