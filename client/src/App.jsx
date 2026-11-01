import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import WhatsAppFloat from './components/WhatsAppFloat';
import Home from './pages/Home';
import Cardapio from './pages/Cardapio';
import Checkout from './pages/Checkout';
import Pedido from './pages/Pedido';
import NotFound from './pages/NotFound';
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import AdminPedidos from './pages/admin/AdminPedidos';
import AdminProdutos from './pages/admin/AdminProdutos';
import AdminCategorias from './pages/admin/AdminCategorias';
import AdminMensagens from './pages/admin/AdminMensagens';
import AdminConfig from './pages/admin/AdminConfig';

// Rolagem suave para âncoras (/#sobre) e topo ao trocar de página
function ScrollManager() {
  const { pathname, hash, key } = useLocation();
  useEffect(() => {
    if (hash) {
      const tentar = (n = 0) => {
        const el = document.getElementById(hash.slice(1));
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else if (n < 10) setTimeout(() => tentar(n + 1), 80);
      };
      tentar();
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [pathname, hash, key]);
  return null;
}

function PublicLayout({ children }) {
  return (
    <>
      <Header />
      <div>{children}</div>
      <Footer />
      <CartDrawer />
      <WhatsAppFloat />
    </>
  );
}

export default function App() {
  return (
    // "user": respeita a preferência de movimento reduzido do sistema
    <MotionConfig reducedMotion="user">
      <ScrollManager />
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="pedidos" element={<AdminPedidos />} />
          <Route path="produtos" element={<AdminProdutos />} />
          <Route path="categorias" element={<AdminCategorias />} />
          <Route path="mensagens" element={<AdminMensagens />} />
          <Route path="configuracoes" element={<AdminConfig />} />
        </Route>
        <Route path="/" element={<PublicLayout><main id="conteudo"><Home /></main></PublicLayout>} />
        <Route path="/cardapio" element={<PublicLayout><Cardapio /></PublicLayout>} />
        <Route path="/checkout" element={<PublicLayout><Checkout /></PublicLayout>} />
        <Route path="/pedido" element={<PublicLayout><Pedido /></PublicLayout>} />
        <Route path="/pedido/:numero" element={<PublicLayout><Pedido /></PublicLayout>} />
        <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
      </Routes>
    </MotionConfig>
  );
}
