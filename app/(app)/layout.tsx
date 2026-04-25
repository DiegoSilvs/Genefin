import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AppLayoutClient from '@/components/layout/AppLayoutClient';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <AppLayoutClient userEmail={user.email}>
      {children}
    </AppLayoutClient>
  );
}
