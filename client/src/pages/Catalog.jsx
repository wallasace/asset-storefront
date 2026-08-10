import { useState, useEffect } from 'react';
import api from '../services/api';
import { AssetCard } from '../components/AssetCard';

export function Catalog() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  // Busca os ativos na API sempre que o termo de busca ou categoria mudar
  useEffect(() => {
    async function fetchAssets() {
      try {
        setLoading(true);
        setError('');

        const response = await api.get('/assets', {
          params: {
            ...(search && { search }),
            ...(category && { category }),
          },
        });

        setAssets(response.data);
      } catch (err) {
        console.error('Erro ao buscar ativos:', err);
        setError('Não foi possível carregar o catálogo de ativos.');
      } finally {
        setLoading(false);
      }
    }

    // Debounce leve para evitar requisições a cada tecla digitada
    const timeoutId = setTimeout(() => {
      fetchAssets();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, category]);

  return (
    <main style={styles.container}>
      {/* Banner Superior */}
      <section style={styles.hero}>
        <h1 style={styles.title}>Ativos Digitais para Seus Projetos</h1>
        <p style={styles.subtitle}>
          Encontre modelos 3D, texturas, shaders e scripts prontos para uso.
        </p>

        {/* Barra de Filtros e Busca */}
        <div style={styles.filterBar}>
          <input
            type="text"
            placeholder="Buscar por nome ou palavras-chave..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={styles.selectInput}
          >
            <option value="">Todas as Categorias</option>
            <option value="modelos-3d">Modelos 3D</option>
            <option value="texturas-pbr">Texturas PBR</option>
            <option value="shaders-vfx">Shaders & VFX</option>
            <option value="scripts-ferramentas">Scripts & Tools</option>
          </select>
        </div>
      </section>

      {/* Lista de Ativos */}
      {loading ? (
        <div style={styles.statusMessage}>Carregando ativos do catálogo...</div>
      ) : error ? (
        <div style={styles.errorMessage}>{error}</div>
      ) : assets.length === 0 ? (
        <div style={styles.statusMessage}>
          Nenhum ativo encontrado para os filtros selecionados.
        </div>
      ) : (
        <div style={styles.grid}>
          {assets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}
    </main>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
  },
  hero: {
    textAlign: 'center',
    marginBottom: '2.5rem',
  },
  title: {
    fontSize: '2rem',
    color: '#0f172a',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: '#64748b',
    fontSize: '1.05rem',
    marginBottom: '1.5rem',
  },
  filterBar: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    maxWidth: '700px',
    margin: '0 auto',
    flexWrap: 'wrap',
  },
  searchInput: {
    flex: '1',
    minWidth: '260px',
    padding: '0.75rem 1rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.95rem',
  },
  selectInput: {
    padding: '0.75rem 1rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.95rem',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '1.5rem',
  },
  statusMessage: {
    textAlign: 'center',
    padding: '3rem 1rem',
    color: '#64748b',
    fontSize: '1.05rem',
  },
  errorMessage: {
    textAlign: 'center',
    padding: '1rem',
    backgroundColor: '#ffe6e6',
    color: '#cc0000',
    borderRadius: '6px',
  },
};