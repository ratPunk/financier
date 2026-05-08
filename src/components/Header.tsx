import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import "../css/cssComponents/header.css";
import { TbHexagonLetterFFilled } from "react-icons/tb";
import { FiSun, FiMoon, FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "../auth/AuthContext";
import { useTheme } from "../theme/ThemeContext";
import { useLanguage, Language } from "../i18n/LanguageContext";
import { PreferencesAPI } from "../api/AuthAPI";
import AuthModal from "./AuthModal";

function Header() {
    const { user, logout, loading } = useAuth();
    const { theme, setTheme } = useTheme();
    const { language, setLanguage } = useLanguage();
    const { t, i18n } = useTranslation();
    const [showAuth, setShowAuth] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const changeLang = (lng: Language) => {
        setLanguage(lng);
        if (user) PreferencesAPI.set({ language: lng }).catch(() => {});
    };

    const handleToggleTheme = () => {
        const next = theme === 'light' ? 'dark' : 'light';
        setTheme(next);
        if (user) PreferencesAPI.set({ theme: next }).catch(() => {});
    };

    const closeMenu = () => setMenuOpen(false);

    return (
        <header>
            <div className="header-container">
                <div className="left-side">
                    <NavLink to="/" className="logo" onClick={closeMenu}>
                        {React.createElement(TbHexagonLetterFFilled as React.ComponentType<any>, {
                            size: 34,
                            color: "#4361ee",
                            className: "my-icon-class"
                        })}
                        <span>Financier</span>
                    </NavLink>
                </div>

                <button
                    className="burger-btn"
                    onClick={() => setMenuOpen((p) => !p)}
                    aria-label="menu"
                >
                    {menuOpen
                        ? React.createElement(FiX as React.ComponentType<any>, { size: 24 })
                        : React.createElement(FiMenu as React.ComponentType<any>, { size: 24 })}
                </button>

                <nav className={`right-side ${menuOpen ? 'open' : ''}`}>
                    <ul className="nav-links">
                        <li>
                            <NavLink to="/" end onClick={closeMenu}
                                className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                                {t('nav.currencies')}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/converter" onClick={closeMenu}
                                className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                                {t('nav.converter')}
                            </NavLink>
                        </li>
                    </ul>

                    <div className="header-tools">
                        <div className="lang-switch" role="group" aria-label="language">
                            <button
                                className={language === 'ru' || i18n.language.startsWith('ru') ? 'active' : ''}
                                onClick={() => changeLang('ru')}
                            >RU</button>
                            <button
                                className={language === 'en' || i18n.language.startsWith('en') ? 'active' : ''}
                                onClick={() => changeLang('en')}
                            >EN</button>
                        </div>

                        <button
                            className="theme-toggle"
                            onClick={handleToggleTheme}
                            aria-label={theme === 'light' ? t('header.theme_dark') : t('header.theme_light')}
                            title={theme === 'light' ? t('header.theme_dark') : t('header.theme_light')}
                        >
                            {theme === 'light'
                                ? React.createElement(FiMoon as React.ComponentType<any>, { size: 18 })
                                : React.createElement(FiSun as React.ComponentType<any>, { size: 18 })}
                        </button>

                        {!loading && (
                            <div className="header-auth">
                                {user ? (
                                    <>
                                        <span className="username">👤 {user.username}</span>
                                        <button className="secondary" onClick={() => { logout(); closeMenu(); }}>
                                            {t('header.logout')}
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={() => { setShowAuth(true); closeMenu(); }}>
                                        {t('header.login')}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </nav>
            </div>

            {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
        </header>
    );
}

export default Header;
