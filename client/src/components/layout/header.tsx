import { useState } from 'react';
import { Link } from 'wouter';
import { UserMenu } from '@/components/ui/user-menu';
import { Parentheses, Menu as MenuIcon, X as CloseIcon } from 'lucide-react';

interface User {
  id: number;
  name: string;
  username: string;
  email?: string;
  role?: string;
}

interface HeaderProps {
  user?: User | null;
  pendingCount?: number;
}

export function Header({ user, pendingCount }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = user?.role === 'admin';

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        
        {/* Logo y botón menú móvil */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              {/*<Parentheses size={28} />*/}
              <h1 className="text-2xl font-bold">AlanMath</h1>
            </div>
          </Link>
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden focus:outline-none"
          >
            {menuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>

        {/* Navegación */}
        <nav className={`fixed top-16 left-0 right-0 bg-primary text-white shadow-md md:static md:top-0 md:bg-transparent transition-all duration-300 ${menuOpen ? 'block' : 'hidden'} md:block`}>
          <ul className="flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-0 items-start md:items-center">
            <li>
            <Link href="/admin/AdminDashboard">
                <span className="hover:text-white/80 transition-colors cursor-pointer">Dashboard</span>
              </Link>
            </li>

            {isAdmin && (
  <>
    <li>
      <Link href="/admin/categories">
        <span className="hover:text-white/80 transition-colors cursor-pointer">Categorías</span>
      </Link>
    </li>
    <li>
      <Link href="/admin/subcategories">
        <span className="hover:text-white/80 transition-colors cursor-pointer">Subcategorías</span>
      </Link>
    </li>
    <li>
      <Link href="/admin/quizzes">
        <span className="hover:text-white/80 transition-colors cursor-pointer">Cuestionarios</span>
      </Link>
    </li>
    <li>
      <Link href="/admin/urlusercategories">
        <span className="hover:text-white/80 transition-colors cursor-pointer">Usuarios</span>
      </Link>
    </li>
    <li>
      <Link href="/admin/calificar">
        <span className="hover:text-white/80 transition-colors cursor-pointer">Calificar</span>
      </Link>
    </li>
    <li>
      <Link href="/admin/RegistrarPadres">
        <span className="hover:text-white/80 transition-colors cursor-pointer">Padres</span>
      </Link>
    </li>
  </>
)}


          </ul>
        </nav>

        {/* Menú de usuario */}
        {user && <UserMenu user={user} />}
      </div>
    </header>
  );
}

