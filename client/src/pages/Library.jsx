import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export function Library() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyPurchases();
  }, []);

  async function fetchMyPurchases() {
    try {
      setLoading(true);
      const response = await api.get('/purchases/my-purchases');
      setPurchases(response.data);
    } catch (err) {
      console.error('Erro ao carregar biblioteca:', err);
      setError('Não foi possível carregar os itens da sua biblioteca.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(assetId, assetTitle, fileFormat) {
    try {
      setDownloadingId(assetId);

      const response = await api.get(`/assets/${assetId}/download`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const fileName = `${assetTitle.replace(/\s+/g, '_')}.${fileFormat}`;
      link.setAttribute('download', fileName);

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro no download:', err);

      // Decodifica a mensagem de erro que veio encapsulada como Blob do backend
      if (err.response && err.response.data instanceof Blob) {
        const errorText = await err.response.data.text();
        try {
          const errorJson = JSON.parse(errorText);
          alert(`Erro ao baixar: ${errorJson.error}`);
        } catch {
          alert('Erro ao realizar o download do arquivo.');
        }
      } else {
        alert('Erro ao realizar download. Verifique sua conexão ou se o servidor está ativo.');
      }
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <main style={styles.container}>
      <h1 style={styles.title}>Minha Biblioteca</h1>
      <p style={styles.subtitle}>Acesse e baixe todos os ativos digitais adquiridos por você</p>

      {loading ? (
        <div style={styles.statusMessage}>Carregando sua biblioteca...</div>
      ) : error ? (
        <div style={styles.errorMessage}>{error}</div>
      ) : purchases.length === 0 ? (
        <div style={styles.emptyState}>
          <p>Você ainda não comprou nenhum ativo digital.</p>
          <Link to="/" style={styles.catalogBtn}>
            Explorar Catálogo
          </Link>
        </div>
      ) : (
        <div style={styles.grid}>
          {purchases.map(({ id: purchaseId, asset, createdAt }) => {
            if (!asset) return null;

            const imageUrl = asset.thumbnailUrl?.startsWith('http')
              ? asset.thumbnailUrl
              : `http://localhost:3000${asset.thumbnailUrl}`;

            const purchaseDate = new Date(createdAt).toLocaleDateString('pt-BR');

            return (
              <div key={purchaseId} style={styles.card}>
                <img src={imageUrl} alt={asset.title} style={styles.image} />
                <div style={styles.cardBody}>
                  <span style={styles.categoryBadge}>{asset.category?.name || 'Geral'}</span>
                  <h3 style={styles.cardTitle}>{asset.title}</h3>
                  <p style={styles.purchaseDate}>Comprado em: {purchaseDate}</p>

                  <button
                    onClick={() => handleDownload(asset.id, asset.title, asset.fileFormat)}
                    disabled={downloadingId === asset.id}
                    style={styles.downloadBtn}
                  >
                    {downloadingId === asset.id
                      ? 'Baixando...'
                      : `⬇ Baixar Arquivo (${asset.fileFormat?.toUpperCase()})`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

const styles = {
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
  },
  title: {
    fontSize: '1.8rem',
    color: '#0f172a',
    margin: '0 0 0.2rem 0',
  },
  subtitle: {
    color: '#64748b',
    fontSize: '0.95rem',
    marginBottom: '2rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  image: {
    width: '100%',
    height: '160px',
    objectFit: 'cover',
    backgroundColor: '#f1f5f9',
  },
  cardBody: {
    padding: '1.2rem',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  categoryBadge: {
    fontSize: '0.75rem',
    color: '#0284c7',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: '0.3rem',
  },
  cardTitle: {
    fontSize: '1.1rem',
    color: '#0f172a',
    margin: '0 0 0.4rem 0',
  },
  purchaseDate: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    marginBottom: '1.2rem',
  },
  downloadBtn: {
    marginTop: 'auto',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    border: 'none',
    padding: '0.6rem',
    borderRadius: '4px',
    fontWeight: 'bold',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
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