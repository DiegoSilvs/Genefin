'use client';

import { useState } from 'react';
import { login } from '@/lib/auth';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const result = await login(fd);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <LogIn size={32} />
        </div>
        <h1 className="auth-title">GeneFin</h1>
        <p className="auth-subtitle">Controle genético de peixes ornamentais</p>

        {error && <div className="validation-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input id="email" name="email" type="email" required placeholder="seu@email.com" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input id="password" name="password" type="password" required minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="auth-link">
          Não tem conta? <a href="/cadastro">Cadastre-se</a>
        </p>
      </div>
    </div>
  );
}
