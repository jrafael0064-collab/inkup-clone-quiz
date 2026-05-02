
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/router'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/router'

const TEXTS = {
  es: {
    next: "Siguiente",
    back: "Atrás",
    continue: "Continuar",
    question: "Pregunta",
    of: "de",
    loading: "Cargando quiz...",
    noQuestions: "Este quiz todavía no tiene preguntas.",
    almost: "Ya casi está 👀",
    name: "Tu nombre",
    whatsapp: "WhatsApp"
  },
  en: {
    next: "Next",
    back: "Back",
    continue: "Continue",
    question: "Question",
    of: "of",
    loading: "Loading quiz...",
    noQuestions: "This quiz has no questions yet.",
    almost: "Almost done 👀",
    name: "Your name",
    whatsapp: "WhatsApp"
  }
}

const LANGUAGE_LABELS = {
  es: "Español",
  en: "English",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
  pt: "Português",
  nl: "Nederlands"
}

export default function QuizPage() {
  const router = useRouter()
  const { id } = router.query

  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  const [showLeadForm, setShowLeadForm] = useState(false)
  const [leadName, setLeadName] = useState('')
  const [leadPhone, setLeadPhone] = useState('')
  const [availableLanguages, setAvailableLanguages] = useState([])

  useEffect(() => {
    if (!id) return

    let existingSession = localStorage.getItem(`quiz_session_${id}`)

    if (!existingSession) {
      existingSession = `${Date.now()}_${Math.random().toString(36).slice(2)}`
      localStorage.setItem(`quiz_session_${id}`, existingSession)
    }

    setSessionId(existingSession)
  }, [id])

  useEffect(() => {
    if (!id) return

    const savedAnswers = localStorage.getItem(`quiz_answers_${id}`)
    const savedLeadName = localStorage.getItem(`quiz_lead_name_${id}`)
    const savedLeadPhone = localStorage.getItem(`quiz_lead_phone_${id}`)

    if (savedAnswers) {
      try {
        setAnswers(JSON.parse(savedAnswers))
      } catch (error) {
        console.error('Error leyendo respuestas guardadas:', error)
      }
    }

    if (savedLeadName) setLeadName(savedLeadName)
    if (savedLeadPhone) setLeadPhone(savedLeadPhone)
  }, [id])

  useEffect(() => {
    if (!id) return
    localStorage.setItem(`quiz_answers_${id}`, JSON.stringify(answers))
  }, [answers, id])

  useEffect(() => {
    if (!id) return
    localStorage.setItem(`quiz_lead_name_${id}`, leadName)
  }, [leadName, id])

  useEffect(() => {
    if (!id) return
    localStorage.setItem(`quiz_lead_phone_${id}`, leadPhone)
  }, [leadPhone, id])

  useEffect(() => {
    if (!id) return

    const fetchQuiz = async () => {
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (quizError) {
        console.error('Error quiz:', quizError)
        return
      }

      if (!quizData) {
        console.error('No existe ese quiz')
        return
      }

      setQuiz(quizData)

      const rootQuizId = quizData.parent_quiz_id || quizData.id

      const { data: relatedQuizzes, error: relatedError } = await supabase
        .from("quizzes")
        .select("id, title, language, parent_quiz_id")
        .or(`id.eq.${rootQuizId},parent_quiz_id.eq.${rootQuizId}`)

      console.log("ROOT QUIZ ID:", rootQuizId)
      console.log("RELATED ERROR:", relatedError)
      console.log("RELATED QUIZZES:", relatedQuizzes)

      if (relatedError) {
        console.error("Error cargando idiomas:", relatedError)
      } else {
        setAvailableLanguages(relatedQuizzes || [])
      }

      console.log("QUIZ DATA:", quizData)
      console.log("LOGO URL:", quizData.logo_url)

      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*, options(*)')
        .eq('quiz_id', id)
        .order('position', { ascending: true })

      if (questionsError) {
        console.error('Error questions:', questionsError)
        return
      }

      setQuestions(questionsData || [])
    }

    fetchQuiz()
  }, [id])


  const handleChange = (qId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: value
    }))
  }

  const handleNext = () => {
    const currentQuestion = questions[currentQuestionIndex]
    if (!currentQuestion) return

    const currentAnswer = answers[currentQuestion.id]

    if (currentAnswer === undefined || currentAnswer === null || currentAnswer === '') {
      alert('Responde esta pregunta antes de continuar.')
      return
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (showLeadForm) {
      setShowLeadForm(false)
      return
    }

    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (!sessionId) {
      alert("No se pudo generar la sesión del usuario")
      return
    }

    const phoneNumber = (quiz.phone || "").replace(/\D/g, "")

    if (!phoneNumber) {
      alert("Este quiz no tiene número configurado")
      return
    }

    const unansweredQuestions = questions.filter((q) => {
      const value = answers[q.id]
      return value === undefined || value === null || value === ""
    })

    if (unansweredQuestions.length > 0) {
      alert("Por favor, responde todas las preguntas antes de enviar.")
      return
    }

    const { error } = await supabase
      .from("answers")
      .insert([
        {
          quiz_id: id,
          session_id: sessionId,
          name: leadName,
          phone: leadPhone,
          data: answers,
          status: "nuevo"
        }
      ])

    if (error) {
      alert("Error: " + error.message)
      return
    }

    localStorage.removeItem(`quiz_answers_${id}`)
    localStorage.removeItem(`quiz_session_${id}`)

    setSubmitted(true)

    let msg = `Hola! 👋 He completado el quiz de "${quiz.title}" y me gustaría que me orientaras con una propuesta de tatuaje.%0A%0A`

    msg += `🧑 Nombre: ${leadName}%0A`
    msg += `📱 WhatsApp: ${leadPhone}%0A%0A`
    msg += `💡 Idea que tengo:%0A`

    Object.keys(answers).forEach((qId) => {
      const q = questions.find((qq) => String(qq.id) === String(qId))
      if (q) {
        msg += `• ${answers[qId]}%0A`
      }
    })

    msg += `%0A🔥 Busco algo que encaje bien conmigo, ¿cómo lo harías tú?`

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    const encodedMsg = encodeURIComponent(msg)
    const url = isMobile
      ? `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMsg}`
      : `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMsg}`

    window.location.href = url
  }

  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const progressPercentage =
    questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0

  if (!quiz) return <p>{es.loading}</p>
  const t = TEXTS[quiz.language] || TEXTS.es

  if (showLeadForm) {
    return (
      <div
        style={{
          padding: 20,
          fontFamily: 'Arial, sans-serif',
          background: 'linear-gradient(120deg, #fefefe, #e2e8f0)',
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 500,
            background: '#fff',
            borderRadius: 16,
            padding: 30,
            boxShadow: '0 6px 20px rgba(0,0,0,0.08)'
          }}
        >
          {quiz.logo_url && (
            <img
              src={quiz.logo_url}
              alt={quiz.brand_name || quiz.title}
              style={{
                display: "block",
                margin: "0 auto 16px",
                maxWidth: 140,
                maxHeight: 100,
                objectFit: "contain"
              }}
            />
         
          )}

          {quiz.brand_name && (
            <p
              style={{
                textAlign: "center",
                color: "#718096",
                fontWeight: "bold",
                marginBottom: 10
              }}
            >
              {quiz.brand_name}
            </p>
          )}

          <h2 style={{ textAlign: 'center', marginBottom: 20 }}>
            Ya casi está 👀
          </h2>

          <p style={{ textAlign: 'center', marginBottom: 25, color: '#4a5568' }}>
            Déjanos tus datos y te enviamos tu propuesta personalizada
          </p>

          <input
            placeholder="Tu nombre"
            value={leadName}
            onChange={(e) => setLeadName(e.target.value)}
            style={{
              width: '100%',
              padding: 12,
              marginBottom: 15,
              borderRadius: 8,
              border: '1px solid #cbd5e0'
            }}
          />

          <input
            placeholder="WhatsApp"
            value={leadPhone}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '')
              setLeadPhone(value)
            }}
            style={{
              width: '100%',
              padding: 12,
              marginBottom: 20,
              borderRadius: 8,
              border: '1px solid #cbd5e0'
            }}
          />

          <button
            onClick={handleSubmit}
            style={{
              width: '100%',
              padding: 14,
              borderRadius: 8,
              border: 'none',
              background: '#38a169',
              color: '#fff',
              fontSize: 16,
              cursor: 'pointer'
            }}
          >
            Enviar y ver resultado
          </button>

          <button
            onClick={() => setShowLeadForm(false)}
            style={{
              marginTop: 10,
              width: '100%',
              padding: 10,
              background: 'transparent',
              border: 'none',
              color: '#718096',
              cursor: 'pointer'
            }}
          >
            ← Volver
          </button>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h1>Gracias por responder</h1>
        <p>Pronto recibirás los resultados por WhatsApp.</p>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div
        style={{
          padding: 40,
          fontFamily: 'Arial, sans-serif',
          background: 'linear-gradient(120deg, #fefefe, #e2e8f0)',
          minHeight: '100vh'
        }}
      >
        {quiz.logo_url && (
          
          <img
            src={quiz.logo_url.trim()}
            alt={quiz.brand_name || quiz.title}
            style={{
              display: "block",
              margin: "0 auto 16px",
              maxWidth: 140,
              maxHeight: "auto",
              objectFit: "contain"
            }}
          />
          
        )}

        {quiz.brand_name && (
          <p
            style={{
              textAlign: "center",
              color: "#718096",
              fontWeight: "bold",
              marginBottom: 10
            }}
          >
            {quiz.brand_name}
          </p>
        )}

        <h1 style={{ textAlign: 'center', color: '#2d3748' }}>{quiz.title}</h1>

        <p style={{ textAlign: 'center', marginTop: 30 }}>
          Este quiz todavía no tiene preguntas.
        </p>
      </div>
    )
  }

  const handleLanguageChange = (targetQuizId) => {
    if (!targetQuizId || targetQuizId === id) return
    router.push(`/quiz/${targetQuizId}`)
  }

  return (
    <div
      style={{
        padding: 20,
        fontFamily: 'Arial, sans-serif',
        background: 'linear-gradient(120deg, #fefefe, #e2e8f0)',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 720,
          background: '#fff',
          borderRadius: 16,
          padding: 30,
          boxShadow: '0 6px 20px rgba(0,0,0,0.08)'
        }}
      >

      {availableLanguages.length > 0 && (
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <select
            value={quiz.id}
            onChange={(e) => handleLanguageChange(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #cbd5e0",
              background: "#fff",
              cursor: "pointer"
            }}
          >
            {availableLanguages.map((item) => (
              <option key={item.id} value={item.id}>
                {LANGUAGE_LABELS[item.language] || item.language}
              </option>
            ))}
          </select>
        </div>
      )}        

        {quiz.logo_url && (
          <img
            src={quiz.logo_url}
            alt={quiz.brand_name || quiz.title}
            style={{
              display: "block",
              margin: "0 auto 16px",
              maxWidth: 140,
              maxHeight: 100,
              objectFit: "contain"
            }}
          />
        )}

        {quiz.brand_name && (
          <p
            style={{
              textAlign: "center",
              color: "#718096",
              fontWeight: "bold",
              marginBottom: 10
            }}
          >
            {quiz.brand_name}
          </p>
        )}

        <h1
          style={{
            textAlign: 'center',
            color: '#2d3748',
            marginBottom: 10
          }}
        >
          {quiz.title}
        </h1>

        <p
          style={{
            textAlign: 'center',
            color: '#718096',
            marginBottom: 20
          }}
        >
          {t.question} {currentQuestionIndex + 1} {t.of} {questions.length}
        </p>

        <div
          style={{
            width: '100%',
            height: 10,
            background: '#e2e8f0',
            borderRadius: 999,
            overflow: 'hidden',
            marginBottom: 30
          }}
        >
          <div
            style={{
              width: `${progressPercentage}%`,
              height: '100%',
              background: '#3182ce',
              transition: 'width 0.3s ease'
            }}
          />
        </div>

        <div
          style={{
            padding: 20,
            background: '#f8fafc',
            borderRadius: 12,
            marginBottom: 25
          }}
        >
          {currentQuestionIndex === 0 && (
            <p
              style={{
                marginBottom: 16,
                color: "#4a5568",
                fontSize: 15,
                lineHeight: 1.5
              }}
            >
              No hace falta que lo tengas claro del todo. Vamos a orientarlo contigo.
            </p>
          )}

          <p
            style={{
              fontWeight: 'bold',
              fontSize: 20,
              marginBottom: 20,
              color: '#1a202c'
            }}
          >
            {currentQuestion.question}
          </p>

          {currentQuestion.type === 'multiple' ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {currentQuestion.options?.map((opt) => {
                const optionValue = opt.text || opt.image_url
                const isSelected = currentAnswer === optionValue

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleChange(currentQuestion.id, optionValue)}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      border: isSelected ? '2px solid #38a169' : '1px solid #cbd5e0',
                      background: isSelected ? '#d4f8d4' : '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 140,
                      minHeight: 120,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {opt.image_url && (
                      <img
                        src={opt.image_url}
                        alt={opt.text || 'Opción'}
                        style={{
                          maxWidth: 100,
                          maxHeight: 70,
                          marginBottom: opt.text ? 8 : 0,
                          borderRadius: 8,
                          objectFit: 'cover'
                        }}
                      />
                    )}

                    {opt.text && (
                      <span style={{ textAlign: 'center', color: '#2d3748' }}>
                        {opt.text}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ) : (
            <input
              type="text"
              value={currentAnswer || ''}
              onChange={(e) => handleChange(currentQuestion.id, e.target.value)}
              placeholder="Escribe tu respuesta"
              style={{
                padding: 12,
                width: '100%',
                borderRadius: 8,
                border: '1px solid #cbd5e0',
                fontSize: 16
              }}
            />
          )}
        </div>

        <p style={{ textAlign: 'center', color: '#4a5568', marginBottom: 20 }}>
          Has respondido {Object.keys(answers).length} de {questions.length} preguntas
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12
          }}
        >
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            style={{
              padding: '12px 20px',
              borderRadius: 8,
              border: 'none',
              background: currentQuestionIndex === 0 ? '#cbd5e0' : '#718096',
              color: '#fff',
              fontSize: 16,
              cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
              opacity: currentQuestionIndex === 0 ? 0.8 : 1
            }}
          >
            Atrás
          </button>

          {!isLastQuestion ? (
            <button
              onClick={handleNext}
              style={{
                padding: '12px 20px',
                borderRadius: 8,
                border: 'none',
                background: '#3182ce',
                color: '#fff',
                fontSize: 16,
                cursor: 'pointer'
              }}
            >
              Siguiente
            </button>
          ) : (
            <button
              onClick={() => {
                const currentQuestionItem = questions[currentQuestionIndex]
                const value = answers[currentQuestionItem.id]

                if (!value) {
                  alert('Responde antes de continuar')
                  return
                }

                setShowLeadForm(true)
              }}
              style={{
                padding: '12px 20px',
                borderRadius: 8,
                border: 'none',
                background: '#38a169',
                color: '#fff',
                fontSize: 16,
                cursor: 'pointer'
              }}
            >
              Continuar
            </button>
          )}
        </div>

      </div>
    </div>
  )
}