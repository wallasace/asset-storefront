import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export function AssetDetails() {
  const { id } = useParams();
  const { signed } = useAuth();
  const { addToCart, isInCart } = useCart();

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssetDetails();
  }, [id]);

  async function fetchAssetDetails() {
    try {
      setLoading(true);
      const response = await api.get(`/assets/${id}`);
      setAsset(response.data);
    } catch (err) {
      console.error('Erro ao carregar ativo:', err);
      setError('Ativo digital não encontrado ou indisponível.');
    } finally {
      setLoading(false);
    }
  }

  // DOWNLOAD SEGURO: Envia o Token JWT via Axios e gera o arquivo via Blob
  async function handleDownload() {
    if (!signed) {
      alert('Você precisa estar logado para realizar o download.');
      return;
    }

    try {
      setDownloading(true);

      const response = await api.get(`/assets/${id}/download`, {
        responseType: 'blob', // Recebe o arquivo em binário
      });

      // Cria um link temporário na memória para disparar o download no navegador
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const fileName = `${asset.title.replace(/\s+/g, '_')}.${asset.fileFormat}`;
      link.setAttribute('download', fileName);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao baixar o arquivo:', err);
      alert('Erro ao realizar download. Verifique se você já adquiriu este ativo.');
    } finally {
      setDownloading(false);
    }
  }

  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  if (loading) {
    return <div style={styles.statusMessage}>Carregando detalhes do produto...</div>;
  }

  if (error || !asset) {
    return (
      <div style={styles.container}>
        <div style={styles.errorMessage}>{error}</div>
        <Link to="/" style={styles.backBtn}>Voltar ao Catálogo</Link>
      </div>
    );
  }

  const inCart = isInCart(asset.id);

  const imageUrl = asset.thumbnailUrl?.startsWith('http')
    ? asset.thumbnailUrl
    : `http://localhost:3000${asset.thumbnailUrl}`;

  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(asset.price || 0);

  return (
    <main style={styles.container}>
      <Link to="/" style={styles.backLink}>← Voltar ao Catálogo</Link>

      <div style={styles.grid}>
        <div style={styles.mediaSection}>
          <img src={imageUrl} alt={asset.title} style={styles.image} />
        </div>

        <div style={styles.infoSection}>
          <span style={styles.categoryBadge}>{asset.category?.name || 'Geral'}</span>
          <h1 style={styles.title}>{asset.title}</h1>
          
          <p style={styles.creatorInfo}>
            Publicado por <strong>{asset.creator?.name || 'Autor Desconhecido'}</strong>
          </p>

          <div style={styles.priceContainer}>
            <span style={styles.priceLabel}>Valor do Ativo:</span>
            <span style={styles.priceValue}>{formattedPrice}</span>
          </div>

          <p style={styles.description}>
            {asset.description || 'Nenhuma descrição técnica foi fornecida para este produto.'}
          </p>

          <div style={styles.specsCard}>
            <h4 style={styles.specsTitle}>Ficha Técnica</h4>
            <div style={styles.specRow}>
              <span>Formato do Arquivo:</span>
              <strong style={{ textTransform: 'uppercase' }}>{asset.fileFormat}</strong>
            </div>
            <div style={styles.specRow}>
              <span>Tamanho do Download:</span>
              <strong>{formatBytes(asset.fileSizeBytes)}</strong>
            </div>
          </div>

          <div style={styles.actionBox}>
            <button
              onClick={handleDownload}
              disabled={downloading}
              style={styles.downloadBtn}
            >
              {downloading ? 'Baixando Arquivo...' : `⬇ Baixar Arquivo (${asset.fileFormat?.toUpperCase()})`}
            </button>

            <button
              onClick={() => addToCart(asset)}
              disabled={inCart}
              style={inCart ? styles.inCartBtn : styles.cartBtn}
            >
              {inCart ? 'Item no Carrinho ✓' : '🛒 Adicionar ao Carrinho'}
            </button>

            {!signed && (
              <p style={styles.loginHint}>
                Dica: <Link to="/login">Faça login</Link> para comprar e salvar este item na sua biblioteca.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

const styles = {
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
  },
  backLink: {
    color: '#0284c7',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
    display: 'inline-block',
    marginBottom: '1.5rem',
  },
  backBtn: {
    display: 'inline-block',
    marginTop: '1rem',
    padding: '0.6rem 1.2rem',
    backgroundColor: '#0f172a',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '4px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '2.5rem',
  },
  mediaSection: {
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
  },
  image: {
    width: '100%',
    maxHeight: '480px',
    objectFit: 'cover',
    display: 'block',
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'column',
  },
  categoryBadge: {
    fontSize: '0.8rem',
    fontWeight: 'bold',
    color: '#0284c7',
    textTransform: 'uppercase',
    marginBottom: '0.4rem',
  },
  title: {
    fontSize: '1.8rem',
    color: '#0f172a',
    margin: '0 0 0.5rem 0',
  },
  creatorInfo: {
    color: '#64748b',
    fontSize: '0.9rem',
    marginBottom: '1.5rem',
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.8rem',
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: '#f1f5f9',
    borderRadius: '6px',
  },
  priceLabel: {
    color: '#475569',
    fontSize: '0.95rem',
  },
  priceValue: {
    fontSize: '1.6rem',
    fontWeight: 'bold',
    color: '#0f172a',
  },
  description: {
    color: '#334155',
    lineHeight: '1.6',
    marginBottom: '1.5rem',
  },
  specsCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '1rem',
    marginBottom: '1.5rem',
  },
  specsTitle: {
    margin: '0 0 0.8rem 0',
    fontSize: '0.95rem',
    color: '#0f172a',
  },
  specRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.875rem',
    color: '#64748b',
    padding: '0.3rem 0',
    borderBottom: '1px solid #f1f5f9',
  },
  actionBox: {
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
  },
  downloadBtn: {
    width: '100%',
    padding: '0.9rem',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  cartBtn: {
    width: '100%',
    padding: '0.8rem',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.95rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  inCartBtn: {
    width: '100%',
    padding: '0.8rem',
    backgroundColor: '#22c55e',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.95rem',
    fontWeight: 'bold',
    cursor: 'default',
  },
  loginHint: {
    fontSize: '0.85rem',
    color: '#64748b',
    textAlign: 'center',
    marginTop: '0.4rem',
  },
  statusMessage: {
    textAlign: 'center',
    padding: '3rem',
    color: '#64748b',
  },
  errorMessage: {
    padding: '1rem',
    backgroundColor: '#ffe6e6',
    color: '#cc0000',
    borderRadius: '6px',
    textAlign: 'center',
  },
};