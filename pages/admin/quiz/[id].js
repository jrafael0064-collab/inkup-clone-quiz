import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { supabase } from "../../../lib/supabase"

export default function QuizAdmin() {
  const router = useRouter()
  const { id } = router.query

  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [newQuestion, setNewQuestion] = useState("")
  const [newOption, setNewOption] = useState("")
  const [selectedQuestionId, setSelectedQuestionId] = useState(null)
  const [editingQuestionId, setEditingQuestionId] = useState(null)
  const [editingOptionId, setEditingOptionId] = useState(null)
  const [editText, setEditText] = useState("")
  const [newImage, setNewImage] = useState(null)

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

  // Añadir pregunta
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

  // Editar pregunta
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

  // Borrar pregunta
  const deleteQuestion = async (qId) => {
    if (!confirm("¿Seguro que quieres borrar esta pregunta?")) return

    const { error } = await supabase
      .from("questions")
      .delete()
      .eq("id", qId)

    if (error) return alert(error.message)
    setQuestions(questions.filter(q => q.id !== qId))
  }

  // Añadir opción
  const addOption = async (qId) => {

    let imageUrl = null

    if (newImage) {
      imageUrl = await uploadImage(newImage)
    }

    if (!newOption && !imageUrl) {
      return alert("Escribe una opción o sube una imagen")
    }

    const { data, error } = await supabase
      .from("options")
      .insert([
        {
          question_id: qId,
          text: newOption,
          image_url: imageUrl
        }
      ])
      .select()

    if (error) return alert(error.message)

    setQuestions(
      questions.map(q =>
        q.id === qId
          ? { ...q, options: [...(q.options || []), data[0]] }
          : q
      )
    )

    setNewOption("")
    setNewImage(null)
    setSelectedQuestionId(null)
  }
  //subir imagen
  const uploadImage = async (file) => {

    const fileName = Date.now() + "_" + file.name

    const { error } = await supabase.storage
      .from("quiz-options")
      .upload(fileName, file)

    if (error) {
      alert(error.message)
      return null
    }

    const { data } = supabase
      .storage
      .from("quiz-options")
      .getPublicUrl(fileName)

    return data.publicUrl
  }

  // Editar opción
  const editOption = async (optId, qId) => {
    if (!editText) return alert("Escribe el nuevo texto")

    const { data, error } = await supabase
      .from("options")
      .update({ text: editText })
      .eq("id", optId)
      .select()

    if (error) return alert(error.message)

    setQuestions(
      questions.map(q => q.id === qId ? { ...q, options: q.options.map(o => o.id === optId ? data[0] : o) } : q)
    )

    setEditingOptionId(null)
    setEditText("")
  }

  // Borrar opción
  const deleteOption = async (optId, qId) => {
    if (!confirm("¿Seguro que quieres borrar esta opción?")) return

    const { error } = await supabase
      .from("options")
      .delete()
      .eq("id", optId)

    if (error) return alert(error.message)

    setQuestions(
      questions.map(q => q.id === qId ? { ...q, options: q.options.filter(o => o.id !== optId) } : q)
    )
  }

  if (!quiz) return <p>Cargando quiz...</p>

  return (
    <div style={{ padding: 40, fontFamily: "Arial, sans-serif", background: "#f0f4f8", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center" }}>Editar Quiz</h1>
      <h2 style={{ textAlign: "center", color: "#2d3748" }}>{quiz.title}</h2>

      <hr style={{ margin: "20px 0" }} />

      <h3>Nueva pregunta</h3>
      <div style={{ display: "flex", marginBottom: 20 }}>
        <input
          placeholder="Escribe la pregunta"
          value={newQuestion}
          onChange={e => setNewQuestion(e.target.value)}
          style={{ flex: 1, padding: 10, borderRadius: 6, border: "1px solid #cbd5e0" }}
        />
        <button
          onClick={addQuestion}
          style={{ marginLeft: 10, padding: "10px 20px", borderRadius: 6, background: "#3182ce", color: "#fff", border: "none", cursor: "pointer" }}
        >
          Agregar
        </button>
      </div>

      <h3>Preguntas existentes</h3>
      {questions.length === 0 && <p>No hay preguntas todavía</p>}

      {questions.map(q => (
        <div key={q.id} style={{
          padding: 15,
          marginBottom: 15,
          background: "#fff",
          borderRadius: 8,
          border: "2px solid #cbd5e0",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
        }}>
          {editingQuestionId === q.id ? (
            <div style={{ display: "flex", marginBottom: 10 }}>
              <input
                value={editText}
                onChange={e => setEditText(e.target.value)}
                style={{ flex: 1, padding: 6, borderRadius: 6, border: "1px solid #cbd5e0" }}
              />
              <button onClick={() => editQuestion(q.id)} style={{ marginLeft: 5, padding: "6px 12px", borderRadius: 6, background: "#38a169", color: "#fff", border: "none" }}>Guardar</button>
            </div>
          ) : (
            <p style={{ fontWeight: "bold" }}>{q.question}</p>
          )}

          <div style={{ marginBottom: 10 }}>
            {q.options?.map(opt => (
              <div key={opt.id} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 5,
                padding: "5px 10px",
                background: "#f7fafc",
                borderRadius: 6,
                border: "1px solid #e2e8f0"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {opt.image_url && (
                    <img
                      src={opt.image_url}
                      alt="opción"
                      style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6 }}
                    />
                  )}
                  <span>{opt.text}</span>
                </div>
                <div>
                  <button onClick={() => { setEditingOptionId(opt.id); setEditText(opt.text) }} style={{ marginRight: 5, color: "orange", cursor: "pointer", border: "none", background: "transparent" }}>✎</button>
                  <button onClick={() => deleteOption(opt.id, q.id)} style={{ color: "red", cursor: "pointer", border: "none", background: "transparent" }}>✕</button>
                </div>
              </div>
            ))} 
          </div>

          {selectedQuestionId === q.id ? (
            <div style={{ marginTop: 10, display: "flex" }}>
              <input
                value={newOption}
                onChange={e => setNewOption(e.target.value)}
                placeholder="Nueva opción"
                style={{ flex: 1, padding: 6, borderRadius: 6, border: "1px solid #cbd5e0" }}
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewImage(e.target.files[0])}
              />
              <button
                onClick={() => addOption(q.id)}
                style={{ marginLeft: 5, padding: "6px 12px", borderRadius: 6, background: "#38a169", color: "#fff", border: "none", cursor: "pointer" }}
              >
                Añadir
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSelectedQuestionId(q.id)}
              style={{ marginTop: 10, padding: "6px 12px", borderRadius: 6, background: "#3182ce", color: "#fff", border: "none", cursor: "pointer" }}
            >
              Añadir opción
            </button>
          )}

          <button
            onClick={() => deleteQuestion(q.id)}
            style={{ marginTop: 10, padding: "6px 12px", borderRadius: 6, background: "red", color: "#fff", border: "none", cursor: "pointer" }}
          >
            Borrar pregunta
          </button>
        </div>
      ))}
    </div>
  )
}