import { Link } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';
import { EmptyState } from '../components/ui';
import { useSeo } from '../hooks/useSeo';

export default function NotFound() {
  useSeo({ title: 'Página não encontrada' });
  return (
    <main id="conteudo" className="page">
      <div className="container">
        <EmptyState icon={UtensilsCrossed} title="Página não encontrada" text="O endereço que você tentou acessar não existe ou foi movido.">
          <Link to="/" className="btn btn--primary">VOLTAR AO INÍCIO</Link>
        </EmptyState>
      </div>
    </main>
  );
}
