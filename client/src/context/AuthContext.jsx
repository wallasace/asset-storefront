import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ao carregar a aplicação, verifica se já existe um token salvo no localStorage
  useEffect(() => {
    const storagedUser = localStorage.getItem('@AssetStore:user');
    const storagedToken = localStorage.getItem('@AssetStore:token');

    if (storagedUser && storagedToken) {
      setUser(JSON.parse(storagedUser));
    }

    setLoading(false);
  }, []);

  // Função de Login
  async function login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;

      // Salva no estado do React
      setUser(userData);

      // Persiste no navegador para não deslogar ao recarregar a página
      localStorage.setItem('@AssetStore:token', token);
      localStorage.setItem('@AssetStore:user', JSON.stringify(userData));

      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || 'Erro ao realizar login. Tente novamente.';
      return { success: false, error: errorMessage };
    }
  }

  // Função de Logout
  function logout() {
    setUser(null);
    localStorage.removeItem('@AssetStore:token');
    localStorage.removeItem('@AssetStore:user');
  }

  return (
    <AuthContext.Provider value={{ user, signed: !!user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para facilitar o uso do contexto nas páginas
export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}