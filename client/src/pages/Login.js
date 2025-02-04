import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import styles from './Login.module.css';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ login: '', password: '' });
    const [errors, setErrors] = useState({});

    const handleChange = ({ target: { name, value } }) => {
        setFormData({ ...formData, [name]: value });
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!formData.login) newErrors.login = 'Введите логин!';
        if (!formData.password) newErrors.password = 'Введите пароль!';
        if (Object.keys(newErrors).length) {
            setErrors(newErrors);
            return;
        }
        try {
            const response = await api.post('/login', formData);
            localStorage.setItem('token', response.data.token);
            alert('Авторизация успешна');
            navigate('/profile');
        } catch (err) {
            console.error(err);
            if (err.response) {
                setErrors({ general: err.response.data.error || 'Ошибка авторизации' });
            } else {
                setErrors({ general: 'Ошибка сети' });
            }
        }
    };
    return (
        <div className={styles.formContainer}>
            <h2 className={styles.title}>Авторизация</h2>
            <form onSubmit={handleSubmit}>
                {['login', 'password'].map((field) => (
                    <div key={field} className={styles.inputContainer}>
                        <input
                            type={field === 'password' ? 'password' : 'text'}
                            name={field}
                            placeholder={field === 'login' ? 'Логин' : 'Пароль'}
                            value={formData[field]}
                            onChange={handleChange}
                            className={`${styles.inputField} ${errors[field] ? styles.errorInput : ''}`}
                        />
                        {errors[field] && <span className={styles.error}>{errors[field]}</span>}
                    </div>
                ))}
                <button type="submit" className={styles.button}>Войти</button>
                {errors.general && <p className={styles.error}>{errors.general}</p>}
            </form>
            <div className={styles.registerContainer}>
                <p className={styles.registerText}>
                    Нет аккаунта? 
                    <Link to="/register" className={styles.registerLink}>Зарегистрируйтесь</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;