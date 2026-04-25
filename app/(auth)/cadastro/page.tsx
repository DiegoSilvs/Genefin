'use client';

import { useState } from 'react';
import { register } from '@/lib/auth';
import { UserPlus } from 'lucide-react';

export default function CadastroPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const password = fd.get('password') as string;
    const confirm = fd.get('confirm') as string;

    if (password !== confirm) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    const result = await register(fd);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <UserPlus size={32} />
        </div>
        <h1 className="auth-title">Criar Conta</h1>
        <p className="auth-subtitle">Preencha seus dados para começar</p>

        {error && <div className="validation-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Nome</label>
            <input id="name" name="name" type="text" required placeholder="Seu nome" />
          </div>
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input id="email" name="email" type="email" required placeholder="seu@email.com" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input id="password" name="password" type="password" required minLength={6} />
          </div>
          <div className="form-group">
            <label htmlFor="confirm">Confirmar Senha</label>
            <input id="confirm" name="confirm" type="password" required minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Criando...' : 'Criar Conta'}
          </button>
        </form>

        <p className="auth-link">
          Já tem conta? <a href="/login">Entrar</a>
        </p>
      </div>
    </div>
  );
}
