import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Catalog } from './pages/Catalog';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { PublishAsset } from './pages/PublishAsset';
import { AssetDetails } from './pages/AssetDetails'; // <--- IMPORTE AQUI

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/publish" element={<PublishAsset />} />
          <Route path="/assets/:id" element={<AssetDetails />} /> {/* <--- ADICIONE AQUI */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}