import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/router'

export default function Admin() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState([])
  const [title, setTitle] = useState('')
  const [brandName, setBrandName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [logoFile, setLogoFile] = useState(null)
  const [language, setLanguage] = useState('es')

  const handleLogout = async () => {
    await fetch("/api/admin-logout", { method: "POST" })
    window.location.href = "/admin-login"
  }

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

    let uploadedLogoUrl = logoUrl

    if (logoFile) {
      const fileExt = logoFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `quiz-logos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, logoFile)

      if (uploadError) {
        return alert('Error subiendo logo: ' + uploadError.message)
      }

      const { data: publicUrlData } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath)

      uploadedLogoUrl = publicUrlData.publicUrl
    }

    const { data, error } = await supabase
      .from('quizzes')
      .insert([{
        title,
        brand_name: brandName,
        logo_url: uploadedLogoUrl,
        language
      }])
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

      <button
        onClick={handleLogout}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          padding: "8px 14px",
          borderRadius: 8,
          border: "none",
          background: "#e53e3e",
          color: "#fff",
          fontWeight: "bold",
          cursor: "pointer"
        }}
      >
        Salir
      </button>

      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        style={{ padding: 10, marginRight: 10, marginBottom: 10 }}
      >
        <option value="es">Español</option>
        <option value="en">Inglés</option>
        <option value="fr">Francés</option>
        <option value="de">Alemán</option>
        <option value="it">Italiano</option>
        <option value="pt">Portugués</option>
        <option value="nl">Neerlandés</option>
      </select>

      <br />

      <div style={{ marginBottom: 40 }}>
        <h2>Crear nuevo quiz</h2>

        <input
          placeholder="Título del quiz"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: 10, marginRight: 10, marginBottom: 10 }}
        />

        <br />

        <input
          placeholder="Nombre de la marca"
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          style={{ padding: 10, marginRight: 10, marginBottom: 10 }}
        />

        <br />

        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
          onChange={(e) => setLogoFile(e.target.files[0])}
          style={{ padding: 10, marginRight: 10, marginBottom: 10 }}
        />

        <br />

        <input
          placeholder="URL del logo"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          style={{ padding: 10, marginRight: 10, marginBottom: 10, width: 400 }}
        />

        <br />

        <button onClick={createQuiz}>Crear</button>
      </div>

      <h2>Quizzes existentes</h2>
      {quizzes.length === 0 && <p>No hay quizzes todavía</p>}
      <ul>
        {quizzes.map((quiz) => (
          <li key={quiz.id} style={{ marginBottom: 10 }}>
            {quiz.title}

            {quiz.brand_name && (
              <span style={{ marginLeft: 10, color: "#666" }}>
                — {quiz.brand_name}
              </span>
            )}

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