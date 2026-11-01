import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { whatsappLink } from '../services/whatsapp';

// Só aparece quando o número está configurado (variável de ambiente ou painel)
export default function WhatsAppFloat() {
  const { settings } = useSettings();
  if (!settings?.whatsapp) return null;
  return (
    <motion.a
      className="wa-float"
      href={whatsappLink(settings.whatsapp, `Olá, ${settings.nome}! Gostaria de fazer um pedido.`)}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar pelo WhatsApp"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.08 }}
      transition={{ delay: 1, type: 'spring' }}
    >
      <MessageCircle size={28} />
    </motion.a>
  );
}
