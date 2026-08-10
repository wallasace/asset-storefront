import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export function Cart() {
  const { cart, removeFromCart, clearCart, totalAmount } = useCart();
  const { signed } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const formattedTotal = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(totalAmount);

  async function handleCheckout() {
    if (!signed) {
      return navigate('/login');
    }

    if (cart.length === 0) return;

    try {
      setLoading(true);
      setError('');

      const itemsPayload = cart.map((item) => ({ assetId: item.id }));

      await api.post('/purchases/checkout', { items: itemsPayload });

      setSuccess('Compra realizada com sucesso! O download foi liberado.');
      clearCart();

      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error('Erro ao realizar checkout:', err);
      const msg = err.response?.data?.error || 'Erro ao processar a compra.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.container}>
      <h1 style={styles.title}>Seu Carrinho de Compras</h1>

      {error && <div style={styles.errorMessage}>{error}</div>}
      {success && <div style={styles.successMessage}>{success}</div>}

      {cart.length === 0 ? (
        <div style={styles.emptyState}>
          <p>Seu carrinho está vazio.</p>
          <Link to="/" style={styles.catalogBtn}>
            Explorar Catálogo
          </Link>
        </div>
      ) : (
        <div style={styles.content}>
          <div style={styles.itemsList}>
            {cart.map((item) => {
              const imageUrl = item.thumbnailUrl?.startsWith('http')
                ? item.thumbnailUrl
                : `http://localhost:3000${item.thumbnailUrl}`;

              const formattedPrice = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(item.price || 0);

              return (
                <div key={item.id} style={styles.cartItem}>
                  <img src={imageUrl} alt={item.title} style={styles.thumb} />
                  <div style={styles.itemInfo}>
                    <h3 style={styles.itemTitle}>{item.title}</h3>
                    <span style={styles.itemCategory}>{item.category?.name || 'Geral'}</span>
                  </div>
                  <span style={styles.itemPrice}>{formattedPrice}</span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={styles.removeBtn}
                  >
                    Remover
                  </button>
                </div>
              );
            })}
          </div>

          {/* Resumo da Compra */}
          <div style={styles.summaryCard}>
            <h3 style={styles.summaryTitle}>Resumo do Pedido</h3>
            <div style={styles.summaryRow}>
              <span>Qtd. de Ativos:</span>
              <strong>{cart.length}</strong>
            </div>
            <div style={styles.summaryRow}>
              <span>Total:</span>
              <strong style={styles.totalValue}>{formattedTotal}</strong>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              style={styles.checkoutBtn}
            >
              {loading ? 'Processando...' : 'Finalizar Compra'}
            </button>

            {!signed && (
              <p style={styles.loginNotice}>
                Você precisará <Link to="/login">fazer login</Link> para concluir a compra.
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
  },
  title: {
    fontSize: '1.8rem',
    color: '#0f172a',
    marginBottom: '1.5rem',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
    gap: '2rem',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  cartItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
  },
  thumb: {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '4px',
    backgroundColor: '#f1f5f9',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: '1rem',
    margin: '0 0 0.2rem 0',
    color: '#0f172a',
  },
  itemCategory: {
    fontSize: '0.8rem',
    color: '#64748b',
  },
  itemPrice: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#0f172a',
  },
  removeBtn: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: 'none',
    padding: '0.4rem 0.8rem',
    borderRadius: '4px',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '1.5rem',
    height: 'fit-content',
  },
  summaryTitle: {
    margin: '0 0 1rem 0',
    fontSize: '1.1rem',
    color: '#0f172a',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.8rem',
    fontSize: '0.95rem',
    color: '#475569',
  },
  totalValue: {
    fontSize: '1.3rem',
    color: '#0f172a',
  },
  checkoutBtn: {
    width: '100%',
    padding: '0.8rem',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '1rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    color: '#64748b',
  },
  catalogBtn: {
    display: 'inline-block',
    marginTop: '1rem',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    textDecoration: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '4px',
  },
  loginNotice: {
    fontSize: '0.85rem',
    color: '#64748b',
    textAlign: 'center',
    marginTop: '1rem',
  },
  errorMessage: {
    padding: '0.8rem',
    backgroundColor: '#ffe6e6',
    color: '#cc0000',
    borderRadius: '6px',
    marginBottom: '1rem',
  },
  successMessage: {
    padding: '0.8rem',
    backgroundColor: '#e6fffa',
    color: '#047857',
    borderRadius: '6px',
    marginBottom: '1rem',
  },
};