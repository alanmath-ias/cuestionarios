
import { useEffect, useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

type Category = {
  id: number;
  name: string;
};

type Subcategory = {
  id: number;
  name: string;
  description?: string;
  categoryId: number;
  youtube_sublink?: string | null; // Nuevo campo opcional
};

export default function SubcategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [newSubcategoryDescription, setNewSubcategoryDescription] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openCategoryIds, setOpenCategoryIds] = useState<number[]>([]);
  const [newSubcategoryYoutubeLink, setNewSubcategoryYoutubeLink] = useState("");
  const [editingYoutubeLink, setEditingYoutubeLink] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Error fetching categories");
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError("Error al cargar materias");
      console.error(err);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const response = await fetch("/api/admin/subcategories");
      if (!response.ok) throw new Error("Error fetching subcategories");
      const data = await response.json();
  
      const formattedData = data.map((item: any) => ({
        id: item.id, // Accede directamente a las propiedades
        name: item.name,
        description: item.description,
        categoryId: item.categoryId,
        youtube_sublink: item.youtube_sublink, // Accede directamente al campo
      }));
  
      setSubcategories(formattedData);
    } catch (err) {
      setError("Error al cargar los Temas");
      console.error(err);
    }
  };

  const handleCreate = async () => {
    setError("");
    setSuccess("");
  
    if (!newSubcategoryName.trim() || !selectedCategoryId) {
      setError("Debes ingresar un nombre y seleccionar una materia.");
      return;
    }
  
    try {
      const response = await fetch("/api/admin/subcategories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newSubcategoryName.trim(),
          description: newSubcategoryDescription.trim(),
          categoryId: selectedCategoryId,
          youtube_sublink: newSubcategoryYoutubeLink.trim() || null, // Enviar el enlace o null
        }),
      });
  
      if (!response.ok) throw new Error("Error creating subcategory");
  
      setSuccess("Materia creada con éxito.");
      setNewSubcategoryName("");
      setNewSubcategoryDescription("");
      setNewSubcategoryYoutubeLink(""); // Restablecer el campo del enlace de YouTube
      setSelectedCategoryId(null);
      fetchSubcategories();
    } catch (err) {
      setError("Error al crear el tema.");
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/subcategories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error deleting subcategory");

      fetchSubcategories();
    } catch (err) {
      setError("Error al eliminar el tema.");
      console.error(err);
    }
  };

  const handleEdit = (id: number, name: string, description: string = "") => {
    setEditingId(id);
    setEditingName(name);
    setEditingDescription(description);
    setError("");
    setSuccess("");
  };

  const handleUpdate = async () => {
    if (!editingName.trim()) {
      setError("El nombre no puede estar vacío.");
      return;
    }

    try {
      const response = await fetch(`/api/admin/subcategories/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editingName.trim(),
          description: editingDescription.trim(),
        }),
      });

      if (!response.ok) throw new Error("Error updating subcategory");

      setSuccess("Tema actualizado.");
      setEditingId(null);
      setEditingName("");
      setEditingDescription("");
      fetchSubcategories();
    } catch (err) {
      setError("Error al actualizar el tema.");
      console.error(err);
    }
  };

  const toggleCategory = (categoryId: number) => {
    setOpenCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const groupedSubcategories = categories.reduce((acc, category) => {
    acc[category.id] = subcategories.filter(
      (sub) => sub.categoryId === category.id
    );
    return acc;
  }, {} as { [key: number]: Subcategory[] });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Temas</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Nombre del tema"
          value={newSubcategoryName}
          onChange={(e) => setNewSubcategoryName(e.target.value)}
          className="border p-2 mr-2 rounded w-full mb-2"
        />
        <input
          type="text"
          placeholder="Descripción del Tema"
          value={newSubcategoryDescription}
          onChange={(e) => setNewSubcategoryDescription(e.target.value)}
          className="border p-2 mr-2 rounded w-full mb-2"
        />
        <input
  type="text"
  placeholder="Enlace de YouTube (opcional)"
  value={newSubcategoryYoutubeLink}
  onChange={(e) => setNewSubcategoryYoutubeLink(e.target.value)}
  className="border p-2 mr-2 rounded w-full mb-2"
/>
        <select
          value={selectedCategoryId ?? ""}
          onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
          className="border p-2 mr-2 rounded mb-2 w-full"
        >
          <option value="">Selecciona una materia</option>
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
        {categories.map((category) => (
          <div key={category.id} className="mb-4">
            <div
              onClick={() => toggleCategory(category.id)}
              className="cursor-pointer bg-gray-100 p-4 rounded-md shadow-md hover:bg-gray-200 flex justify-between items-center"
            >
              <h2 className="text-xl font-semibold">{category.name}</h2>
              {openCategoryIds.includes(category.id) ? <FiChevronUp /> : <FiChevronDown />}
            </div>

            {openCategoryIds.includes(category.id) && (
              <div className="mt-4">
                {groupedSubcategories[category.id]?.length === 0 ? (
                  <p className="text-gray-500">Esta materia está vacía.</p>
                ) : (
                  <ul className="space-y-2">
                    {groupedSubcategories[category.id]?.map((sub) => (
                      <li
                        key={sub.id}
                        className="border p-3 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                      >
                        {editingId === sub.id ? (
                          <div className="w-full flex flex-col gap-2">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="border p-2 rounded w-full"
                            />
                            <input
                              type="text"
                              value={editingDescription}
                              onChange={(e) => setEditingDescription(e.target.value)}
                              className="border p-2 rounded w-full"
                            />
                            <input
  type="text"
  placeholder="Enlace de YouTube (opcional)"
  value={editingYoutubeLink}
  onChange={(e) => setEditingYoutubeLink(e.target.value)}
  className="border p-2 rounded w-full"
/>
                            <div className="flex gap-2">
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
                                  setEditingDescription("");
                                }}
                                className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div>
                              <p className="font-medium">{sub.name}</p>
                              {sub.description && (
                                <p className="text-sm text-gray-600">{sub.description}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(sub.id, sub.name, sub.description || "")}
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
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
