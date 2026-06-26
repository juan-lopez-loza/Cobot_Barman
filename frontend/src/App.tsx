// ============================================================
// App.tsx — Composant racine & orchestration de l'app
// ============================================================

import { useState, useCallback, type FC } from 'react';
import Navbar from '@/components/Navbar';
import AdminModal from '@/components/AdminModal';
import ToastContainer from '@/components/ToastContainer';
import HomePage from '@/pages/HomePage';
import AdminPage from '@/pages/AdminPage';
import { useToast } from '@/hooks/useToast';

type View = 'home' | 'admin';

const App: FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  const { toasts, addToast, removeToast } = useToast();

  // Ouvre la modale d'auth
  const handleAdminClick = useCallback(() => {
    setIsAdminModalOpen(true);
  }, []);

  // Authentification réussie → basculer vers la vue admin
  const handleAdminAuthSuccess = useCallback(() => {
    setCurrentView('admin');
    addToast('info', '🔓 Accès administrateur accordé');
  }, [addToast]);

  // Retour à l'accueil
  const handleGoHome = useCallback(() => {
    setCurrentView('home');
  }, []);

  // Callbacks globaux pour les notifications
  const handleOrderSuccess = useCallback(
    (cocktailName: string) => {
      addToast('success', `🍹 Commande de "${cocktailName}" envoyée au robot !`);
    },
    [addToast],
  );

  const handleOrderError = useCallback(
    (message: string) => {
      addToast('error', `Erreur : ${message}`);
    },
    [addToast],
  );

  const handleAdminSuccess = useCallback(
    (message: string) => {
      addToast('success', message);
    },
    [addToast],
  );

  const handleAdminError = useCallback(
    (message: string) => {
      addToast('error', `Erreur : ${message}`);
    },
    [addToast],
  );

  return (
    <>
      {/* Navigation */}
      <Navbar onAdminClick={handleAdminClick} />

      {/* Vue principale */}
      {currentView === 'home' ? (
        <HomePage
          onOrderSuccess={handleOrderSuccess}
          onOrderError={handleOrderError}
        />
      ) : (
        <AdminPage
          onGoHome={handleGoHome}
          onSuccess={handleAdminSuccess}
          onError={handleAdminError}
        />
      )}

      {/* Modale d'authentification Admin */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onSuccess={handleAdminAuthSuccess}
      />

      {/* Notifications Toast */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
};

export default App;
