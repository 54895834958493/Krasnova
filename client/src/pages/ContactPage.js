import React from 'react';
import './ContactPage.css';

const ContactPage = () => {
  return (
    <div className="contact-page">
      <h2>Контакты</h2>
      <div className="contact-content">
        <div className="contact-card">
          <div className="contact-info">
            <p>Мы принимаем звонки в рабочее время с 8:00 по 22:00 ежедневно:</p>
            <p><strong>Адрес:</strong> г. Владимир, Проспект Строителей, 20 Б</p>
            <p><strong>Телефон:</strong> +7 (929) 028-78-32</p>
            <p><strong>Email:</strong> krasnovaopt.ru</p>
          </div>
          <div className="map">
          <iframe src="https://yandex.ru/map-widget/v1/?um=constructor%3A98e198111dbb1fbae750b8d7da2c91d539258cf9d3d2408dd6be6d48384cfa03&amp;source=constructor" width="500" height="400" frameborder="0"></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
