import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './CatalogPage.css';

const CatalogPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [sortOption, setSortOption] = useState('newest');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsResponse, categoriesResponse] = await Promise.all([
                    fetch('http://localhost:5000/api/products'),
                    fetch('http://localhost:5000/api/categories'),
                ]);

                if (!productsResponse.ok || !categoriesResponse.ok) {
                    throw new Error('Ошибка при загрузке данных.');
                }

                const productsData = await productsResponse.json();
                const categoriesData = await categoriesResponse.json();

                setProducts(productsData);
                setCategories(categoriesData);
                setFilteredProducts(productsData);
            } catch (err) {
                console.error('Ошибка загрузки каталога:', err);
                setError('Не удалось загрузить данные. Попробуйте позже.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleCategoryClick = (categoryId) => {
        setSelectedCategory(categoryId);
    
        const updatedProducts = categoryId
            ? products.filter((product) => product.categoryId === categoryId)
            : products;
    
        setFilteredProducts(updatedProducts);
    };
    
    const handleSortChange = (option) => {
        setSortOption(option);
        const sortedProducts = [...filteredProducts].sort((a, b) => {
            switch (option) {
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'price':
                    return a.price - b.price;
                default:
                    return 0;
            }
        });
        setFilteredProducts(sortedProducts);
    };

    if (loading) {
        return <h2>Загрузка каталога...</h2>;
    }

    if (error) {
        return <h2>{error}</h2>;
    }

    return (
        <div className="catalog">
            <h2>Каталог товаров</h2>
            <div className="sidebar">
                <div className="categories">
                    <button
                        onClick={() => handleCategoryClick(null)}
                        className={!selectedCategory ? 'active' : ''}
                    >
                        Все категории
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => handleCategoryClick(category.id)}
                            className={selectedCategory === category.id ? 'active' : ''}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
                <div className="sort-options">
                    <label>Сортировка:</label>
                    <select value={sortOption} onChange={(e) => handleSortChange(e.target.value)}>
                        <option value="newest">По новизне</option>
                        <option value="name">По наименованию</option>
                        <option value="price">По цене</option>
                    </select>
                </div>
            </div>
            <div className="catalog-grid">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                        <Link
                            key={product.id}
                            to={`/product/${product.id}`}
                            className="product-card"
                        >
                            <img src={`http://localhost:5000${product.imageUrl}`} alt={product.name} />
                            <h3>{product.name}</h3>
                            <p>Цена: {product.price} руб.</p>
                            <p>Категория: {product.categoryName || 'Без категории'}</p>
                        </Link>
                    ))
                ) : (
                    <p>Нет товаров для отображения.</p>
                )}
            </div>
        </div>
    );
};

export default CatalogPage;
