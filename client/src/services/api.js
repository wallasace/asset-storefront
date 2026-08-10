import axios from 'axios';

// Cria a instância do Axios com a URL base da nossa API Backend
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Interceptador: antes de cada requisição, verifica se existe um token salvo
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@AssetStore:token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;