import React, { useState, useEffect } from 'react';
import './Admin.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
const Admin = () => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [newProduct, setNewProduct] = useState({ name: '', categoryId: '', price: '', description: '', stock: '' });
    const [editingProduct, setEditingProduct] = useState(null);
    const [image, setImage] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const { user } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        const fetchCategoriesProductsOrders = async () => {
            try {
                const [categoriesRes, productsRes, ordersRes] = await Promise.all([
                    fetch('http://localhost:5000/api/categories'),
                    fetch('http://localhost:5000/api/products'),
                    fetch('http://localhost:5000/api/admin/orders', {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                    }),
                ]);

                if (!categoriesRes.ok || !productsRes.ok || !ordersRes.ok) {
                    throw new Error('Ошибка загрузки данных с сервера');
                }
                const categoriesData = await categoriesRes.json();
                const productsData = await productsRes.json();
                const ordersData = await ordersRes.json();

                setCategories(categoriesData);
                setProducts(productsData);
                setOrders(ordersData);
            } catch (error) {
                console.error('Ошибка загрузки данных:', error);
            }
        };
        fetchCategoriesProductsOrders();
    }, [user, navigate]);
    const filteredOrders = orders.filter(order => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'new') return order.status === 'Новый';
        if (statusFilter === 'confirmed') return order.status === 'Подтвержденный';
        if (statusFilter === 'canceled') return order.status === 'Отмененный';
        return false;
    });
    const handleStatusChange = async (orderId, newStatus, reason = '') => {
        try {
            const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ status: newStatus, reason }),
            });
            if (!response.ok) {
                throw new Error('Ошибка при изменении статуса заказа');
            }
            const updatedOrder = await response.json();
            setOrders(orders.map(order => order.id === updatedOrder.id ? updatedOrder : order));
            const productsResponse = await fetch('http://localhost:5000/api/products');
            const updatedProducts = await productsResponse.json();
            setProducts(updatedProducts);
        } catch (error) {
            console.error('Ошибка при обновлении статуса заказа:', error);
        }
    };    
    const handleCancelOrder = async (orderId) => {
        const reason = prompt("Введите причину отмены заказа:");
        if (!reason) {
            alert("Причина отмены не может быть пустой!");
            return;
        }
        try {
            const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ status: 'Отмененный', reason }),
            });
    
            if (!response.ok) {
                throw new Error('Ошибка при отмене заказа');
            }
            const updatedOrder = await response.json();
            setOrders(orders.map(order => order.id === updatedOrder.id ? updatedOrder : order));
            alert("Заказ успешно отменён!");
        } catch (error) {
            console.error('Ошибка при отмене заказа:', error);
        }
    };    
    const handleAddCategory = async () => {
        if (!newCategory.trim()) {
            alert('Введите название категории!');
            return;
        }
        try {
            const response = await fetch('http://localhost:5000/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCategory }),
            });
            if (!response.ok) throw new Error('Ошибка добавления категории');
            const category = await response.json();
            setCategories([...categories, category]);
            setNewCategory('');
        } catch (error) {
            console.error('Ошибка:', error.message);
        }
    };
    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить эту категорию?')) return;
        try {
            await fetch(`http://localhost:5000/api/categories/${id}`, { method: 'DELETE' });
            setCategories(categories.filter((category) => category.id !== id));
        } catch (error) {
            console.error('Ошибка удаления категории:', error.message);
        }
    };
    const handleAddProduct = async () => {
        const { name, categoryId, price, description, stock } = newProduct;
        if (!name || !categoryId || !price || !description || stock === undefined) {
            alert('Пожалуйста, заполните все поля!');
            return;
        }
        const formData = new FormData();
        formData.append('name', name);
        formData.append('categoryId', categoryId);
        formData.append('price', parseFloat(price));
        formData.append('description', description);
        formData.append('stock', parseInt(stock, 10));
        if (image) formData.append('image', image);
        try {
            const response = await fetch('http://localhost:5000/api/products', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: formData,
            });
            if (!response.ok) {
                throw new Error('Ошибка добавления товара');
            }
            const product = await response.json();
            setProducts([...products, product]);
            setNewProduct({ name: '', categoryId: '', price: '', description: '', stock: '' });
            setImage(null);
            setSuccessMessage('Товар успешно добавлен!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Ошибка добавления товара:', error);
        }
    };
    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setNewProduct({
            name: product.name,
            categoryId: product.categoryId,
            price: product.price,
            description: product.description,
            stock: product.stock,
        });
    };
    const handleUpdateProduct = async () => {
        if (!editingProduct) return;
        const { name, categoryId, price, description, stock } = newProduct;
        if (!name || !categoryId || !price || !description || stock === undefined) {
            alert('Все поля должны быть заполнены!');
            return;
        }
        try {
            const response = await fetch(`http://localhost:5000/api/products/${editingProduct.id}`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, categoryId, price: parseFloat(price), description, stock: parseInt(stock, 10) }),
            });
            if (!response.ok) {
                throw new Error('Ошибка обновления товара');
            }
            const updatedProduct = await response.json();
            setProducts(products.map((product) => (product.id === updatedProduct.id ? updatedProduct : product)));
            setEditingProduct(null);
            setNewProduct({ name: '', categoryId: '', price: '', description: '', stock: 0 });
            setImage(null);
            setSuccessMessage('Товар успешно обновлен!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Ошибка обновления товара:', error);
        }
    };                        
    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) return;
        try {
            const response = await fetch(`http://localhost:5000/api/products/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (!response.ok) {
                throw new Error(`Ошибка удаления товара: ${response.statusText}`);
            }
            setProducts(products.filter((product) => product.id !== id));
        } catch (error) {
            console.error('Ошибка удаления товара:', error.message);
            alert('Не удалось удалить товар. Попробуйте снова.');
        }
    };
    return (
        <div className="admin-panel">
            <h1>Панель администратора</h1>
            {successMessage && <div className="success-message">{successMessage}</div>}
            <div className="order-filter">
                <label>Фильтр по статусу:</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="all">Все</option>
                    <option value="new">Новые</option>
                    <option value="confirmed">Подтвержденные</option>
                    <option value="canceled">Отмененные</option>
                </select>
            </div>
            <div className="order-list">
            <h2>Список заказов пользователей</h2>
            <ul>
                {filteredOrders.map((order) => (
                    <li key={order.id}>
                        <strong>Заказ №{order.id}</strong>
                        <p><strong>ФИО заказчика:</strong> {order.userFullName || 'Не указано'}</p>
                        <p><strong>Количество товаров:</strong> {order.quantity}</p>
                        <p><strong>Статус:</strong> {order.status}</p>
                        <p><strong>Дата заказа:</strong> {new Date(order.date).toLocaleString()}</p>
                        {order.status === 'Новый' && (
    <div>
        <button onClick={() => handleStatusChange(order.id, 'Подтвержденный')}>Подтвердить</button>
        <button onClick={() => handleCancelOrder(order.id)}>Отменить</button>
    </div>
)}
{order.status === 'Отмененный' && order.reason && (
    <p><strong>Причина отмены:</strong> {order.reason}</p>
)}
                    </li>
                ))}
            </ul>
        </div>
        <div className="category-management">
            <h2>Управление категориями</h2>
            <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Название новой категории"
            />
            <button onClick={handleAddCategory}>Добавить категорию</button>
            <ul>
                {categories.map((category) => (
                    <li key={category.id}>
                        {category.name}
                        <button onClick={() => handleDeleteCategory(category.id)}>Удалить</button>
                    </li>
                ))}
            </ul>
        </div>
        <div className="product-management">
            <h2>Управление товарами</h2>
            <div>
                <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="Название товара"
                />
                <select
                    value={newProduct.categoryId}
                    onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                >
                    <option value="">Выберите категорию</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                </select>
                <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="Цена"
                />
                <textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    placeholder="Описание"
                />
                <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    placeholder="Количество на складе"
                />
                <input type="file" onChange={(e) => setImage(e.target.files[0])} />
                <button onClick={handleAddProduct}>Добавить товар</button>
            </div>
            {editingProduct && (
                <div>
                    <h3>Редактировать товар</h3>
                        <input
                            type="text"
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                            placeholder="Название товара"
                        />
                        <select
                            value={newProduct.categoryId}
                            onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                        >
                            <option value="">Выберите категорию</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                            placeholder="Цена"
                        />
                        <textarea
                            value={newProduct.description}
                            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                            placeholder="Описание"
                        />
                        <input
                            type="number"
                            value={newProduct.stock}
                            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                            placeholder="Количество"
                        />
                        <button onClick={handleUpdateProduct}>Сохранить изменения</button>
                        <button onClick={() => setEditingProduct(null)}>Отмена</button>
                    </div>
                )}
            <ul>
                {products.map((product) => (
                    <li key={product.id}>
                        <strong>{product.name}</strong> - {product.price} руб. (В наличии: {product.stock})
                        <button onClick={() => handleEditProduct(product)}>Редактировать</button>
                        <button onClick={() => handleDeleteProduct(product.id)}>Удалить</button>
                    </li>
                ))}
            </ul>
        </div>
    </div>
);
};

export default Admin;