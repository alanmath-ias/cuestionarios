import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { UserMenu } from '@/components/ui/user-menu';
import { Menu as MenuIcon, X as CloseIcon, Youtube, Instagram, Globe, HelpCircle } from 'lucide-react';
import { FaTiktok, FaFacebook } from 'react-icons/fa';
import logo from '@/assets/images/logo.png';
import { GlobalSearch } from '@/components/ui/global-search';
import { startTour } from '@/lib/tour';

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
  const [location] = useLocation();
  const isAdmin = user?.role === 'admin';

  const socialLinks = {
    youtube: 'https://www.youtube.com/@AlanMath',
    instagram: 'https://www.instagram.com/alanmath.ias/',
    tiktok: 'https://www.tiktok.com/@alanmath.ias',
    facebook: 'https://www.facebook.com/people/AlanMathias/61572215860800/?name=xhp_nt_',
    website: 'https://alanmath.com',
  };

  return (
    <header className="relative z-50 w-full border-b border-white/10 bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">

        {/* Logo + AlanMath + botón menú móvil */}
        <div className="flex items-center gap-4">
          <Link href={user ? "/dashboard" : "/"}>
            <div className="flex items-center space-x-2 cursor-pointer group">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md group-hover:bg-blue-500/30 transition-all" />
                <img src={logo} alt="Logo AlanMath" className="relative h-10 w-10 rounded-full object-cover border-2 border-white/10 group-hover:border-blue-500/50 transition-colors" />
              </div>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 group-hover:to-white transition-all">AlanMath</span>
            </div>
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden focus:outline-none text-slate-300 hover:text-white transition-colors"
          >
            {menuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>

        {/* Navegación */}
        <nav className={`fixed inset-x-0 top-[65px] bg-slate-950/95 backdrop-blur-xl border-b border-white/10 md:static md:top-0 md:bg-transparent md:border-none md:backdrop-blur-none transition-all duration-300 ${menuOpen ? 'block' : 'hidden'} md:block`}>
          <ul className="flex flex-col md:flex-row gap-4 md:gap-6 p-6 md:p-0 items-start md:items-center text-sm md:text-sm font-medium">
            <li>
              <Link href={user ? "/dashboard" : "/"}>
                <span className="text-slate-300 hover:text-white transition-colors cursor-pointer">Inicio</span>
              </Link>
            </li>

            {isAdmin && (
              <>
                <li><Link href="/admin/quizzes"><span className="text-slate-300 hover:text-blue-400 transition-colors cursor-pointer">Cuestionarios</span></Link></li>
                <li><Link href="/admin/users"><span className="text-slate-300 hover:text-blue-400 transition-colors cursor-pointer">Usuarios</span></Link></li>
                <li><Link href="/admin/calificar"><span className="text-slate-300 hover:text-blue-400 transition-colors cursor-pointer">Calificar</span></Link></li>
              </>
            )}

            {/* Redes sociales en versión móvil (Visible para todos) */}
            <li className="md:hidden pt-4 border-t border-white/10 w-full mt-2">
              <div className="flex flex-col gap-3">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Síguenos</p>
                <div className="flex gap-6">
                  <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#FF0000] transition-colors" aria-label="YouTube"><Youtube size={24} /></a>
                  <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#E1306C] transition-colors" aria-label="Instagram"><Instagram size={24} /></a>
                  <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" aria-label="TikTok"><FaTiktok size={22} /></a>
                  <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-500 transition-colors" aria-label="Facebook"><FaFacebook size={22} /></a>
                  <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400 transition-colors" aria-label="Sitio Web"><Globe size={22} /></a>
                </div>
              </div>
            </li>
          </ul>
        </nav>

        {/* Redes sociales (versión desktop) y menú de usuario */}
        <div className="flex items-center gap-3 md:gap-6">

          {/* Botón de Ayuda (Visible siempre excepto admin) */}
          {!isAdmin && (
            <button
              onClick={() => startTour(location)}
              className="text-slate-400 hover:text-white transition-colors focus:outline-none"
              title="Ayuda"
            >
              <HelpCircle size={20} />
            </button>
          )}

          {/* Buscador Global */}
          <div className="hidden sm:block">
            <GlobalSearch isAdmin={isAdmin} />
          </div>

          <div className="hidden md:flex items-center gap-4 border-l border-white/10 pl-6">
            {/* Social icons removed as per user request */}
          </div>

          {user ? (
            <div className="pl-2">
              <UserMenu user={user} />
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3 pl-2">
              <Link href="/auth">
                <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  Iniciar Sesión
                </button>
              </Link>
              <Link href="/auth">
                <button className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition-all shadow-lg shadow-blue-500/20">
                  Registrarse
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
