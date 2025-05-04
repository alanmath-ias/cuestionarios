{/*
import { Link } from 'wouter';
import { UserMenu } from '@/components/ui/user-menu';
import { Parentheses } from 'lucide-react';

interface User {
  id: number;
  name: string;
  username: string;
  email?: string;
}

interface HeaderProps {
  user?: User | null;
  pendingCount?: number;
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <Parentheses size={28} />
              <h1 className="text-2xl font-bold">AlanMath</h1>
            </div>
          </Link>
          
         
          {user && (
            <nav className="ml-8 hidden md:flex space-x-6">
              <Link href="/">
                <span className="hover:text-white/80 transition-colors cursor-pointer">Dashboard</span>
              </Link>
            
            
            </nav>
          )}
        </div>
        
        {user && <UserMenu user={user} />}
      </div>
    </header>
  );
}
*/}//header anterior perfecto antes del contador de revisiones pendientes notificaciones
import { Link } from 'wouter';
import { UserMenu } from '@/components/ui/user-menu';
import { Parentheses } from 'lucide-react';

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
  const isAdmin = user?.role === 'admin';

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <Parentheses size={28} />
              <h1 className="text-2xl font-bold">AlanMath</h1>
            </div>
          </Link>
          
          {user && (
            <nav className="ml-8 hidden md:flex space-x-6">
              <Link href="/">
                <span className="hover:text-white/80 transition-colors cursor-pointer">Dashboard</span>
              </Link>

              {isAdmin && (
                <Link href="/admin/Calificar">
                  <span className="hover:text-white/80 transition-colors cursor-pointer relative">
                    Calificar
                    {pendingCount && pendingCount > 0 && (
                      <span className="absolute -top-2 -right-4 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {pendingCount}
                      </span>
                    )}
                  </span>
                </Link>
              )}
            </nav>
          )}
        </div>

        {user && <UserMenu user={user} />}
      </div>
    </header>
  );
}

