import React from 'react';
import './Header.css';
import logoImage from '../img/logo.png';
import cartImage from '../img/cart.png';
import { Link } from 'react-router-dom';

const Header = ({ isAuthenticated, setIsAuthenticated, user }) => {
    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
    };

    return (
        <header className="header">
            <div className="logo">
                <Link to="/">
                    <img src={logoImage} alt="Логотип" />
                </Link>
            </div>
            <nav>
                <Link to="/designer" className="blacklink">Конструктор букета</Link>
                <Link to="/catalog" className="blacklink">Каталог</Link>
                <Link to="/contact" className="blacklink">Контакты</Link>
                <div className="auth-buttons">
                    {isAuthenticated ? (
                        <>
                            <span>{user.name}</span>
                            <Link to="/profile" className="profile-button">Профиль</Link>
                            <Link to="/" className="blacklink" onClick={handleLogout}>Выйти</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="auth-button">Авторизация</Link>
                            <Link to="/register" className="auth-button">Регистрация</Link>
                        </>
                    )}
                </div>
                <div className="cart">
                    <Link to="/cart" className="cart-link">
                        <img src={cartImage} alt="Корзина" style={{ width: 50, height: 50 }} />
                    </Link>
                </div>
            </nav>
        </header>
    );
};

export default Header;