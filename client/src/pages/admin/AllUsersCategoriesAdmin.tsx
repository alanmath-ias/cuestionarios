import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";

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

  if (loading) {
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/admin">
            <Button variant="ghost" className="mb-4 text-slate-400 hover:text-white hover:bg-white/5">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Panel
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-100">Administrar Materias por Usuario</h1>
          <p className="text-slate-400">Asigna o remueve materias para cada usuario manualmente.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {usersData.map(({ user, categories }) => (
            <Card key={user.id} className="bg-slate-900 border border-white/10 shadow-xl hover:border-white/20 transition-all">
              <CardHeader className="pb-3 border-b border-white/5 bg-slate-950/30">
                <CardTitle className="text-lg font-semibold text-slate-200 flex flex-col">
                  {user.name}
                  <span className="text-sm font-normal text-slate-400 mt-1">{user.email}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 max-h-[300px] overflow-y-auto pr-2">
                <div className="space-y-3">
                  {allCategories.map(category => {
                    const isChecked = categories.some(c => c.id === category.id);
                    return (
                      <div
                        key={category.id}
                        className={`flex items-center p-2 rounded-md transition-colors border ${isChecked ? 'bg-blue-500/10 border-blue-500/20' : 'border-transparent hover:bg-white/5'}`}
                      >
                        <Checkbox
                          id={`u${user.id}-cat${category.id}`}
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            handleToggle(user.id, category.id, checked as boolean)
                          }
                          className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                        <label
                          htmlFor={`u${user.id}-cat${category.id}`}
                          className="ml-3 text-sm text-slate-300 cursor-pointer flex-1 flex items-center"
                        >
                          <span
                            className={`inline-block w-2 h-2 rounded-full mr-2 ${category.colorClass}`}
                          ></span>
                          {category.name}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllUsersCategoriesAdmin;
