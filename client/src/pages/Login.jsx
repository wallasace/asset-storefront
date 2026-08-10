import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/'); // Redireciona para o catálogo após o login
    } else {
      setError(result.error);
      setIsSubmitting(false);
    }
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2>Acessar Storefront</h2>
        <p style={styles.subtitle}>Digite suas credenciais para continuar</p>

        {error && <div style={styles.errorMessage}>{error}</div>}

        <div style={styles.inputGroup}>
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="******"
            required
            style={styles.input}
          />
        </div>

        <button type="submit" disabled={isSubmitting} style={styles.button}>
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>

        <p style={styles.footerText}>
          Ainda não tem conta? <Link to="/register">Cadastre-se</Link>
        </p>
      </form>
    </div>
  );
}

// Estilos inline temporários para prototipagem rápida
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'Center',
    alignItems: 'center',
    minHeight: '80vh',
  },
  card: {
    width: '100%',
    maxWidth: '380px',
    padding: '2rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
    backgroundColor: '#fff',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  subtitle: {
    color: '#666',
    fontSize: '0.9rem',
    marginBottom: '1.5rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    marginBottom: '1rem',
    textAlign: 'left',
  },
  input: {
    padding: '0.6rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '1rem',
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#0066cc',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  errorMessage: {
    padding: '0.6rem',
    marginBottom: '1rem',
    borderRadius: '4px',
    backgroundColor: '#ffe6e6',
    color: '#cc0000',
    fontSize: '0.85rem',
  },
  footerText: {
    marginTop: '1.2rem',
    fontSize: '0.85rem',
    color: '#555',
  },
};