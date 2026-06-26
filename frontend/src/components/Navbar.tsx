// ============================================================
// components/Navbar.tsx
// ============================================================

import type { FC } from 'react';

interface NavbarProps {
  onAdminClick: () => void;
}

const Navbar: FC<NavbarProps> = ({ onAdminClick }) => {
  return (
    <nav className="navbar">
      {/* Logo Envoi du Net */}
      <div className="navbar__logo">
        <img
          src="/logo-envoi-du-net.png"
          alt="Envoi du Net"
          className="navbar__logo-img"
        />
      </div>

      {/* Bouton Admin discret */}
      <div className="navbar__actions">
        <button
          id="btn-open-admin"
          className="btn-admin"
          onClick={onAdminClick}
          aria-label="Accéder à l'espace administrateur"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="8" r="4" />
            <path d="M12 14c-6 0-8 2-8 4v1h16v-1c0-2-2-4-8-4z" />
          </svg>
          Admin
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
