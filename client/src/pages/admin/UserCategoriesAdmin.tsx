import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Loader2, BookOpen } from 'lucide-react';
import { Link } from 'wouter';

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
      setError('Error al actualizar materias');
      console.error(err);
    }
  };

  if (isUserLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-950 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-slate-200">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/admin">
            <Button variant="ghost" className="mb-4 text-slate-400 hover:text-white hover:bg-white/5">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Panel
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-100">Administrar Mis Materias</h1>
          <p className="text-slate-400">Selecciona las materias que deseas ver en tu panel.</p>
        </div>

        <Card className="bg-slate-900 border border-white/10 shadow-xl">
          <CardHeader className="border-b border-white/5 pb-4 bg-slate-900/50">
            <CardTitle className="flex items-center gap-2 text-xl text-slate-200">
              <BookOpen className="h-5 w-5 text-blue-400" />
              Materias Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {allCategories.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No hay materias disponibles</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allCategories.map(category => {
                  const isChecked = userCategories.includes(category.id);
                  return (
                    <div
                      key={category.id}
                      className={`flex items-start p-4 rounded-lg transition-all border ${isChecked ? 'bg-blue-500/10 border-blue-500/20' : 'bg-slate-950/30 border-transparent hover:bg-white/5'}`}
                    >
                      <Checkbox
                        id={`cat-${category.id}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => handleCategoryToggle(category.id, checked as boolean)}
                        className="mt-1 border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <label htmlFor={`cat-${category.id}`} className="ml-3 cursor-pointer flex-1">
                        <div className="flex items-center mb-1">
                          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${category.colorClass}`}></span>
                          <span className="font-medium text-slate-200">{category.name}</span>
                        </div>
                        <p className="text-sm text-slate-400">{category.description}</p>
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserCategoriesAdmin;
