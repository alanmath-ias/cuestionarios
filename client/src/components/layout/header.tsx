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
          
          {/* Navegación principal */}
          {user && (
            <nav className="ml-8 hidden md:flex space-x-6">
              <Link href="/">
                <span className="hover:text-white/80 transition-colors cursor-pointer">Dashboard</span>
              </Link>
            {/*quices gratuitos desabilitado temporalmente*/}  
              {/*<Link href="/free-quizzes">
                <span className="hover:text-white/80 transition-colors cursor-pointer">Quizzes Gratuitos</span>
              </Link>*/}
            
            </nav>
          )}
        </div>
        
        {user && <UserMenu user={user} />}
      </div>
    </header>
  );
}
