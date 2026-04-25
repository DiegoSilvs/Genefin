'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Layers, 
  Tag, 
  Fish, 
  Egg, 
  Droplets, 
  Leaf,
  Menu,
  X,
  LogOut,
  User,
  UserCircle
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface AppLayoutClientProps {
  children: React.ReactNode;
  userEmail: string | undefined;
  userName?: string | undefined;
}

export default function AppLayoutClient({ children, userEmail, userName }: AppLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Estrutura', href: '/estruturas', icon: Layers },
    { name: 'Linhagens', href: '/linhagens', icon: Tag },
    { name: 'Reprodutores', href: '/individuos', icon: Fish },
    { name: 'Ninhadas', href: '/ninhadas', icon: Egg },
    { name: 'Água', href: '/agua', icon: Droplets },
    { name: 'Alimentos', href: '/alimentos', icon: Leaf },
  ];

  return (
    <div className="app-layout">
      {/* Mobile Overlay */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} 
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Fish size={32} />
            <span>GeneFin</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button 
            onClick={handleLogout}
            className="nav-item w-full cursor-pointer text-slate-400 hover:text-white transition-colors"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-container">
        <header className="top-bar">
          <div className="flex items-center gap-4">
            <button className="mobile-menu-btn" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-bold text-slate-700 md:block hidden">
              {navItems.find(i => pathname.startsWith(i.href))?.name || 'Sistema'}
            </h2>
          </div>

          <div className="flex items-center gap-4 relative" ref={dropdownRef}>
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900">{userName || userEmail?.split('@')[0]}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Produtor</p>
            </div>
            
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-10 h-10 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 hover:bg-teal-100 transition-colors"
            >
              <User size={20} />
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-50">
                  <p className="text-sm font-black text-slate-900 truncate">{userName || 'Usuário'}</p>
                  <p className="text-xs text-slate-500 truncate">{userEmail}</p>
                </div>
                
                <div className="py-1">
                  <Link 
                    href="/perfil" 
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <UserCircle size={18} />
                    Minha Conta
                  </Link>
                </div>

                <div className="py-1 border-t border-slate-50">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={18} />
                    Sair do Sistema
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
