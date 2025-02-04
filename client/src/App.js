import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { CartProvider } from 'react-use-cart';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import CatalogPage from './pages/CatalogPage';
import ProductPage from './components/ProductPage';
import ContactPage from './pages/ContactPage';
import Register from './pages/Register';
import Login from './pages/Login';
import Designer from './pages/Designer';
import UserProfile from './components/UserProfile';
import Cart from './components/Cart';
import Admin from './components/Admin';
import { AuthProvider } from './context/AuthContext';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true); 
            setUser({ name: '' });
        }
    }, []); 

    return (
        <AuthProvider>
            <CartProvider>
                <Router>
                    <div className="App">
                        <Header isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} user={user} />
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/catalog" element={<CatalogPage />} />
                            <Route path="/contact" element={<ContactPage />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/product/:productId" element={<ProductPage />} />
                            <Route path="/profile" element={<UserProfile />} />
                            <Route path="/cart" element={<Cart />} />
                            <Route path="/admin" element={<Admin />} />
                            <Route path="/designer" element={<Designer />} />
                        </Routes>
                        <Footer />
                    </div>
                </Router>
            </CartProvider>
        </AuthProvider>
    );
};

export default App;