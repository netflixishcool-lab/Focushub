import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Key, Users, LogOut, Gamepad2 } from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/keys', icon: Key, label: 'License Keys' },
    { path: '/projects', icon: Gamepad2, label: 'Projects' },
    { path: '/users', icon: Users, label: 'Users' }
  ];

  const navStyle = {
    nav: {
      backgroundColor: '#0f172a',
      borderBottom: '1px solid #334155',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
    },
    container: {
      padding: '1rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      textDecoration: 'none',
      color: 'inherit',
      cursor: 'pointer',
      opacity: 0.9,
      transition: 'opacity 0.3s'
    },
    logoBox: {
      width: '40px',
      height: '40px',
      background: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)',
      borderRadius: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    logoText: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: 'white'
    },
    logoTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: 'white',
      margin: 0
    },
    logoSubtitle: {
      fontSize: '12px',
      color: '#94a3b8',
      margin: 0
    },
    desktopMenu: {
      display: 'none'
    },
    desktopMenuShow: {
      display: 'flex',
      alignItems: 'center',
      gap: '2rem'
    },
    menuItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      textDecoration: 'none',
      color: '#cbd5e1',
      transition: 'all 0.3s',
      cursor: 'pointer',
      border: 'none',
      background: 'transparent'
    },
    menuItemActive: {
      backgroundColor: '#2563eb',
      color: 'white'
    },
    userSection: {
      display: 'none'
    },
    userSectionShow: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    userInfo: {
      textAlign: 'right'
    },
    userName: {
      fontSize: '14px',
      fontWeight: '600',
      color: 'white',
      margin: 0
    },
    userRole: {
      fontSize: '12px',
      color: '#60a5fa',
      margin: 0
    },
    avatar: {
      width: '40px',
      height: '40px',
      background: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)',
      borderRadius: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold'
    },
    logoutBtn: {
      padding: '0.5rem',
      background: 'transparent',
      border: 'none',
      color: '#cbd5e1',
      cursor: 'pointer',
      transition: 'all 0.3s',
      borderRadius: '0.5rem'
    },
    mobileMenuBtn: {
      display: 'block',
      padding: '0.5rem',
      background: 'transparent',
      border: 'none',
      color: '#cbd5e1',
      cursor: 'pointer',
      borderRadius: '0.5rem'
    },
    mobileMenuBtnHide: {
      display: 'none'
    },
    mobileMenu: {
      display: 'none',
      backgroundColor: '#0f0f1e',
      borderTop: '1px solid #334155',
      padding: '1rem 1.5rem',
      gap: '0.75rem'
    },
    mobileMenuShow: {
      display: 'flex',
      flexDirection: 'column'
    },
    mobileMenuItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      textDecoration: 'none',
      color: '#cbd5e1',
      cursor: 'pointer'
    }
  };

  return (
    <>
      <nav style={navStyle.nav}>
        <div style={navStyle.container}>
          {/* Logo */}
          <Link to="/" style={{ ...navStyle.logo }}>
            <div style={navStyle.logoBox}>
              <span style={navStyle.logoText}>F</span>
            </div>
            <div>
              <h1 style={navStyle.logoTitle}>FocusHub</h1>
              <p style={navStyle.logoSubtitle}>Admin Panel</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div style={{ ...navStyle.desktopMenu, ...(window.innerWidth >= 768 ? navStyle.desktopMenuShow : {}) }}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{ ...navStyle.menuItem, ...(active ? navStyle.menuItemActive : {}) }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Section */}
          <div style={{ ...navStyle.userSection, ...(window.innerWidth >= 768 ? navStyle.userSectionShow : {}) }}>
            <div style={navStyle.userInfo}>
              <p style={navStyle.userName}>{user?.username}</p>
              {user?.isAdmin && <p style={navStyle.userRole}>Administrator</p>}
            </div>
            <div style={navStyle.avatar}>
              <span>{user?.username?.charAt(0)?.toUpperCase()}</span>
            </div>
            <button
              onClick={onLogout}
              style={navStyle.logoutBtn}
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{ ...navStyle.mobileMenuBtn, ...(window.innerWidth < 768 ? {} : navStyle.mobileMenuBtnHide) }}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div style={{ ...navStyle.mobileMenu, ...navStyle.mobileMenuShow }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                style={{ ...navStyle.mobileMenuItem, ...(active ? { backgroundColor: '#2563eb', color: 'white' } : {}) }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => {
              onLogout();
              setIsOpen(false);
            }}
            style={{ ...navStyle.mobileMenuItem, color: '#f87171' }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </>
  );
};

export default Navbar;
