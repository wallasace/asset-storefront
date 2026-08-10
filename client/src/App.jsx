import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Catalog } from './pages/Catalog';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { PublishAsset } from './pages/PublishAsset';
import { AssetDetails } from './pages/AssetDetails';
import { MyAssets } from './pages/MyAssets';
import { Cart } from './pages/Cart'; // <--- IMPORTE AQUI

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Catalog />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/publish" element={<PublishAsset />} />
            <Route path="/assets/:id" element={<AssetDetails />} />
            <Route path="/my-assets" element={<MyAssets />} />
            <Route path="/cart" element={<Cart />} /> {/* <--- ADICIONE AQUI */}
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}