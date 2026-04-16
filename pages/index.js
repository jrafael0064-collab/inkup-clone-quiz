export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        background: "#f7fafc",
        fontFamily: "Arial, sans-serif",
        padding: 20,
        textAlign: "center"
      }}
    >
      <h1 style={{ fontSize: 40, marginBottom: 12 }}>InkFlow</h1>
      <p style={{ fontSize: 18, color: "#4a5568", maxWidth: 600 }}>
        Descubre qué tatuaje encaja contigo y recibe una propuesta personalizada.
      </p>
    </div>
  )
}