import { Link } from 'wouter';
import { Youtube, Instagram, Globe } from 'lucide-react';
import { FaTiktok, FaFacebook } from 'react-icons/fa';
import logo from '@/assets/images/logo.png';

export function Footer() {
  const socialLinks = {
    youtube: 'https://www.youtube.com/@AlanMath',
    instagram: 'https://www.instagram.com/alanmath.ias/',
    tiktok: 'https://www.tiktok.com/@alanmath.ias',
    facebook: 'https://www.facebook.com/people/AlanMathias/61572215860800/?name=xhp_nt_',
    website: 'https://alanmath.com',
  };

  return (
    <footer className="bg-slate-950 text-slate-400 py-12 border-t border-white/10 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">

          {/* Brand Section */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
              <img src={logo} alt="AlanMath Logo" className="h-8 w-8 rounded-full border border-white/10" />
              <span className="text-xl font-bold text-white">AlanMath</span>
            </div>
            <p className="text-sm text-slate-500 max-w-xs">
              Plataforma educativa potenciada por IA para dominar las matemáticas.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex gap-6">
            <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#FF0000] transition-colors transition-transform hover:scale-110" aria-label="YouTube"><Youtube size={20} /></a>
            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#E1306C] transition-colors transition-transform hover:scale-110" aria-label="Instagram"><Instagram size={20} /></a>
            <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors transition-transform hover:scale-110" aria-label="TikTok"><FaTiktok size={18} /></a>
            <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-500 transition-colors transition-transform hover:scale-110" aria-label="Facebook"><FaFacebook size={18} /></a>
            <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-400 transition-colors transition-transform hover:scale-110" aria-label="Sitio Web"><Globe size={18} /></a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-white/5 text-center md:text-right">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} AlanMath. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
