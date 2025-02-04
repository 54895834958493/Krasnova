import React, { useEffect } from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, onConfirm, password, setPassword, errorMessage }) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            return () => {
                window.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Подтверждение заказа</h2>
                <input
                    type="password"
                    placeholder="Введите пароль для подтверждения заказа"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                <div>
                    <button onClick={onConfirm}>Сформировать заказ</button>
                    <button onClick={onClose}>Закрыть</button>
                </div>
            </div>
        </div>
    );
};

export default Modal;