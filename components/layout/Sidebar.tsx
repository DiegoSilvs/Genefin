'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Fish,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  X,
  Heart,
  Droplets,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import styles from './Sidebar.module.css';

const menuItems = [
  { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
  { name: 'Plantel', icon: <Fish size={20} />, path: '/peixes' },
  { name: 'Tanques', icon: <Droplets size={20} />, path: '/tanques' },
  { name: 'Cruzamentos', icon: <Heart size={20} />, path: '/cruzamentos' },
  { name: 'Financeiro', icon: <DollarSign size={20} />, path: '/financeiro' },
  { name: 'Configurações', icon: <Settings size={20} />, path: '/configuracoes' },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <>
      {/* Mobile top bar */}
      <button
        className={styles.mobileToggle}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Abrir menu"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className={styles.overlay}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`${styles.sidebar} ${mobileOpen ? styles.open : ''}`}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>GF</div>
          <span className={styles.logoText}>GeneFin</span>
        </div>

        <nav className={styles.nav}>
          <ul className={styles.menuList}>
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`${styles.menuItem} ${pathname === item.path ? styles.active : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <span className={styles.icon}>{item.icon}</span>
                  <span className={styles.name}>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.footer}>
          <button className={styles.logoutButton} onClick={handleLogout}>
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
};
