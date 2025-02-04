import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './ProductPage.css';
import { jwtDecode } from "jwt-decode";

const ProductPage = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState('');

    const userId = localStorage.getItem('token') ? jwtDecode(localStorage.getItem('token')).id : null;

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/products/${productId}`);
                if (!response.ok) throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
                const data = await response.json();
                setProduct(data);
            } catch (err) {
                console.error('Ошибка загрузки товара:', err);
                setError('Не удалось загрузить данные товара. Попробуйте позже.');
            } finally {
                setLoading(false);
            }
        };
    
        fetchProduct();
    }, [productId]);    

    const handleAddToCart = async (item) => {
        if (item.stock === 0) {
            setNotification('Товар закончился!');
            setTimeout(() => setNotification(''), 5000);
            return;
        }
    
        if (!userId) {
            setNotification('Вы должны быть авторизованы, чтобы добавлять товары в корзину.');
            setTimeout(() => setNotification(''), 5000);
            return;
        }
    
        const cartItem = {
            userId,
            productId: item.id,
            imageUrl: item.imageUrl,
            quantity: 1,
        };
    
        try {
            const response = await fetch('http://localhost:5000/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cartItem),
            });
    
            if (response.ok) {
                setNotification(`Товар "${item.name}" добавлен в корзину.`);
            } else {
                const errorMsg = await response.text();
                console.error('Ошибка при добавлении в корзину:', errorMsg);
                setNotification('Ошибка при добавлении товара в корзину.');
            }
        } catch (error) {
            console.error('Ошибка при отправке запроса:', error);
            setNotification('Ошибка при добавлении товара в корзину.');
        } finally {
            setTimeout(() => setNotification(''), 5000);
        }
    };    

    if (loading) return <h2>Загрузка товара...</h2>;
    if (error) return <h2>{error}</h2>;
    if (!product) return <h2>Товар не найден.</h2>;

    return (
        <div className="product-page">
            <Link to="/catalog" className="back-arrow">← Каталог</Link>
            {notification && <div className="notification">{notification}</div>}
            <div className="product-content">
                <img
                    src={`http://localhost:5000${product.imageUrl}`}
                    alt={product.name}
                    className="product-image"
                />
                <div className="product-details">
                    <h2>{product.name}</h2>
                    <p>Цена: <span className="price">{product.price} рублей</span></p>
                    <p>Категория: {product.category?.name || 'Без категории'}</p>
                    <p>Описание: {product.description || 'Нет описания'}</p>
                    <p>В наличии: {product.stock} шт.</p>

                    {product.stock === 0 && <span className="out-of-stock">Товар распродан</span>}
                    {product.stock < 5 && product.stock > 0 && <span className="warning">Осталось всего {product.stock} шт.</span>}

                    <button className="buy-button" onClick={() => handleAddToCart(product)}>
                        Добавить в корзину
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductPage;