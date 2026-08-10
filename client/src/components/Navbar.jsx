import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext'; // <--- IMPORTE AQUI

export function Navbar() {
  const { user, signed, logout } = useAuth();
  const { cartCount } = useCart(); // <--- OBTÉM CONTAGEM DO CARRINHO
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <Link to="/" style={styles.brand}>
          ⚡ NodeVault
        </Link>

        <nav style={styles.nav}>
            <Link to="/" style={styles.link}>
                Catálogo
            </Link>
            {signed && (
                <>
                <Link to="/library" style={styles.link}>
                    Minha Biblioteca
                </Link>
                <Link to="/my-assets" style={styles.link}>
                    Meus Ativos
                </Link>
                <Link to="/publish" style={styles.publishLink}>
                    + Publicar Ativo
                </Link>
                </>
            )}
        </nav>

        <div style={styles.authGroup}>
          {/* Atalho do Carrinho de Compras */}
          <Link to="/cart" style={styles.cartBtn}>
            🛒 Carrinho {cartCount > 0 && <span style={styles.badge}>{cartCount}</span>}
          </Link>

          {signed ? (
            <div style={styles.userSection}>
              <div style={styles.userInfo}>
                <span style={styles.userName}>{user.name}</span>
                <span style={styles.userRole}>{user.role}</span>
              </div>
              <button onClick={handleLogout} style={styles.logoutBtn}>
                Sair
              </button>
            </div>
          ) : (
            <div style={styles.buttonGroup}>
              <Link to="/login" style={styles.loginBtn}>
                Entrar
              </Link>
              <Link to="/register" style={styles.registerBtn}>
                Criar Conta
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: '#1e293b',
    color: '#f8fafc',
    padding: '0.8rem 1.5rem',
    borderBottom: '1px solid #334155',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#38bdf8',
    textDecoration: 'none',
  },
  nav: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
  },
  link: {
    color: '#cbd5e1',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: '500',
  },
  publishLink: {
    color: '#38bdf8',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: '600',
  },
  authGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.2rem',
  },
  cartBtn: {
    color: '#f8fafc',
    backgroundColor: '#334155',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    padding: '0.4rem 0.8rem',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  badge: {
    backgroundColor: '#38bdf8',
    color: '#0f172a',
    borderRadius: '50%',
    padding: '2px 6px',
    fontSize: '0.75rem',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  userName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#f8fafc',
  },
  userRole: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  logoutBtn: {
    backgroundColor: '#334155',
    color: '#f8fafc',
    border: 'none',
    padding: '0.4rem 0.8rem',
    borderRadius: '4px',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  buttonGroup: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
  },
  loginBtn: {
    color: '#f8fafc',
    textDecoration: 'none',
    fontSize: '0.9rem',
    padding: '0.4rem 0.8rem',
  },
  registerBtn: {
    backgroundColor: '#0284c7',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
    padding: '0.4rem 0.9rem',
    borderRadius: '4px',
  },
};