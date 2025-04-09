import { Link } from 'wouter';
import { Parentheses } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <Parentheses className="mr-2" size={20} />
              <span className="text-xl font-bold">AlanMath</span>
            </div>
            <p className="text-gray-400 text-sm mt-1">Plataforma educativa de matemáticas</p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} AlanMath. Todos los derechos reservados.</p>
            <div className="flex justify-center md:justify-end mt-2 space-x-4">
              <Link href="/help">
                <a className="text-gray-400 hover:text-white transition-colors">Ayuda</a>
              </Link>
              <Link href="/privacy">
                <a className="text-gray-400 hover:text-white transition-colors">Privacidad</a>
              </Link>
              <Link href="/terms">
                <a className="text-gray-400 hover:text-white transition-colors">Términos</a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
