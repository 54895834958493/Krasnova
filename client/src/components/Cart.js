import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Modal from './Modal';
import './Cart.css';
import { Link } from 'react-router-dom'; // импортируем Link для ссылки
import cartImage from '../img/corzina.png'; // импорт картинки

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const userId = localStorage.getItem('token') ? jwtDecode(localStorage.getItem('token')).id : null;

    useEffect(() => {
        if (userId) {
            fetchCartItems();
        }
    }, [userId]);

    const fetchCartItems = async () => {
        try {
            const response = await fetch(`http://localhost:5000/cart/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setCartItems(data);
            } else {
                console.error('Ошибка при получении корзины:', response.status);
            }
        } catch (error) {
            console.error('Ошибка при загрузке корзины:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveItem = async (productId) => {
        try {
            const response = await fetch(`http://localhost:5000/cart/${userId}/${productId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setCartItems(cartItems.filter(item => item.productId !== productId));
            } else {
                console.error('Ошибка при удалении товара из корзины:', response.status);
            }
        } catch (error) {
            console.error('Ошибка при удалении товара:', error);
        }
    };

    const handleQuantityChange = async (productId, newCount) => {
        const item = cartItems.find((item) => item.productId === productId);
        const maxCount = item.CartProduct.stock;

        if (newCount > maxCount) {
            setErrorMessage(`Максимальное количество для этого товара: ${maxCount}`);
            return;
        }

        if (newCount < 1) {
            setErrorMessage('Количество товара не может быть меньше 1');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/cart/update`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, productId, newCount }),
            });

            if (response.ok) {
                const updatedItem = await response.json();

                setCartItems(cartItems.map((item) =>
                    item.productId === productId ? { ...item, count: updatedItem.count } : item
                ));
            } else {
                console.error('Ошибка при обновлении количества товара:', response.status);
            }
        } catch (error) {
            console.error('Ошибка при обновлении количества товара:', error);
        }
    };

    const handleSubmitOrder = async () => {
        const correctPassword = '123456';
        if (password !== correctPassword) {
            setErrorMessage('Неверный пароль. Пожалуйста, попробуйте ещё раз.');
            return;
        }
    
        try {
            for (let item of cartItems) {
                const orderData = {
                    userId,
                    productId: item.productId,
                    quantity: item.count,
                    status: 'Новый',
                };
    
                await fetch('http://localhost:5000/api/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(orderData),
                });
            }
    
            const clearResponse = await fetch(`http://localhost:5000/cart/clear/${userId}`, {
                method: 'DELETE',
            });
    
            if (clearResponse.ok) {
                alert('Заказ успешно оформлен и корзина очищена');
                setCartItems([]);
                setPassword('');
                setErrorMessage('');
                setIsModalOpen(false);
            } else {
                console.error('Ошибка при очистке корзины:', clearResponse.status);
            }
        } catch (error) {
            console.error('Ошибка при отправке заказа:', error);
        }
    };

    if (loading) return <p>Загрузка корзины...</p>;
    if (cartItems.length === 0) return (
        <div className="empty-cart-warning">
            <p>Чтобы продолжить оформление заказа, пожалуйста, добавьте в заказ букет или цветы из нашего <Link to="/catalog">каталога</Link>.</p>
            <img src={cartImage} alt="Корзина" className="cart-image" />
        </div>
    );

    return (
        <div className="cart-container">
            <h2>Корзина</h2>
            <ul>
                {cartItems.map(item => (
                    <li key={item.id} className="cart-item">
                        {item.CartProduct && (
                            <>
                                <img
                                    src={`http://localhost:5000${item.CartProduct.imageUrl || '/path-to-placeholder.png'}`} 
                                    alt={item.CartProduct.name}
                                    className="cart-image"
                                />
                                <div className="item-details">
                                    <span className="item-name">{item.CartProduct.name}</span> 
                                    <span className="item-price">{item.CartProduct.price} ₽</span> 
                                    <span className="item-count">Количество: {item.count}</span> 
                                    {item.CartProduct.stock === 0 && <span className="warning">Товара больше нет в наличии!</span>}
                                </div>
                                <div className="item-controls">
                                    <button
                                        className="small-button"
                                        onClick={() => handleQuantityChange(item.productId, item.count - 1)}
                                    >
                                        - 
                                    </button>
                                    <span>{item.count}</span>
                                    <button
                                        className="small-button"
                                        onClick={() => handleQuantityChange(item.productId, item.count + 1)}
                                    >
                                        + 
                                    </button>
                                    <button
                                        className="remove-button"
                                        onClick={() => handleRemoveItem(item.productId)}
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ul>
            <h3>Итого: {cartItems.reduce((total, item) => total + (item.CartProduct?.price || 0) * item.count, 0)} ₽</h3>
            <button onClick={() => setIsModalOpen(true)}>Оформить заказ</button>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleSubmitOrder}
                password={password}
                setPassword={setPassword}
                errorMessage={errorMessage}
            />
        </div>
    );
};
export default Cart;
