import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import styles from './Register.module.css';
const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', surname: '', patronymic: '', login: '', email: '', password: '', password_repeat: '', rules: false,
    });
    const [errors, setErrors] = useState({});
    const handleChange = ({ target: { name, value, type, checked } }) => {
        setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    };
    const validate = () => {
        const newErrors = {};
        const fields = [
            { name: 'name', regex: /^[а-яА-ЯёЁ\s\-]+$/, message: 'Должно содержать кириллицу, пробелы и тире.' },
            { name: 'surname', regex: /^[а-яА-ЯёЁ\s\-]+$/, message: 'Должно содержать кириллицу, пробелы и тире.' },
            { name: 'login', regex: /^[a-zA-Z0-9\-]+$/, message: 'Должно содержать латиницу, цифры и тире.' },
            { name: 'email', regex: /\S+@\S+\.\S+/, message: 'Почта должна быть корректной.' },
            { name: 'password', condition: (value) => value.length < 6, message: 'Должен содержать не менее 6-ти символов.' },
            { name: 'password_repeat', condition: (value) => value !== formData.password, message: 'Пароли должны совпадать.' },
            { name: 'rules', condition: (value) => !value, message: 'Вы должны согласиться с правилами регистрации.' },
        ];
        fields.forEach(({ name, regex, condition, message }) => {
            if ((regex && !formData[name].match(regex)) || (condition && condition(formData[name]))) {
                newErrors[name] = `Обязательное поле! ${message}`;
            }
        });
        return newErrors;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        
        if (Object.keys(validationErrors).length === 0) {
            try {
                const response = await api.post('/register', formData);
                const token = response.data.token;
                console.log('Токен:', token); // Добавьте это для отладки
                if (token) {
                    localStorage.setItem('token', token);
                    alert('Регистрация успешна');
                    navigate('/profile');
                } else {
                    alert('Ошибка: Токен не получен.');
                    return;
                }
            } catch (err) {
                console.error(err);
                // Используем более детальную ошибку из ответа сервера
                const errorMessage = err.response?.data?.error || 'Неизвестная ошибка';
                alert('Ошибка регистрации: ' + errorMessage);
            }
        } else {
            setErrors(validationErrors);
        }
    };    
    const renderInput = (name, type = 'text', placeholder) => (
        <div>
            <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={formData[name]}
                onChange={handleChange}
                className={`${styles.input} ${errors[name] ? styles.errorInput : ''}`}
            />
            {errors[name] && <p className={styles.error}>{errors[name]}</p>}
        </div>
    );
    return (
        <form className={styles.formContainer} onSubmit={handleSubmit}>
            <h2 className={styles.title}>Регистрация</h2>
            {renderInput('name', 'text', 'Имя')}
            {renderInput('surname', 'text', 'Фамилия')}
            {renderInput('patronymic', 'text', 'Отчество')}
            {renderInput('login', 'text', 'Логин')}
            {renderInput('email', 'email', 'Email')}
            {renderInput('password', 'password', 'Пароль')}
            {renderInput('password_repeat', 'password', 'Повторите пароль')}
            <div>
                <label>
                    <input
                        type="checkbox"
                        name="rules"
                        checked={formData.rules}
                        onChange={handleChange}
                    />{' '}
                    Я согласен на обработку персональных данных
                </label>
                {errors.rules && <p className={styles.error}>{errors.rules}</p>}
            </div>
            <button type="submit" className={styles.button}>Зарегистрироваться</button>
            <div className={styles.loginPrompt}>
                <p>Уже есть аккаунт? <Link to="/login" className={styles.loginLink}>Войдите</Link></p>
            </div>
        </form>
    );
};
export default Register;