import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ContactPage from './ContactPage';
import CatalogPage from './CatalogPage';
import './Home.css';
import flower1 from '../img/flower1.png';
import flower2 from '../img/flower2.png';
import flower3 from '../img/flower3.png';

const images = [flower1, flower2, flower3]; // Массив изображений

const Home = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // Начать исчезновение
      setTimeout(() => {
        setCurrentImage((prevIndex) => (prevIndex + 1) % images.length);
        setFade(true); // Начать появление
      }, 900); // Время исчезновения (должно совпадать с CSS transition)
    }, 4000); // Интервал смены изображения

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-container">
      <section className="home-section">
        <div className="content-container">
          <div className="text-container">
            <h1 className="main-title">ДАРИМ ЛЮБОВЬ ЧЕРЕЗ ЦВЕТЫ</h1>
            <h2 className="sub-title">
              Мы находим, создаем и доставляем вам самые свежие и великолепные цветы. 
              С нами можно учиться мастерству флориста.
            </h2>
            <div className="button-container">
              <Link to="/catalog">
                <button className="catalog-button">ПЕРЕЙТИ В КАТАЛОГ</button>
              </Link>
              <Link to="/designer">
                <button className="designer-button">КОНСТРУКТОР БУКЕТА</button>
              </Link>
            </div>
          </div>
          <div className="image-container">
            <img
              src={images[currentImage]}
              alt="Цветок"
              className={`flower-image ${fade ? "fade-in" : "fade-out"}`}
            />
          </div>
        </div>
      </section>
      <section className="catalog-section">
        <CatalogPage />
      </section>
      <section className="contact-section">
        <ContactPage />
      </section>
    </div>
  );
};

export default Home;