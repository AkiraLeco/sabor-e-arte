import { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { Field, Logo } from '../../components/ui';
import { useSeo } from '../../hooks/useSeo';

export default function AdminLogin() {
  useSeo({ title: 'Entrar | Painel administrativo' });
  const { user, login } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', senha: '' });
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.senha) return setErro('Informe e-mail e senha.');
    setLoading(true);
    setErro('');
    try {
      await login(form.email.trim(), form.senha);
      navigate('/admin');
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login">
      <form className="login__card" onSubmit={submit} noValidate>
        <Logo settings={settings} />
        <h1><Lock size={20} aria-hidden="true" /> Área administrativa</h1>
        <Field label="E-mail" id="l-email"><input id="l-email" type="email" autoComplete="username" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoFocus /></Field>
        <Field label="Senha" id="l-senha"><input id="l-senha" type="password" autoComplete="current-password" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} /></Field>
        {erro && <p className="alert alert--error" role="alert">{erro}</p>}
        <button className="btn btn--primary btn--block btn--lg" disabled={loading}>{loading ? 'ENTRANDO...' : 'ENTRAR'}</button>
        <Link to="/" className="link center">← Voltar ao site</Link>
      </form>
    </main>
  );
}
