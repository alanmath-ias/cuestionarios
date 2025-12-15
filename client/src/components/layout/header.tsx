import { useState } from 'react';
import { Link } from 'wouter';
import { UserMenu } from '@/components/ui/user-menu';
import { Menu as MenuIcon, X as CloseIcon, Youtube, Instagram, Globe } from 'lucide-react';
import { FaTiktok, FaFacebook } from 'react-icons/fa';
import logo from '@/assets/images/logo.png';
import { GlobalSearch } from '@/components/ui/global-search';

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

  const socialLinks = {
    youtube: 'https://www.youtube.com/@AlanMath',
    instagram: 'https://www.instagram.com/alanmath.ias/',
    tiktok: 'https://www.tiktok.com/@alanmath.ias',
    facebook: 'https://www.facebook.com/people/AlanMathias/61572215860800/?name=xhp_nt_',
    website: 'https://alanmath.com',
  };

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">

        {/* Logo + AlanMath + botón menú móvil */}
        <div className="flex items-center gap-4">
          <Link href="/admin/AdminDashboard">
            <div className="flex items-center space-x-2 cursor-pointer">
              <img src={logo} alt="Logo AlanMath" className="h-10 w-10 rounded-full object-cover border-2 border-white" />
              <span className="text-lg font-semibold text-white">AlanMath</span>
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
          <ul className="flex flex-col md:flex-row gap-4 md:gap-4 p-4 md:p-0 items-start md:items-center text-sm md:text-base">
            <li>
              <Link href="/admin/AdminDashboard">
                <span className="hover:text-white/80 transition-colors cursor-pointer">Dashboard</span>
              </Link>
            </li>

            {isAdmin && (
              <>
                <li><Link href="/admin/categories"><span className="hover:text-white/80 transition-colors cursor-pointer">Materias</span></Link></li>
                <li><Link href="/admin/subcategories"><span className="hover:text-white/80 transition-colors cursor-pointer">Temas</span></Link></li>
                <li><Link href="/admin/quizzes"><span className="hover:text-white/80 transition-colors cursor-pointer">Cuestionarios</span></Link></li>
                <li><Link href="/admin/users"><span className="hover:text-white/80 transition-colors cursor-pointer">Usuarios</span></Link></li>
                <li><Link href="/admin/calificar"><span className="hover:text-white/80 transition-colors cursor-pointer">Calificar</span></Link></li>
                <li><Link href="/admin/RegistrarPadres"><span className="hover:text-white/80 transition-colors cursor-pointer">Padres</span></Link></li>
              </>
            )}

            {/* Redes sociales en versión móvil (Visible para todos) */}
            <li className="md:hidden pt-2 border-t border-white/10 w-full mt-2">
              <div className="flex flex-col gap-2">
                <p className="text-xs opacity-70 uppercase tracking-wider">Síguenos</p>
                <div className="flex gap-5">
                  <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-[#FF0000]" aria-label="YouTube"><Youtube size={22} /></a>
                  <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-[#E1306C]" aria-label="Instagram"><Instagram size={22} /></a>
                  <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-[#000000]" aria-label="TikTok"><FaTiktok size={20} /></a>
                  <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-[#000000]" aria-label="Facebook"><FaFacebook size={20} /></a>
                  <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="hover:text-white/80" aria-label="Sitio Web"><Globe size={20} /></a>
                </div>
              </div>
            </li>
          </ul>
        </nav>

        {/* Redes sociales (versión desktop) y menú de usuario */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Buscador Global - Visible en móvil */}
          <div className="block">
            <GlobalSearch isAdmin={isAdmin} />
          </div>

          <div className="hidden md:flex items-center gap-3 mr-2">
            <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#FF0000]" aria-label="YouTube"><Youtube size={18} /></a>
            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#E1306C]" aria-label="Instagram"><Instagram size={18} /></a>
            <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#000000]" aria-label="TikTok"><FaTiktok size={16} /></a>
            <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#000000]" aria-label="Facebook"><FaFacebook size={16} /></a>
            <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/80" aria-label="Sitio Web"><Globe size={16} /></a>
          </div>

          {user && <UserMenu user={user} />}
        </div>
      </div>
    </header>
  );
}
