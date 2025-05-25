import React, { useEffect, useState } from 'react';

interface Category {
  id: number;
  name: string;
  description: string;
  colorClass: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface UserWithCategories {
  user: User;
  categories: Category[];
}

const AllUsersCategoriesAdmin: React.FC = () => {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [usersData, setUsersData] = useState<UserWithCategories[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [catsRes, usersRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/admin/users-with-categories'),
        ]);

        const cats = await catsRes.json();
        const users = await usersRes.json();

        setAllCategories(cats);
        setUsersData(users);
      } catch (err) {
        setError('Error al cargar los datos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const handleToggle = async (userId: number, categoryId: number, isChecked: boolean) => {
    const user = usersData.find(u => u.user.id === userId);
    if (!user) return;

    const updatedCategories = isChecked
      ? [...user.categories.map(cat => cat.id), categoryId]
      : user.categories.filter(cat => cat.id !== categoryId).map(cat => cat.id);

    try {
      await fetch(`/api/users/${userId}/categories`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryIds: updatedCategories }),
      });

      setUsersData(prev =>
        prev.map(u =>
          u.user.id === userId
            ? {
                ...u,
                categories: allCategories.filter(cat =>
                  updatedCategories.includes(cat.id)
                ),
              }
            : u
        )
      );
    } catch (err) {
      console.error('Error al actualizar', err);
    }
  };

  if (loading) return <div className="p-4">Cargando datos...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Administrar Materias por Usuario</h2>
      {usersData.map(({ user, categories }) => (
        <div key={user.id} className="mb-8 border rounded-lg p-4 shadow-sm">
          <h3 className="text-xl font-semibold mb-2">
            {user.name} ({user.email})
          </h3>
          <div className="space-y-2">
            {allCategories.map(category => (
              <div key={category.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`u${user.id}-cat${category.id}`}
                  checked={categories.some(c => c.id === category.id)}
                  onChange={(e) =>
                    handleToggle(user.id, category.id, e.target.checked)
                  }
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label
                  htmlFor={`u${user.id}-cat${category.id}`}
                  className="ml-2 text-sm"
                >
                  <span
                    className={`inline-block w-3 h-3 rounded-full mr-2 ${category.colorClass}`}
                  ></span>
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AllUsersCategoriesAdmin;
