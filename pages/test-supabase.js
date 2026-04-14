import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function TestSupabase() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const test = async () => {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
      if (error) setError(error.message)
      else setData(data)
    }
    test()
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h1>Test Supabase</h1>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!error && !data && <p>Cargando...</p>}
      {!error && data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  )
}