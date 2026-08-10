import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Validação de senhas coincidentes
    if (password !== confirmPassword) {
      return setError('As senhas não conferem.');
    }

    if (password.length < 6) {
      return setError('A senha deve ter pelo menos 6 caracteres.');
    }

    setIsSubmitting(true);

    try {
      // 1. Envia a requisição de cadastro para o backend
      await api.post('/auth/register', {
        name,
        email,
        password,
      });

      // 2. Faz login automático após o cadastro ser concluído
      const loginResult = await login(email, password);

      if (loginResult.success) {
        navigate('/'); // Redireciona para o catálogo
      } else {
        navigate('/login'); // Se o login falhar, vai para a tela de login
      }
    } catch (err) {
      const message =
        err.response?.data?.error || 'Erro ao realizar cadastro. Tente novamente.';
      setError(message);
      setIsSubmitting(false);
    }
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2>Criar Conta</h2>
        <p style={styles.subtitle}>Preencha seus dados para começar</p>

        {error && <div style={styles.errorMessage}>{error}</div>}

        <div style={styles.inputGroup}>
          <label htmlFor="name">Nome completo</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
            required
            style={styles.input}
          />
        </div>

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
            placeholder="Mínimo 6 caracteres"
            required
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label htmlFor="confirmPassword">Confirmar Senha</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repita a senha"
            required
            style={styles.input}
          />
        </div>

        <button type="submit" disabled={isSubmitting} style={styles.button}>
          {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
        </button>

        <p style={styles.footerText}>
          Já tem uma conta? <Link to="/login">Faça Login</Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
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