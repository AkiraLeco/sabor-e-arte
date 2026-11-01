import { api } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { useSeo } from '../hooks/useSeo';
import { useSettings } from '../context/SettingsContext';
import Hero from '../components/home/Hero';
import About from '../components/home/About';
import Promotions from '../components/home/Promotions';
import Gallery from '../components/home/Gallery';
import Testimonials from '../components/home/Testimonials';
import Contact from '../components/home/Contact';

export default function Home() {
  const { settings } = useSettings();
  const { data, loading, error } = useFetch(() => api.produtos());
  useSeo({
    title: `${settings?.nome || 'Restaurante'} | Cardápio digital e pedidos online`,
    description: settings?.descricao,
  });

  return (
    <>
      <Hero />
      <About />
      <Promotions produtos={data} loading={loading} error={error} />
      <Gallery />
      <Testimonials />
      <Contact />
    </>
  );
}
