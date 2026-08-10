import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export function AssetCard({ asset }) {
  const { addToCart, isInCart } = useCart();
  const inCart = isInCart(asset.id);

  const imageUrl = asset.thumbnailUrl?.startsWith('http')
    ? asset.thumbnailUrl
    : `http://localhost:3000${asset.thumbnailUrl}`;

  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(asset.price || 0);

  return (
    <div style={styles.card}>
      <div style={styles.imageContainer}>
        {asset.thumbnailUrl ? (
          <img src={imageUrl} alt={asset.title} style={styles.image} />
        ) : (
          <div style={styles.placeholderImage}>Sem Imagem</div>
        )}
        <span style={styles.formatBadge}>{asset.fileFormat?.toUpperCase()}</span>
      </div>

      <div style={styles.content}>
        <span style={styles.categoryName}>{asset.category?.name || 'Geral'}</span>
        <h3 style={styles.title}>{asset.title}</h3>
        <p style={styles.description}>
          {asset.description
            ? asset.description.substring(0, 80) + '...'
            : 'Sem descrição cadastrada.'}
        </p>

        <div style={styles.footer}>
          <span style={styles.price}>{formattedPrice}</span>
          <div style={styles.btnGroup}>
            <Link to={`/assets/${asset.id}`} style={styles.detailsBtn}>
              Detalhes
            </Link>
            <button
              onClick={() => addToCart(asset)}
              disabled={inCart}
              style={inCart ? styles.inCartBtn : styles.cartBtn}
            >
              {inCart ? 'No Carrinho ✓' : '🛒 Adicionar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '180px',
    backgroundColor: '#f1f5f9',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#94a3b8',
    fontSize: '0.9rem',
  },
  formatBadge: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    color: '#38bdf8',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  content: {
    padding: '1.2rem',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  categoryName: {
    fontSize: '0.75rem',
    color: '#0284c7',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: '0.2rem',
  },
  title: {
    fontSize: '1.1rem',
    color: '#0f172a',
    margin: '0 0 0.5rem 0',
  },
  description: {
    fontSize: '0.875rem',
    color: '#64748b',
    flex: 1,
    marginBottom: '1rem',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '0.8rem',
    borderTop: '1px solid #f1f5f9',
  },
  price: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#0f172a',
  },
  btnGroup: {
    display: 'flex',
    gap: '0.4rem',
  },
  detailsBtn: {
    backgroundColor: '#f1f5f9',
    color: '#0f172a',
    textDecoration: 'none',
    padding: '0.4rem 0.6rem',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: '500',
  },
  cartBtn: {
    backgroundColor: '#0284c7',
    color: '#ffffff',
    border: 'none',
    padding: '0.4rem 0.6rem',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  inCartBtn: {
    backgroundColor: '#22c55e',
    color: '#ffffff',
    border: 'none',
    padding: '0.4rem 0.6rem',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    cursor: 'default',
  },
};