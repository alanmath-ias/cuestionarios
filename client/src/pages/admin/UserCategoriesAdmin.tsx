
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';


interface Category {
  id: number;
  name: string;
  description: string;
  colorClass: string;
}

const UserCategoriesAdmin: React.FC = () => {
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['/api/user'],
    queryFn: () => fetch('/api/user').then(res => res.json()),
  });

  const userId = user?.id;
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [userCategories, setUserCategories] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const catsResponse = await fetch('/api/categories');
        const catsData = await catsResponse.json();
        setAllCategories(catsData);

        const userCatsResponse = await fetch(`/api/users/${userId}/categories`);
        const userCatsData = await userCatsResponse.json();
        setUserCategories(userCatsData.map((uc: any) => uc.category_id));
      } catch (err) {
        setError('Error al cargar los datos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleCategoryToggle = async (categoryId: number, isChecked: boolean) => {
    try {
      let updatedCategories = [...userCategories];

      if (isChecked) {
        updatedCategories.push(categoryId);
      } else {
        updatedCategories = updatedCategories.filter(id => id !== categoryId);
      }

      setUserCategories(updatedCategories);

      const response = await fetch(`/api/users/${userId}/categories`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categoryIds: updatedCategories }),
      });

      if (!response.ok) throw new Error('Error al actualizar');
    } catch (err) {
      setError('Error al actualizar categorías');
      console.error(err);
    }
  };

  if (isUserLoading || loading) return <div className="p-4">Cargando categorías...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">sadfAdministrar Categorías del Usuario</h2>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Categorías Disponibles</h3>

        {allCategories.length === 0 ? (
          <p>No hay categorías disponibles</p>
        ) : (
          <div className="space-y-2">
            {allCategories.map(category => (
              <div key={category.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`cat-${category.id}`}
                  checked={userCategories.includes(category.id)}
                  onChange={(e) => handleCategoryToggle(category.id, e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor={`cat-${category.id}`} className="ml-2 block text-sm text-gray-900">
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 ${category.colorClass}`}></span>
                  {category.name} - {category.description}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCategoriesAdmin;
