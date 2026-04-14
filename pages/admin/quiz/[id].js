import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { supabase } from "../../../lib/supabase"

export default function QuizAdmin() {
  const router = useRouter()
  const { id } = router.query

  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])

  const [newQuestion, setNewQuestion] = useState("")
  const [selectedQuestionId, setSelectedQuestionId] = useState(null)

  const [editingQuestionId, setEditingQuestionId] = useState(null)

  const [editingOptionId, setEditingOptionId] = useState(null)
  const [editText, setEditText] = useState("")

  const [editImageFile, setEditImageFile] = useState(null)
  const [editImagePreview, setEditImagePreview] = useState("")

  // ✅ NUEVO: estado por pregunta (IMPORTANTE FIX)
  const [optionInputs, setOptionInputs] = useState({})

  useEffect(() => {
    if (!id) return

    const fetchQuiz = async () => {
      const { data: quizData, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", id)
        .maybeSingle()

      if (error) return console.error(error)
      if (!quizData) return console.error("No se encontró el quiz")

      setQuiz(quizData)

      const { data: questionsData } = await supabase
        .from("questions")
        .select("*, options(*)")
        .eq("quiz_id", id)
        .order("position", { ascending: true })

      setQuestions(questionsData || [])
    }

    fetchQuiz()
  }, [id])

  // -------------------------
  // QUESTIONS
  // -------------------------

  const addQuestion = async () => {
    if (!newQuestion) return alert("Escribe una pregunta")

    const { data, error } = await supabase
      .from("questions")
      .insert([{ quiz_id: id, question: newQuestion, type: "multiple" }])
      .select()

    if (error) return alert(error.message)

    setQuestions([...questions, data[0]])
    setNewQuestion("")
  }

  const editQuestion = async (qId) => {
    if (!editText) return alert("Escribe el nuevo texto")

    const { data, error } = await supabase
      .from("questions")
      .update({ question: editText })
      .eq("id", qId)
      .select()

    if (error) return alert(error.message)

    setQuestions(questions.map(q => q.id === qId ? data[0] : q))
    setEditingQuestionId(null)
    setEditText("")
  }

  const deleteQuestion = async (qId) => {
    if (!confirm("¿Seguro que quieres borrar esta pregunta?")) return

    const { error } = await supabase
      .from("questions")
      .delete()
      .eq("id", qId)

    if (error) return alert(error.message)

    setQuestions(questions.filter(q => q.id !== qId))
  }

  // -------------------------
  // OPTIONS INPUT HANDLERS
  // -------------------------

  const setOptionText = (qId, value) => {
    setOptionInputs(prev => ({
      ...prev,
      [qId]: {
        ...(prev[qId] || {}),
        text: value
      }
    }))
  }

  const setOptionImage = (qId, file) => {
    setOptionInputs(prev => ({
      ...prev,
      [qId]: {
        ...(prev[qId] || {}),
        image: file
      }
    }))
  }

  // -------------------------
  // UPLOAD IMAGE
  // -------------------------

  const uploadImage = async (file) => {
    if (!file) return null

    const fileName = `${Date.now()}-${file.name.replace(/\s/g, "_")}`

    const { data: uploadData, error } = await supabase.storage
      .from("quiz-options")
      .upload(fileName, file)

    if (error) {
      console.log("ERROR STORAGE:", error)
      alert(error.message)
      return null
    }

    const { data: urlData } = supabase.storage
      .from("quiz-options")
      .getPublicUrl(fileName)

    return urlData.publicUrl
  }  

  // -------------------------
  // ADD OPTION (FIXED)
  // -------------------------

  const addOption = async (qId) => {
    const input = optionInputs[qId] || {}

    const text = input.text || ""
    const file = input.file || null

    console.log("Texto:", text)
    console.log("File:", file)

    let imageUrl = null

    // 🔥 subir imagen si existe
    if (file) {
      imageUrl = await uploadImage(file)
    }

    if (!text && !imageUrl) {
      return alert("Escribe texto o sube imagen")
    }

    const { data, error } = await supabase
      .from("options")
      .insert([
        {
          question_id: qId,
          text,
          image_url: imageUrl
        }
      ])
      .select()

    if (error) {
      console.log(error)
      return alert(error.message)
    }

    setQuestions(prev =>
      prev.map(q =>
        q.id === qId
        ? { ...q, options: [...(q.options || []), data[0]] }
        : q
      )
    )

    // limpiar SOLO esa pregunta
    setOptionInputs(prev => ({
      ...prev,
      [qId]: {}
    }))

    setSelectedQuestionId(null)
  }

  // -------------------------
  // OPTIONS EDITAR
  // ------------------------- 

  const editOption = async (optionId, questionId) => {
    let imageUrl = null

    const currentQuestion = questions.find(q => q.id === questionId)
    const currentOption = currentQuestion?.options?.find(opt => opt.id === optionId)

    if (!currentOption) {
      alert("No se encontró la opción")
      return
    }

    imageUrl = currentOption.image_url || null

    if (editImageFile) {
      imageUrl = await uploadImage(editImageFile)
      if (!imageUrl) return
    }

    const { error } = await supabase
      .from("options")
      .update({
        text: editText,
        image_url: imageUrl
      })
      .eq("id", optionId)

    if (error) {
      alert("Error al editar opción: " + error.message)
      return
    }

    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map(opt =>
                opt.id === optionId
                  ? {
                      ...opt,
                      text: editText,
                      image_url: imageUrl
                    }
                  : opt
              )
            }
          : q
      )
    )

    setEditingOptionId(null)
    setEditText("")
    setEditImageFile(null)
    setEditImagePreview("")
  } 

  // -------------------------
  // OPTIONS CRUD
  // -------------------------

  const deleteOption = async (optId, qId) => {
    if (!confirm("¿Seguro que quieres borrar esta opción?")) return

    const { error } = await supabase
      .from("options")
      .delete()
      .eq("id", optId)

    if (error) return alert(error.message)

    setQuestions(
      questions.map(q =>
        q.id === qId
          ? { ...q, options: q.options.filter(o => o.id !== optId) }
          : q
      )
    )
  }

  // -------------------------
  // RENDER
  // -------------------------

  if (!quiz) return <p>Cargando quiz...</p>

  return (
    <div
      style={{
        padding: 40,
        fontFamily: "Arial, sans-serif",
        background: "#f0f4f8",
        minHeight: "100vh"
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: 8 }}>Editar Quiz</h1>
      <h2 style={{ textAlign: "center", color: "#2d3748", marginTop: 0 }}>
        {quiz.title}
      </h2>

      <hr style={{ margin: "20px 0" }} />

      {/* NEW QUESTION */}
      <h3>Nueva pregunta</h3>
      <div style={{ display: "flex", marginBottom: 20, gap: 10 }}>
        <input
          placeholder="Escribe la pregunta"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 6,
            border: "1px solid #cbd5e0"
          }}
        />
        <button
          onClick={addQuestion}
          style={{
            padding: "10px 20px",
            borderRadius: 6,
            background: "#3182ce",
            color: "#fff",
            border: "none",
            cursor: "pointer"
          }}
        >
          Agregar
        </button>
      </div>

      {/* EMPTY STATE */}
      {questions.length === 0 && (
        <div
          style={{
            padding: 20,
            background: "#fff",
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            textAlign: "center",
            color: "#4a5568",
            marginBottom: 20
          }}
        >
          Este quiz todavía no tiene preguntas.
        </div>
      )}

      {/* QUESTIONS */}
      {questions.map((q) => (
        <div
          key={q.id}
          style={{
            padding: 15,
            marginBottom: 15,
            background: "#fff",
            borderRadius: 8,
            border: "2px solid #cbd5e0",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
          }}
        >
          <p style={{ fontWeight: "bold", marginBottom: 15 }}>{q.question}</p>

          {/* OPTIONS */}
          {q.options?.map((opt) => (
            <div
              key={opt.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
                padding: "8px 10px",
                background: "#f7fafc",
                borderRadius: 6,
                border: "1px solid #e2e8f0",
                gap: 10
              }}
            >
              {editingOptionId === opt.id ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    placeholder="Editar texto de la opción"
                    style={{
                      padding: 6,
                      borderRadius: 6,
                      border: "1px solid #cbd5e0"
                    }}
                  />

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      setEditImageFile(file)
                      setEditImagePreview(file ? URL.createObjectURL(file) : opt.image_url || "")
                    }}
                  />

                  {editImagePreview && (
                    <img
                      src={editImagePreview}
                      alt="Vista previa de opción"
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: "cover",
                        borderRadius: 8
                      }}
                    />
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                  {opt.image_url && (
                    <img
                      src={opt.image_url}
                      alt={opt.text || "Imagen de opción"}
                      style={{
                        width: 60,
                        height: 60,
                        objectFit: "cover",
                        borderRadius: 6,
                        flexShrink: 0
                      }}
                    />
                  )}

                  <span style={{ color: opt.text ? "#1a202c" : "#718096" }}>
                    {opt.text || "Opción con imagen"}
                  </span>
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center" }}>
                {editingOptionId === opt.id ? (
                  <>
                    <button
                      onClick={() => editOption(opt.id, q.id)}
                      style={{
                        marginRight: 5,
                        color: "green",
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        fontSize: 16
                      }}
                      title="Guardar cambios"
                    >
                      ✔
                    </button>

                    <button
                      onClick={() => {
                        setEditingOptionId(null)
                        setEditText("")
                        setEditImageFile(null)
                        setEditImagePreview("")
                      }}
                      style={{
                        marginRight: 5,
                        color: "#718096",
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        fontSize: 16
                      }}
                      title="Cancelar edición"
                    >
                      ↺
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setEditingOptionId(opt.id)
                      setEditText(opt.text || "")
                      setEditImageFile(null)
                      setEditImagePreview(opt.image_url || "")
                    }}
                    style={{
                      marginRight: 5,
                      color: "orange",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      fontSize: 16
                    }}
                    title="Editar opción"
                  >
                    ✏
                  </button>
                )}

                <button
                  onClick={() => deleteOption(opt.id, q.id)}
                  style={{
                    color: "red",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: 16
                  }}
                  title="Borrar opción"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}

          {/* ADD OPTION */}
          {selectedQuestionId === q.id ? (
            <div
              style={{
                marginTop: 10,
                display: "flex",
                gap: 10,
                alignItems: "center",
                flexWrap: "wrap"
              }}
            >
              <input
                value={optionInputs[q.id]?.text || ""}
                onChange={(e) => setOptionText(q.id, e.target.value)}
                placeholder="Nueva opción"
                style={{
                  flex: 1,
                  minWidth: 220,
                  padding: 6,
                  borderRadius: 6,
                  border: "1px solid #cbd5e0"
                }}
              />

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setOptionInputs((prev) => ({
                    ...prev,
                    [q.id]: {
                      ...(prev[q.id] || {}),
                      file: e.target.files?.[0] || null
                    }
                  }))
                }}
              />

              {optionInputs[q.id]?.file && (
                <img
                  src={URL.createObjectURL(optionInputs[q.id].file)}
                  alt="Vista previa"
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 8,
                    objectFit: "cover"
                  }}
                />
              )}

              <button
                onClick={() => addOption(q.id)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  background: "#38a169",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Añadir
              </button>

              <button
                onClick={() => setSelectedQuestionId(null)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  background: "#718096",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSelectedQuestionId(q.id)}
              style={{
                marginTop: 10,
                padding: "6px 12px",
                borderRadius: 6,
                background: "#3182ce",
                color: "#fff",
                border: "none",
                cursor: "pointer"
              }}
            >
              Añadir opción
            </button>
          )}

          <button
            onClick={() => deleteQuestion(q.id)}
            style={{
              marginTop: 10,
              padding: "6px 12px",
              borderRadius: 6,
              background: "red",
              color: "#fff",
              border: "none",
              cursor: "pointer"
            }}
          >
            Borrar pregunta
          </button>
        </div>
      ))}
    </div>
  )
}