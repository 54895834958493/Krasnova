import React, { useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import './UserProfile.css';
import Admin from './Admin';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteMessage, setDeleteMessage] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && token.split('.').length === 3) {
            try {
                const decoded = jwtDecode(token);
                Promise.all([fetchUserData(decoded.id), fetchUserOrders(decoded.id, decoded.role, decoded.email)])
                    .then(([userData, userOrders]) => {
                        setUser(userData);
                        setOrders(userOrders);
                    })
                    .catch(error => console.error('Ошибка при загрузке данных:', error))
                    .finally(() => setLoading(false));
            } catch (error) {
                console.error('Ошибка декодирования токена:', error);
                setLoading(false);
            }
        } else {
            console.log('Некорректный токен.');
            setLoading(false);
        }
    }, []);

    const fetchUserData = async (userId) => {
        const response = await fetch(`http://localhost:5000/api/users/${userId}`);
        if (!response.ok) throw new Error('Ошибка при загрузке данных пользователя');
        return await response.json();
    };

    const fetchUserOrders = async (userId, role, email) => {
        const token = localStorage.getItem('token');
        let url = `http://localhost:5000/api/orders/${userId}`;
        
        // Проверяем, если это администратор с почтой anya_shmelkova@mail.ru, то заказы не показываются
        if (role === 'admin' && email === 'anya_shmelkova@mail.ru') {
            return [];
        }
        
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Ошибка при загрузке заказов пользователя');
        return await response.json();
    };

    const deleteOrder = async (orderId) => {
        try {
            await fetch(`http://localhost:5000/api/orders/${orderId}`, {
                method: 'DELETE',
            });
            setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
            setDeleteMessage('Заказ успешно удален');
            setTimeout(() => setDeleteMessage(''), 3000);
        } catch (error) {
            console.error('Ошибка при удалении заказа:', error);
        }
    };

    return (
        <div className="user-profile">
            <h1>Личный кабинет</h1>
            {loading ? (
                <div className="loading">Загрузка...</div>
            ) : user ? (
                <div className="user-info">
                    <div className="user-details">
                        <div className="detail"><strong>Имя: </strong>{user.name}</div>
                        <div className="detail"><strong>Фамилия:</strong>{user.surname}</div>
                        <div className="detail"><strong>Отчество:</strong>{user.patronymic}</div>
                        <div className="detail"><strong>Email:</strong>{user.email}</div>
                        <div className="detail"><strong>Логин:</strong>{user.login}</div>
                        <div className="detail"><strong>Роль:</strong>{user.role}</div>
                    </div>

                    {user.role === 'admin' && (
                        <div className="admin-panel-wrapper">
                            <Admin />
                        </div>
                    )}

                    {user.role !== 'admin' || user.email !== 'anya_shmelkova@mail.ru' ? (
                        <div>
                            <h2 className="orders-title">Ваши заказы:</h2>
                            {deleteMessage && <div className="delete-message">{deleteMessage}</div>}
                            <div className="order-list">
                                {orders.length > 0 ? (
                                    orders.sort((a, b) => new Date(b.date) - new Date(a.date)).map((order) => (
                                        <div key={order.id} className="order-item">
                                            <div><strong>Заказ №{order.id}:</strong></div>
                                            <div><strong>Наименование товара:</strong> {order.productName}</div>
                                            <div><strong>Количество:</strong> {order.quantity}</div>
                                            <div><strong>Статус:</strong> {order.status}</div>
                                            {/* Показываем причину отмены, если статус "Отмененный" */}
                                            {order.status === 'Отмененный' && order.reason && (
                                            <div>
                                            <strong>Причина отмены:</strong> {order.reason}
                                            </div>
                                            )}
                                            <div><strong>Дата заказа:</strong> {new Date(order.date).toLocaleDateString("ru-RU")}</div>
                                            <button className="delete-button" onClick={() => deleteOrder(order.id)}>Удалить заказ</button>
                                        </div>
                                    ))
                                ) : (
                                    <p>У вас нет оформленных заказов.</p>
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>
            ) : (
                <p>Пожалуйста, войдите в систему.</p>
            )}
        </div>
    );
};

export default UserProfile;