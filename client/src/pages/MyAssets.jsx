import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export function MyAssets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    fetchMyAssets();
  }, []);

  async function fetchMyAssets() {
    try {
      setLoading(true);
      const response = await api.get('/assets/me');
      setAssets(response.data);
    } catch (err) {
      console.error('Erro ao buscar meus ativos:', err);
      setError('Não foi possível carregar seus ativos.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id, title) {
    const confirmed = window.confirm(`Tem certeza que deseja excluir o ativo "${title}"?`);
    if (!confirmed) return;

    try {
      setDeleteLoading(id);
      await api.delete(`/assets/${id}`);
      setAssets((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Erro ao excluir ativo:', err);
      alert('Erro ao excluir o ativo. Verifique suas permissões.');
    } finally {
      setDeleteLoading(null);
    }
  }

  const totalAssets = assets.length;
  const totalPortfolioValue = assets.reduce((acc, item) => acc + (item.price || 0), 0);
  const formattedTotalValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(totalPortfolioValue);

  return (
    <main style={styles.container}>
      {/* Cabeçalho da Página */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Meus Ativos</h1>
          <p style={styles.subtitle}>Gerencie os produtos digitais publicados por você</p>
        </div>
        <Link to="/publish" style={styles.publishBtn}>
          + Publicar Novo Ativo
        </Link>
      </div>

      {/* Cards de Métricas do Criador */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Total de Itens</span>
          <strong style={styles.statValue}>{totalAssets}</strong>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Valor do Portfólio</span>
          <strong style={styles.statValue}>{formattedTotalValue}</strong>
        </div>
      </div>

      {/* Conteúdo Principal / Tabela de Ativos */}
      {loading ? (
        <div style={styles.statusMessage}>Carregando seus ativos...</div>
      ) : error ? (
        <div style={styles.errorMessage}>{error}</div>
      ) : assets.length === 0 ? (
        <div style={styles.emptyState}>
          <p>Você ainda não publicou nenhum ativo digital.</p>
          <Link to="/publish" style={styles.publishBtnInline}>
            Começar a Publicar
          </Link>
        </div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Ativo</th>
                <th style={styles.th}>Categoria</th>
                <th style={styles.th}>Preço</th>
                <th style={styles.th}>Formato</th>
                <th style={styles.th}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => {
                const imageUrl = asset.thumbnailUrl?.startsWith('http')
                  ? asset.thumbnailUrl
                  : `http://localhost:3000${asset.thumbnailUrl}`;

                const formattedPrice = new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(asset.price || 0);

                return (
                  <tr key={asset.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.assetCell}>
                        <img src={imageUrl} alt={asset.title} style={styles.thumb} />
                        <strong>{asset.title}</strong>
                      </div>
                    </td>
                    <td style={styles.td}>{asset.category?.name || 'Geral'}</td>
                    <td style={styles.td}>{formattedPrice}</td>
                    <td style={styles.td}>
                      <span style={styles.formatBadge}>
                        {asset.fileFormat?.toUpperCase()}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionGroup}>
                        <Link to={`/assets/${asset.id}`} style={styles.viewBtn}>
                          Ver
                        </Link>
                        <button
                          onClick={() => handleDelete(asset.id, asset.title)}
                          disabled={deleteLoading === asset.id}
                          style={styles.deleteBtn}
                        >
                          {deleteLoading === asset.id ? 'Excluindo...' : 'Excluir'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontSize: '1.8rem',
    color: '#0f172a',
    margin: '0 0 0.2rem 0',
  },
  subtitle: {
    color: '#64748b',
    fontSize: '0.95rem',
    margin: 0,
  },
  publishBtn: {
    backgroundColor: '#0284c7',
    color: '#ffffff',
    textDecoration: 'none',
    padding: '0.6rem 1.1rem',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '0.9rem',
  },
  statsContainer: {
    display: 'flex',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  statCard: {
    flex: '1',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '1.2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  statLabel: {
    fontSize: '0.85rem',
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  statValue: {
    fontSize: '1.6rem',
    color: '#0f172a',
  },
  tableWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    padding: '0.9rem 1rem',
    backgroundColor: '#f8fafc',
    color: '#475569',
    fontSize: '0.85rem',
    fontWeight: '600',
    borderBottom: '1px solid #e2e8f0',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '0.9rem 1rem',
    fontSize: '0.9rem',
    color: '#334155',
  },
  assetCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
  },
  thumb: {
    width: '44px',
    height: '44px',
    borderRadius: '4px',
    objectFit: 'cover',
    backgroundColor: '#f1f5f9',
  },
  formatBadge: {
    backgroundColor: '#f1f5f9',
    color: '#0284c7',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
  },
  actionGroup: {
    display: 'flex',
    gap: '0.5rem',
  },
  viewBtn: {
    backgroundColor: '#f1f5f9',
    color: '#0f172a',
    textDecoration: 'none',
    padding: '0.35rem 0.7rem',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: '500',
  },
  deleteBtn: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: 'none',
    padding: '0.35rem 0.7rem',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem 1rem',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    color: '#64748b',
  },
  publishBtnInline: {
    display: 'inline-block',
    marginTop: '0.8rem',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    fontWeight: 'bold',
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