import React from 'react';
import { FaVk, FaInstagram, FaPinterestP } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h2>KRASNOVA</h2>
          <p>Цветы, которые вдохновляют и радуют.</p>
        </div>
        <div className="footer-socials">
          <h3>Мы в соцсетях</h3>
          <div className="social-icons">
            <div className="icon">
              <a href="https://vk.com/krasnovaflowers" target="_blank" rel="noopener noreferrer" style={{ color: 'white' }}>
                <FaVk />
              </a>
            </div>
            <div className="icon">
              <a href="https://www.instagram.com/krasnovawedding/" target="_blank" rel="noopener noreferrer" style={{ color: 'white' }}>
                <FaInstagram />
              </a>
            </div>
            <div className="icon">
              <a href="https://ru.pinterest.com/anysheza/" target="_blank" rel="noopener noreferrer" style={{ color: 'white' }}>
                <FaPinterestP />
              </a>
            </div>
          </div>
        </div>
        <div className="footer-contacts">
          <h3>Контакты</h3>
          <p>Email: krasnovaopt.ru</p>
          <p>Телефон: +7 (929) 028-78-32</p>
          <p>Адрес: г. Владимир, Проспект Строителей, 20 Б</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Flora. Все права защищены.</p>
      </div>
    </footer>
  );
};

export default Footer;