import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function AdminLeads() {
  const [leads, setLeads] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [selectedQuizId, setSelectedQuizId] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [aiResults, setAiResults] = useState({})
  const [loadingAiId, setLoadingAiId] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      let query = supabase
        .from("answers")
        .select("*")

      if (selectedStatus) {
        query = query.eq("status", selectedStatus)
      } else {
        query = query.neq("status", "archivados")
      }

      const { data: leadsData, error: leadsError } = await query
        .order("created_at", { ascending: false })

      if (leadsError) {
        console.error("Error cargando leads:", leadsError)
        return
      }

      const { data: quizzesData, error: quizzesError } = await supabase
        .from("quizzes")
        .select("id, title")
        .order("created_at", { ascending: false })

      if (quizzesError) {
        console.error("Error cargando quizzes:", quizzesError)
        return
      }

      setLeads(leadsData || [])
      setQuizzes(quizzesData || [])
    }

    fetchData()
  }, [])

  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from("answers")
      .update({ status: newStatus })
      .eq("id", id)

    if (error) {
      alert("Error actualizando estado")
      return
    }

    // 👇 actualiza estado en UI sin recargar
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id ? { ...lead, status: newStatus } : lead
      )
    )
  }

  const generateProposal = async (lead) => {
    try {
      setLoadingAiId(lead.id)

      const response = await fetch("/api/generate-proposal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          quizTitle: quizzes.find((q) => q.id === lead.quiz_id)?.title || "Quiz",
          answers: lead.data || {},
          leadName: lead.name || "",
          leadPhone: lead.phone || ""
        })
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Error generando propuesta IA")
        return
      }

      setAiResults((prev) => ({
        ...prev,
        [lead.id]: data
      }))
    } catch (error) {
      console.error(error)
      alert("Error generando propuesta IA")
    } finally {
      setLoadingAiId(null)
    }
  }

  const copyAiReply = async (leadId) => {
    const reply = aiResults[leadId]?.whatsapp_reply

    if (!reply) {
      alert("Primero genera una propuesta IA")
      return
    }

    try {
      await navigator.clipboard.writeText(reply)
      alert("Respuesta IA copiada")
    } catch (error) {
      console.error(error)
      alert("No se pudo copiar la respuesta")
    }
  }

  const openWhatsAppWithAiReply = async (lead) => {
    const reply = aiResults[lead.id]?.whatsapp_reply

    if (!reply) {
      alert("Primero genera una propuesta IA")
      return
    }

    const cleanPhone = String(lead.phone || "").replace(/\D/g, "")

    if (!cleanPhone) {
      alert("Este lead no tiene teléfono")
      return
    }

    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(reply)}`

    const { error } = await supabase
      .from("answers")
      .update({ status: "contactado" })
      .eq("id", lead.id)

    if (error) {
      alert("No se pudo actualizar el estado a contactado")
      return
    }

    setLeads((prev) =>
      prev.map((item) =>
        item.id === lead.id ? { ...item, status: "contactado" } : item
      )
    )

    window.location.href = url
  }

  const getStatusColor = (status) => {
    if (status === "nuevo") return "#3182ce"
    if (status === "contactado") return "#d69e2e"
    if (status === "cerrado") return "#38a169"
    return "#718096"
  }

  const filteredLeads = leads.filter((lead) => {
    const leadDate = new Date(lead.created_at)
    const from = fromDate ? new Date(fromDate + "T00:00:00") : null
    const to = toDate ? new Date(toDate + "T23:59:59") : null
    const status = lead.status || "nuevo"

    if (from && leadDate < from) return false
    if (to && leadDate > to) return false
    if (selectedQuizId && lead.quiz_id !== selectedQuizId) return false
    if (selectedStatus && status !== selectedStatus) return false

    return true
  })

  const statusPriority = {
    nuevo: 0,
    contactado: 1,
    cerrado: 2,
    archived: 3
  }

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    const statusA = a.status || "nuevo"
    const statusB = b.status || "nuevo"

    const priorityA = statusPriority[statusA] ?? 99
    const priorityB = statusPriority[statusB] ?? 99

    if (priorityA !== priorityB) {
      return priorityA - priorityB
    }

    return new Date(b.created_at) - new Date(a.created_at)
  })

  const newCount = filteredLeads.filter((lead) => (lead.status || "nuevo") === "nuevo").length
  const contactedCount = filteredLeads.filter((lead) => lead.status === "contactado").length
  const closedCount = filteredLeads.filter((lead) => lead.status === "cerrado").length
  const archivedCount = leads.filter((lead) => lead.status === "archived").length

  return (
    <div style={{ padding: 30, background: "#f7fafc", minHeight: "100vh" }}>
      <h1 style={{ marginBottom: 20 }}>Leads del Quiz</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          marginBottom: 24
        }}
      >
        <div style={{ background: "#fff", padding: 16, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <p style={{ margin: 0, color: "#718096" }}>Nuevos</p>
          <h2 style={{ margin: "8px 0 0", color: "#3182ce" }}>{newCount}</h2>
        </div>

        <div style={{ background: "#fff", padding: 16, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <p style={{ margin: 0, color: "#718096" }}>Contactados</p>
          <h2 style={{ margin: "8px 0 0", color: "#d69e2e" }}>{contactedCount}</h2>
        </div>

        <div style={{ background: "#fff", padding: 16, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <p style={{ margin: 0, color: "#718096" }}>Cerrados</p>
          <h2 style={{ margin: "8px 0 0", color: "#38a169" }}>{closedCount}</h2>
        </div>

        <div style={{ background: "#fff", padding: 16, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <p style={{ margin: 0, color: "#718096" }}>Archivados</p>
          <h2 style={{ margin: "8px 0 0", color: "#2d3748" }}>{archivedCount}</h2>
        </div>

        <div style={{ background: "#fff", padding: 16, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <p style={{ margin: 0, color: "#718096" }}>Total</p>
          <h2 style={{ margin: "8px 0 0", color: "#2d3748" }}>{filteredLeads.length}</h2>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 20,
          alignItems: "end"
        }}
      >
        <div>
          <label style={{ display: "block", marginBottom: 6, fontWeight: "bold" }}>
            Desde
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e0" }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6, fontWeight: "bold" }}>
            Hasta
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e0" }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6, fontWeight: "bold" }}>
            Quiz
          </label>
          <select
            value={selectedQuizId}
            onChange={(e) => setSelectedQuizId(e.target.value)}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e0", minWidth: 220 }}
          >
            <option value="">Todos los quizzes</option>
            {quizzes.map((quiz) => (
              <option key={quiz.id} value={quiz.id}>
                {quiz.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6, fontWeight: "bold" }}>
            Estado
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e0", minWidth: 180 }}
          >
            <option value="">Todos</option>
            <option value="nuevo">🆕 Nuevo</option>
            <option value="contactado">💬 Contactado</option>
            <option value="cerrado">✅ Cerrado</option>
            <option value="archived">📦 Archivados</option>
          </select>
        </div>

        <button
          onClick={() => {
            setFromDate("")
            setToDate("")
            setSelectedQuizId("")
            setSelectedStatus("")
          }}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            background: "#718096",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Limpiar filtros
        </button>
      </div>

      <p style={{ marginBottom: 20, color: "#4a5568" }}>
        Mostrando {filteredLeads.length} lead{filteredLeads.length === 1 ? "" : "s"}
      </p>

      {sortedLeads.length === 0 ? (
        <p>No hay leads con esos filtros</p>
      ) : (
        sortedLeads.map((lead) => (
          <div
            key={lead.id}
            style={{
              marginBottom: 20,
              padding: 18,
              borderRadius: 12,
              background: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
            }}
          >
            <p><strong>Nombre:</strong> {lead.name || "Sin nombre"}</p>
            <p><strong>Teléfono:</strong> {lead.phone || "Sin teléfono"}</p>
            <p><strong>Quiz:</strong> {quizzes.find((q) => q.id === lead.quiz_id)?.title || lead.quiz_id}</p>

            <div style={{ marginTop: 10, marginBottom: 10 }}>
              <p style={{ marginBottom: 6 }}><strong>Estado:</strong></p>
              <select
                value={lead.status || "nuevo"}
                onChange={(e) => updateStatus(lead.id, e.target.value)}
                style={{
                  padding: 8,
                  borderRadius: 6,
                  border: "1px solid #cbd5e0",
                  marginRight: 10
                }}
              >
                <option value="nuevo">🆕 Nuevo</option>
                <option value="contactado">💬 Contactado</option>
                <option value="cerrado">✅ Cerrado</option>
              </select>

              <span
                style={{
                  color: getStatusColor(lead.status || "nuevo"),
                  fontWeight: "bold",
                  marginLeft: 8
                }}
              >
                {lead.status || "nuevo"}
              </span>
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a
                href={`https://wa.me/${String(lead.phone || "").replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: "#25D366",
                  color: "#fff",
                  textDecoration: "none",
                  fontWeight: "bold"
                }}
              >
                Abrir WhatsApp
              </a>

              <button
                onClick={() => navigator.clipboard.writeText(lead.phone || "")}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: "#3182ce",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                Copiar número
              </button>

              <button
                onClick={() => generateProposal(lead)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: "#2d3748",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                {loadingAiId === lead.id ? "Generando..." : "Generar propuesta IA"}
              </button>

              <button
                onClick={() => copyAiReply(lead.id)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: "#805ad5",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                Copiar respuesta IA
              </button>

              <button
                onClick={() => openWhatsAppWithAiReply(lead)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: "#dd6b20",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                WhatsApp con IA
              </button>

              <button
                onClick={() => updateStatus(lead.id, "archived")}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: "#ecc94b",
                  color: "#1a202c",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                📦 Archivar
              </button>

            </div>

            <p style={{ marginTop: 12 }}>
              <strong>Fecha:</strong> {new Date(lead.created_at).toLocaleString()}
            </p>

            <div style={{ marginTop: 10 }}>
              <strong>Respuestas:</strong>
              {Object.entries(lead.data || {}).map(([qId, value]) => (
                <p key={qId} style={{ marginLeft: 10 }}>
                  • {String(value)}
                </p>
              ))}
            </div>

            {aiResults[lead.id] && (
              <div
                style={{
                marginTop: 16,
                padding: 14,
                borderRadius: 10,
                background: "#f8fafc",
                border: "1px solid #e2e8f0"
              }}
            >
              <p style={{ marginBottom: 8 }}>
                <strong>Perfil detectado:</strong> {aiResults[lead.id].client_profile}
              </p>

              <p style={{ marginBottom: 8 }}>
                <strong>Dirección de diseño:</strong> {aiResults[lead.id].design_direction}
              </p>

              <p style={{ marginBottom: 8 }}>
                <strong>Tamaño sugerido:</strong> {aiResults[lead.id].suggested_size}
              </p>

              <p style={{ marginBottom: 8 }}>
                <strong>Zona recomendada:</strong> {aiResults[lead.id].suggested_body_area}
              </p>

              <p style={{ marginBottom: 8 }}>
                <strong>Complejidad:</strong> {aiResults[lead.id].complexity_level}
              </p>

              <p style={{ marginBottom: 8 }}>
                <strong>Notas profesionales:</strong> {aiResults[lead.id].professional_notes}
              </p>
 
              <div style={{ marginTop: 12 }}>
                <strong>Respuesta sugerida para WhatsApp:</strong>
                <div
                  style={{
                    marginTop: 8,
                    padding: 12,
                    borderRadius: 8,
                    background: "#fff",
                    border: "1px solid #cbd5e0",
                    whiteSpace: "pre-wrap"
                  }}
                >
                  {aiResults[lead.id].whatsapp_reply}
                </div>
              </div>
            </div>
          )}
          </div>
        ))
      )}
    </div>
  )
}