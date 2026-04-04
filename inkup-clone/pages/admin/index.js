import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/router'

export default function Admin() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState([])
  const [title, setTitle] = useState('')

  useEffect(() => {
    loadQuizzes()
  }, [])

  const loadQuizzes = async () => {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return console.log(error)
    setQuizzes(data || [])
  }

  const createQuiz = async () => {
    if (!title) return alert('Escribe un título')
    const { data, error } = await supabase
      .from('quizzes')
      .insert([{ title }])
      .select()
    if (error) return alert(error.message)

    router.push(`/admin/quiz/${data[0].id}`)
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Panel Admin</h1>
      <button
        onClick={() => router.push("/admin/results")}
        style={{ 
          marginBottom: 20,
          padding: "10px 20px",
          borderRadius: 8,
          border: "none",
          background: "#4f46e5",
          color: "white",
          cursor: "pointer"
        }}
      >
        Gestionar Resultados
      </button>

      <div style={{ marginBottom: 40 }}>
        <h2>Crear nuevo quiz</h2>
        <input
          placeholder="Título del quiz"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: 10, marginRight: 10 }}
        />
        <button onClick={createQuiz}>Crear</button>
      </div>

      <h2>Quizzes existentes</h2>
      {quizzes.length === 0 && <p>No hay quizzes todavía</p>}
      <ul>
        {quizzes.map((quiz) => (
          <li key={quiz.id} style={{ marginBottom: 10 }}>
            {quiz.title}
            <button style={{ marginLeft: 10 }} onClick={() => router.push(`/admin/quiz/${quiz.id}`)}>
              Editar
            </button>
            <button style={{ marginLeft: 10 }} onClick={() => router.push(`/quiz/${quiz.id}`)}>
              Ver quiz
            </button>
            
          </li>
        ))}
      </ul>
    </div>
  )
}