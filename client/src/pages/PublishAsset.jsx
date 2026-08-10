import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export function PublishAsset() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [fileFormat, setFileFormat] = useState('stl');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);

  const [thumbnail, setThumbnail] = useState(null);
  const [assetFile, setAssetFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { signed } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!signed) {
      navigate('/login');
    }
  }, [signed, navigate]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await api.get('/assets/categories');
        setCategories(response.data);
        if (response.data && response.data.length > 0) {
          setCategoryId(response.data[0].id);
        }
      } catch (err) {
        console.error('Erro ao carregar categorias:', err);
      }
    }

    loadCategories();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!thumbnail) {
      return setError('Por favor, selecione uma imagem de capa (Thumbnail).');
    }

    if (!assetFile) {
      return setError('Por favor, selecione o arquivo digital do ativo (.stl, .zip, etc).');
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('fileFormat', fileFormat);
      if (categoryId) {
        formData.append('categoryId', categoryId);
      }

      formData.append('thumbnail', thumbnail);
      formData.append('assetFile', assetFile);

      await api.post('/assets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Ativo publicado com sucesso!');

      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      const message =
        err.response?.data?.error || 'Erro ao publicar o ativo. Tente novamente.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 style={styles.title}>Publicar Novo Ativo Digital</h2>
        <p style={styles.subtitle}>
          Preencha os dados técnicos e faça o upload do seu arquivo de produto
        </p>

        {error && <div style={styles.errorMessage}>{error}</div>}
        {success && <div style={styles.successMessage}>{success}</div>}

        <div style={styles.inputGroup}>
          <label htmlFor="title">Título do Ativo *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Vase Geométrico STL / Skin Shader PBR"
            required
            style={styles.input}
          />
        </div>

        <div style={styles.row}>
          <div style={{ ...styles.inputGroup, flex: 1 }}>
            <label htmlFor="price">Preço (R$) *</label>
            <input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="29.90"
              required
              style={styles.input}
            />
          </div>

          <div style={{ ...styles.inputGroup, flex: 1 }}>
            <label htmlFor="fileFormat">Formato Principal *</label>
            <input
              id="fileFormat"
              type="text"
              value={fileFormat}
              onChange={(e) => setFileFormat(e.target.value)}
              placeholder="stl, zip, fbx, blend"
              required
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.inputGroup}>
          <label htmlFor="category">Categoria *</label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            style={styles.input}
            required
          >
            {categories.length === 0 ? (
              <option value="">Carregando categorias...</option>
            ) : (
              categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div style={styles.inputGroup}>
          <label htmlFor="description">Descrição do Produto</label>
          <textarea
            id="description"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva detalhes do ativo, tolerâncias de impressão 3D, mapas de textura inclusos, etc..."
            style={styles.textarea}
          />
        </div>

        <div style={styles.fileSection}>
          <div style={styles.inputGroup}>
            <label htmlFor="thumbnail">Imagem de Capa (Thumbnail) *</label>
            <input
              id="thumbnail"
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnail(e.target.files[0])}
              required
              style={styles.fileInput}
            />
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="assetFile">Arquivo Digital do Produto (.stl, .zip) *</label>
            <input
              id="assetFile"
              type="file"
              onChange={(e) => setAssetFile(e.target.files[0])}
              required
              style={styles.fileInput}
            />
          </div>
        </div>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Enviando arquivos...' : 'Publicar Ativo'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    padding: '2.5rem 1rem',
  },
  card: {
    width: '100%',
    maxWidth: '620px',
    padding: '2rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
  },
  title: {
    fontSize: '1.5rem',
    color: '#0f172a',
    margin: '0 0 0.2rem 0',
  },
  subtitle: {
    color: '#64748b',
    fontSize: '0.9rem',
    marginBottom: '1.5rem',
  },
  row: {
    display: 'flex',
    gap: '1rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    marginBottom: '1.2rem',
    textAlign: 'left',
  },
  input: {
    padding: '0.65rem',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
    fontSize: '0.95rem',
  },
  textarea: {
    padding: '0.65rem',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  fileSection: {
    padding: '1rem',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    border: '1px dashed #cbd5e1',
    marginBottom: '1.5rem',
  },
  fileInput: {
    fontSize: '0.875rem',
  },
  button: {
    width: '100%',
    padding: '0.8rem',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  errorMessage: {
    padding: '0.75rem',
    marginBottom: '1rem',
    borderRadius: '4px',
    backgroundColor: '#ffe6e6',
    color: '#cc0000',
    fontSize: '0.85rem',
  },
  successMessage: {
    padding: '0.75rem',
    marginBottom: '1rem',
    borderRadius: '4px',
    backgroundColor: '#e6fffa',
    color: '#047857',
    fontSize: '0.85rem',
  },
};