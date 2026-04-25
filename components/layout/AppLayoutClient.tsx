'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  User
} from 'lucide-react';

interface AppLayoutClientProps {
  children: React.ReactNode;
  userEmail: string | undefined;
}

export default function AppLayoutClient({ children, userEmail }: AppLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

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
          <div className="nav-item cursor-pointer text-slate-400 hover:text-white">
            <LogOut size={20} />
            <span>Sair</span>
          </div>
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

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900">{userEmail}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Produtor</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
              <User size={20} />
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
