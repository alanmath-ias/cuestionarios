// client/src/pages/admin/subcategories.tsx

import { useEffect, useState } from "react";
import axios from "axios";

type Category = {
  id: number;
  name: string;
};

type Subcategory = {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
};

export default function SubcategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  const fetchCategories = async () => {
    const res = await axios.get("/api/categories");
    setCategories(res.data);
  };

  const fetchSubcategories = async () => {
    const res = await axios.get("/api/subcategories");
    setSubcategories(res.data);
  };

  const handleCreate = async () => {
    setError("");
    setSuccess("");

    if (!newSubcategoryName.trim() || !selectedCategoryId) {
      setError("Debes ingresar un nombre y seleccionar una categoría.");
      return;
    }

    try {
      await axios.post("/api/subcategories", {
        name: newSubcategoryName.trim(),
        categoryId: selectedCategoryId,
      });
      setSuccess("Subcategoría creada con éxito.");
      setNewSubcategoryName("");
      setSelectedCategoryId(null);
      fetchSubcategories();
    } catch (err) {
      setError("Error al crear subcategoría.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/subcategories/${id}`);
      fetchSubcategories();
    } catch {
      setError("Error al eliminar subcategoría.");
    }
  };

  const handleEdit = (id: number, name: string) => {
    setEditingId(id);
    setEditingName(name);
    setError("");
    setSuccess("");
  };

  const handleUpdate = async () => {
    if (!editingName.trim()) {
      setError("El nombre no puede estar vacío.");
      return;
    }

    try {
      await axios.put(`/api/subcategories/${editingId}`, {
        name: editingName.trim(),
      });
      setSuccess("Subcategoría actualizada.");
      setEditingId(null);
      setEditingName("");
      fetchSubcategories();
    } catch {
      setError("Error al actualizar subcategoría.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Subcategorías</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Nombre de la subcategoría"
          value={newSubcategoryName}
          onChange={(e) => setNewSubcategoryName(e.target.value)}
          className="border p-2 mr-2 rounded"
        />
        <select
          value={selectedCategoryId ?? ""}
          onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
          className="border p-2 mr-2 rounded"
        >
          <option value="">Selecciona una categoría</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Crear
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
        {success && <p className="text-green-600 mt-2">{success}</p>}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Lista de subcategorías</h2>
        <ul className="space-y-2">
          {subcategories.map((sub) => (
            <li
              key={sub.id}
              className="border p-3 rounded flex justify-between items-center"
            >
              {editingId === sub.id ? (
                <div className="flex items-center gap-2 w-full">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="border p-2 rounded w-full"
                  />
                  <button
                    onClick={handleUpdate}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditingName("");
                    }}
                    className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <p className="font-medium">{sub.name}</p>
                    <p className="text-sm text-gray-600">
                      Categoría: {sub.categoryName}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(sub.id, sub.name)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(sub.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
