import React, { useState } from "react";
import "./Designer.css";
import rosewhiteImage from "../img/роза_белая.png";
import rosewpinkImage from "../img/роза_розовая.png";
import rosepurpleImage from "../img/роза_сиреневая.png";
import roseredImage from "../img/роза_красная.png";
import gerberaredImage from "../img/гербера_красная.png";
import gerberayellowImage from "../img/гербера_желтая.png";
import gerberaorangedImage from "../img/гербера_оранжевая.png";
import gerberapinkImage from "../img/гербера_розовая.png";
import lilybeigeImage from "../img/лилия_бежевая.png";
import lilywhiteImage from "../img/лилия_белая.png";
import lilyyellowImage from "../img/лилия_желтая.png";
import lilyredImage from "../img/лилия_красная.png";
import lilypinkImage from "../img/лилия_розовая.png";
import chrysanthemumyellowImage from "../img/хризантема_желтая.png";
import chrysanthemumorangeImage from "../img/хризантема_оранжевая.png";
import chrysanthemumpinkImage from "../img/хризантема_розовая.png";
import carnationpinkImage from "../img/гвоздика_розовая.png";
import carnationwhiteImage from "../img/гвоздика_белая.png";
import leavesImage from "../img/рускус.png";
import ribbonImage from "../img/эвкалипт.png";
import vaseImage from "../img/ваза.png";

const flowers = [
  { id: 1, name: "Роза белая", image: rosewhiteImage, price: 250, category: "Розы" },
  { id: 2, name: "Роза розовая", image: rosewpinkImage, price: 280, category: "Розы" },
  { id: 3, name: "Роза сиреневая", image: rosepurpleImage, price: 230, category: "Розы" },
  { id: 4, name: "Роза красная", image: roseredImage, price: 300, category: "Розы" },
  { id: 5, name: "Гербера красная", image: gerberaredImage, price: 180, category: "Герберы" },
  { id: 6, name: "Гербера желтая", image: gerberayellowImage, price: 180, category: "Герберы" },
  { id: 7, name: "Гербера оранжевая", image: gerberaorangedImage, price: 190, category: "Герберы" },
  { id: 8, name: "Гербера розовая", image: gerberapinkImage, price: 150, category: "Герберы" },
  { id: 9, name: "Лилия бежевая", image: lilybeigeImage, price: 210, category: "Лилии" },
  { id: 10, name: "Лилия белая", image: lilywhiteImage, price: 230, category: "Лилии" },
  { id: 11, name: "Лилия желтая", image: lilyyellowImage, price: 250, category: "Лилии" },
  { id: 12, name: "Лилия красная", image: lilyredImage, price: 250, category: "Лилии" },
  { id: 13, name: "Лилия розовая", image: lilypinkImage, price: 270, category: "Лилии" },
  { id: 14, name: "Хризантема желтая", image: chrysanthemumyellowImage, price: 190, category: "Хризантемы" },
  { id: 15, name: "Хризантема оранжевая", image: chrysanthemumorangeImage, price: 200, category: "Хризантемы" },
  { id: 16, name: "Хризантема розовая", image: chrysanthemumpinkImage, price: 230, category: "Хризантемы" },
  { id: 17, name: "Гвоздика розовая", image: carnationpinkImage, price: 180, category: "Гвоздики" },
  { id: 18, name: "Гвоздика белая", image: carnationwhiteImage, price: 180, category: "Гвоздики" },
];

const decor = [
  { id: 1, name: "Рускус", image: leavesImage, price: 150 },
  { id: 2, name: "Эвкалипт", image: ribbonImage, price: 130 },
];

const categories = ["Все категории", "Розы", "Герберы", "Лилии", "Хризантемы", "Гвоздики"];


const generatePosition = (index, totalItems) => {
  const vaseCenterX = 127;
  const vaseCenterY = 150;
  const baseRadius = 26;
  const gapBetweenLayers = 13;
  const flowersPerLayer = 8;

  if (index === 0) {
    return {
      top: `${vaseCenterY}px`,
      left: `${vaseCenterX}px`,
      position: "absolute",
      zIndex: totalItems,
    };
  }

  let layer = Math.ceil((Math.sqrt(index) - 1) / 2);
  let angleInLayer = ((index - 1) % flowersPerLayer) / flowersPerLayer;
  let radius = baseRadius + layer * gapBetweenLayers;

  const angle = angleInLayer * 2 * Math.PI;
  const offsetX = radius * Math.cos(angle);
  const offsetY = radius * Math.sin(angle);

  return {
    top: `${vaseCenterY + offsetY}px`,
    left: `${vaseCenterX + offsetX}px`,
    position: "absolute",
    zIndex: totalItems - index,
  };
};

const Designer = ({ onAddToCart }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [filteredCategory, setFilteredCategory] = useState("Все категории");

  const addItem = (item) => {
    setSelectedItems((prev) => [...prev, item]);
  };

  const removeItem = (index) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const resetBouquet = () => {
    setSelectedItems([]);
  };

  const getTotalPrice = () =>
    selectedItems.reduce((total, item) => total + item.price, 0);

  const filteredFlowers =
    filteredCategory === "Все категории"
      ? flowers
      : flowers.filter((flower) => flower.category === filteredCategory);

      const handleAddToCart = async () => {
        let userId = localStorage.getItem('userId');
    
        if (!userId) {
            userId = prompt("Введите ваш userId (например, 1):");
            if (!userId) {
                alert("Ошибка: userId обязателен!");
                return;
            }
            localStorage.setItem('userId', userId);
        }
    
        console.log("userId из localStorage:", userId);
    
        if (selectedItems.length === 0) {
            alert("Ошибка: Букет пуст. Добавьте цветы перед отправкой.");
            return;
        }
    
        // Выбираем первый цветок в букете как "основной товар"
        const mainProduct = selectedItems[0]; 
    
        const bouquetData = {
            userId,
            bouquetName: "Сбор букета",
            productId: mainProduct.id, // Передаем первый productId из букета
            flowers: selectedItems.map(item => ({
                productId: item.id, 
                name: item.name,
                price: item.price
            })),
            totalPrice: getTotalPrice(),
            imageUrl: "/images/bouquet.png"
        };
    
        console.log("Отправка данных в корзину:", bouquetData);
    
        try {
            const response = await fetch('http://localhost:5000/api/cart/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bouquetData),
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка сервера: ${errorText}`);
            }
    
            const newItem = await response.json();
            console.log("Букет успешно добавлен в корзину:", newItem);
            alert("Букет добавлен в корзину!");
    
            setSelectedItems([]); // Сбросить выбранные элементы после добавления
        } catch (error) {
            console.error("Ошибка запроса:", error);
            alert(`Ошибка добавления букета: ${error.message}`);
        }
    };                     

  return (
    <div className="designer-container">
      <h1>Онлайн-конструктор букета</h1>
      <div className="category-buttons">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-button ${filteredCategory === category ? "active" : ""}`}
            onClick={() => setFilteredCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="designer-content">
        <div className="options">
          <h2>Цветы</h2>
          <div className="items">
            {filteredFlowers.map((flower) => (
              <div key={flower.id} className="item">
                <img src={flower.image} alt={flower.name} className="flower-image" />
                <p>{flower.name}</p>
                <p>{flower.price} ₽</p>
                <button onClick={() => addItem(flower)}>Добавить</button>
              </div>
            ))}
          </div>
          <h2>Зелень</h2>
          <div className="items">
            {decor.map((item) => (
              <div key={item.id} className="item">
                <img src={item.image} alt={item.name} className="flower-image" />
                <p>{item.name}</p>
                <p>{item.price} ₽</p>
                <button onClick={() => addItem(item)}>Добавить</button>
              </div>
            ))}
          </div>
        </div>
        <div className="bouquet">
          <h2>Ваша ваза</h2>
          <div className="vase-container">
            <img src={vaseImage} alt="Ваза" className="vase" />
            {selectedItems.map((item, index) => (
              <img
                key={index}
                src={item.image}
                alt={item.name}
                className="bouquet-item"
                style={generatePosition(index, selectedItems.length)}
                onClick={() => removeItem(index)}
              />
            ))}
          </div>
          <p>Общая стоимость: {getTotalPrice()} ₽</p>
          <div className="action-buttons">
            <button onClick={resetBouquet} className="reset-button">
              Сбросить
            </button>
            <button
            onClick={handleAddToCart}
            className="add-to-cart"
            >
            Добавить в корзину
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Designer;