import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/router'

export default function QuizPage() {
  const router = useRouter()
  const { id } = router.query

  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      if (quizError) return console.error('Error quiz:', quizError)
      if (!quizData) return console.log('No existe el quiz')
      setQuiz(quizData)

      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*, options(*)')
        .eq('quiz_id', id)
        .order('position', { ascending: true })
      if (questionsError) return console.error('Error questions:', questionsError)
      setQuestions(questionsData || [])
    }

    fetchData()
  }, [id])

  const handleChange = (qId, value) => {
    setAnswers({ ...answers, [qId]: value })
  }

  const handleSubmit = async () => {
    const { data, error } = await supabase
      .from('answers')
      .insert([{ quiz_id: id, data: answers }])
      .select()
    if (error) return alert('Error: ' + error.message)

    setSubmitted(true)

    let msg = `Respuestas del quiz: ${quiz.title}%0A`
    Object.keys(answers).forEach(qId => {
      const q = questions.find(qq => qq.id === qId)
      msg += `${q.question}: ${answers[qId]}%0A`
    })

    const phoneNumber = '5211234567890' // Cambia por tu número
    const url = `https://wa.me/${phoneNumber}?text=${msg}`
    window.open(url, '_blank')
  }

  if (!quiz) return <p>Cargando quiz...</p>

  if (submitted)
    return (
      <div style={{ padding: 20 }}>
        <h1>Gracias por responder!</h1>
        <p>Pronto recibirás los resultados por WhatsApp.</p>
      </div>
    )

  return (
    <div style={{ padding: 20 }}>
      <h1>{quiz.title}</h1>

      {questions.map(q => (
        <div key={q.id} style={{ marginBottom: 30 }}>
          <p>{q.question}</p>

          {q.type === 'multiple' ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {q.options?.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleChange(q.id, opt.text || opt.image_url)}
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    border: answers[q.id] === (opt.text || opt.image_url) ? '2px solid green' : '1px solid #ccc',
                    background: answers[q.id] === (opt.text || opt.image_url) ? '#d4f8d4' : '#f0f0f0',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: 100,
                    height: 100,
                  }}
                >
                  {opt.image_url && <img src={opt.image_url} alt="opción" style={{ maxWidth: 80, maxHeight: 60, marginBottom: 5 }} />}
                  {opt.text && <span>{opt.text}</span>}
                </button>
              ))}
            </div>
          ) : (
            <input
              type="text"
              value={answers[q.id] || ''}
              onChange={e => handleChange(q.id, e.target.value)}
              style={{ padding: 10, width: '100%' }}
            />
          )}
        </div>
      ))}

      <button onClick={handleSubmit} style={{ padding: '10px 20px' }}>
        Enviar respuestas
      </button>
    </div>
  )
}