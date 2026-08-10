import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext'; // <--- IMPORTE AQUI
import { Navbar } from './components/Navbar';
import { Catalog } from './pages/Catalog';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { PublishAsset } from './pages/PublishAsset';
import { AssetDetails } from './pages/AssetDetails';
import { MyAssets } from './pages/MyAssets';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider> {/* <--- ADICIONE O PROVIDER AQUI */}
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Catalog />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/publish" element={<PublishAsset />} />
            <Route path="/assets/:id" element={<AssetDetails />} />
            <Route path="/my-assets" element={<MyAssets />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}