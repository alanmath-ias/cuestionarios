import { useEffect, useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi"; // Para las flechas

type Category = {
  id: number;
  name: string;
};

type Subcategory = {
  id: number;
  name: string;
  categoryId: number;
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
  const [openCategoryIds, setOpenCategoryIds] = useState<number[]>([]); // Estado para manejar las categorías abiertas

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
      setError("Error al cargar categorías");
      console.error(err);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const response = await fetch("/api/admin/subcategories");
      if (!response.ok) throw new Error("Error fetching subcategories");
      const data = await response.json();

      // Formateamos los datos para acceder correctamente a la categoría
      const formattedData = data.map((item: any) => ({
        id: item.subcategories.id,
        name: item.subcategories.name,
        categoryId: item.subcategories.categoryId,
      }));

      setSubcategories(formattedData); // Actualizamos el estado con los datos formateados
    } catch (err) {
      setError("Error al cargar subcategorías");
      console.error(err);
    }
  };

  const handleCreate = async () => {
    setError("");
    setSuccess("");

    if (!newSubcategoryName.trim() || !selectedCategoryId) {
      setError("Debes ingresar un nombre y seleccionar una categoría.");
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
          categoryId: selectedCategoryId,
        }),
      });

      if (!response.ok) throw new Error("Error creating subcategory");

      setSuccess("Subcategoría creada con éxito.");
      setNewSubcategoryName("");
      setSelectedCategoryId(null);
      fetchSubcategories();
    } catch (err) {
      setError("Error al crear subcategoría.");
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
      setError("Error al eliminar subcategoría.");
      console.error(err);
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
      const response = await fetch(`/api/admin/subcategories/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editingName.trim(),
        }),
      });

      if (!response.ok) throw new Error("Error updating subcategory");

      setSuccess("Subcategoría actualizada.");
      setEditingId(null);
      setEditingName("");
      fetchSubcategories();
    } catch (err) {
      setError("Error al actualizar subcategoría.");
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

  // Agrupamos las subcategorías por categoría
  const groupedSubcategories = categories.reduce((acc, category) => {
    acc[category.id] = subcategories.filter(
      (sub) => sub.categoryId === category.id
    );
    return acc;
  }, {} as { [key: number]: Subcategory[] });

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
        {categories.map((category) => (
          <div key={category.id} className="mb-4">
            <div
              onClick={() => toggleCategory(category.id)}
              className="cursor-pointer bg-gray-100 p-4 rounded-md shadow-md hover:bg-gray-200 flex justify-between items-center"
            >
              <h2 className="text-xl font-semibold">{category.name}</h2>
              <div className="flex items-center">
                {openCategoryIds.includes(category.id) ? (
                  <FiChevronUp />
                ) : (
                  <FiChevronDown />
                )}
              </div>
            </div>

            {openCategoryIds.includes(category.id) && (
              <div className="mt-4">
                {groupedSubcategories[category.id]?.length === 0 ? (
                  <p className="text-gray-500">Esta categoría está vacía.</p>
                ) : (
                  <ul className="space-y-2">
                    {groupedSubcategories[category.id]?.map((sub) => (
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
                            <p className="font-medium">{sub.name}</p>
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
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
