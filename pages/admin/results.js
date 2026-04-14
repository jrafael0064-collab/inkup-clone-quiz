import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function AdminResults() {
  const [results, setResults] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    const { data, error } = await supabase
      .from("results")
      .select("*")
      .order("position", { ascending: true }); // para mantener orden inicial
    if (error) console.log(error);
    setResults(data || []);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
      alert("Solo JPG, PNG o GIF");
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const uploadImage = async () => {
    if (!image) return null;
    setUploading(true);
    const fileName = Date.now() + "_" + image.name;
    const { error } = await supabase.storage
      .from("quiz-options")
      .upload(fileName, image, { cacheControl: "3600", upsert: true });
    if (error) {
      alert("Error al subir imagen: " + error.message);
      setUploading(false);
      return null;
    }
    const { data } = supabase.storage.from("quiz-options").getPublicUrl(fileName);
    setUploading(false);
    return data.publicUrl;
  };

  const createOrUpdateResult = async () => {
    if (!title) return alert("Escribe un título");
    let image_url = null;
    if (image) image_url = await uploadImage();

    if (editingId) {
      const { error } = await supabase
        .from("results")
        .update({ title, description, image_url })
        .eq("id", editingId);
      if (error) return alert(error.message);
      setEditingId(null);
    } else {
      const { error } = await supabase
        .from("results")
        .insert([{ title, description, image_url }]);
      if (error) return alert(error.message);
    }

    setTitle("");
    setDescription("");
    setImage(null);
    setPreview(null);
    loadResults();
  };

  const editResult = (r) => {
    setEditingId(r.id);
    setTitle(r.title);
    setDescription(r.description);
    setPreview(r.image_url || null);
  };

  const deleteResult = async (id) => {
    if (!confirm("¿Seguro que quieres borrar este resultado?")) return;
    const { error } = await supabase.from("results").delete().eq("id", id);
    if (error) return alert(error.message);
    loadResults();
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const items = Array.from(results);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setResults(items);

    // Guardamos el orden en la base de datos
    for (let i = 0; i < items.length; i++) {
      await supabase.from("results").update({ position: i }).eq("id", items[i].id);
    }
  };

  return (
    <div style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ marginBottom: 20 }}>Resultados del Quiz</h1>

      <h3>{editingId ? "Editar resultado" : "Crear nuevo resultado"}</h3>

      <input
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ display: "block", marginBottom: 10, padding: 8, width: "50%" }}
      />

      <textarea
        placeholder="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ display: "block", marginBottom: 10, padding: 8, width: "50%" }}
      />

      <input type="file" accept="image/*" onChange={handleFileChange} style={{ marginBottom: 10 }} />
      {preview && (
        <div style={{ marginBottom: 10 }}>
          <img src={preview} alt="preview" style={{ width: 120, borderRadius: 8 }} />
        </div>
      )}

      <button
        onClick={createOrUpdateResult}
        disabled={uploading}
        style={{
          padding: "10px 20px",
          background: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        {uploading ? "Subiendo..." : editingId ? "Actualizar resultado" : "Crear resultado"}
      </button>

      <hr style={{ margin: "40px 0" }} />

      <h3>Resultados existentes</h3>

      {results.length === 0 && <p>No hay resultados todavía</p>}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="results">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {results.map((r, index) => (
                <Draggable key={r.id} draggableId={r.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: 10,
                        marginBottom: 10,
                        borderRadius: 12,
                        background: "#f9f9f9",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                        ...provided.draggableProps.style,
                      }}
                    >
                      <div>
                        <h4 style={{ margin: 0 }}>{r.title}</h4>
                        {r.image_url && <img src={r.image_url} alt={r.title} style={{ width: 80, marginTop: 5, borderRadius: 8 }} />}
                        <p style={{ margin: "5px 0 0 0" }}>{r.description}</p>
                      </div>
                      <div>
                        <button onClick={() => editResult(r)} style={{ marginRight: 10 }}>
                          Editar
                        </button>
                        <button onClick={() => deleteResult(r.id)} style={{ color: "red" }}>
                          Borrar
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}