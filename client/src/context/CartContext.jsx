import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext({});

const CART_STORAGE_KEY = '@NodeVault:cart';

export function CartProvider({ children }) {
  // Inicializa o estado lendo do localStorage para manter a persistência
  const [cart, setCart] = useState(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (err) {
      console.error('Erro ao carregar carrinho do localStorage:', err);
      return [];
    }
  });

  // Salva no localStorage a cada alteração no carrinho
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (err) {
      console.error('Erro ao salvar carrinho no localStorage:', err);
    }
  }, [cart]);

  // Adiciona um ativo ao carrinho (se ainda não estiver presente)
  function addToCart(asset) {
    setCart((prevCart) => {
      const exists = prevCart.some((item) => item.id === asset.id);
      if (exists) return prevCart;
      return [...prevCart, asset];
    });
  }

  // Remove um ativo do carrinho pelo ID
  function removeFromCart(assetId) {
    setCart((prevCart) => prevCart.filter((item) => item.id !== assetId));
  }

  // Limpa todos os itens do carrinho após a compra
  function clearCart() {
    setCart([]);
  }

  // Verifica se um ativo específico já está no carrinho
  function isInCart(assetId) {
    return cart.some((item) => item.id === assetId);
  }

  // Calcula o valor total dos itens no carrinho
  const totalAmount = cart.reduce((acc, item) => acc + (item.price || 0), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        totalAmount,
        cartCount: cart.length,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Hook personalizado para consumir o contexto do carrinho
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser utilizado dentro de um CartProvider');
  }
  return context;
}