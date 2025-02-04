const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const sequelize = require('./db');
const fs = require('fs');
const cors = require('cors');
const User = require('./models/User');
const CartItem = require('./models/CartItem')
const Cart = require('./models/Cart')
const Order = require('./models/Order')
const { Product, Category } = require('./models/associations');
Product.belongsTo(Category, { foreignKey: 'categoryId' });
Category.hasMany(Product, { foreignKey: 'categoryId' });

if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
    fs.mkdirSync(path.join(__dirname, 'uploads'));
}

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Настройки загрузки файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

app.post('/register', async (req, res) => {
    const { name, surname, patronymic, login, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).send({ error: "Почта уже зарегистрирована." });
        }
        const existingLogin = await User.findOne({ where: { login } });
        if (existingLogin) {
            return res.status(400).send({ error: "Логин уже занят." });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const role = email === 'anya_shmelkova@mail.ru' ? 'admin' : 'user';

        const user = await User.create({ 
            name, 
            surname, 
            patronymic, 
            login, 
            email, 
            password: hashedPassword,
            role: role
        });

        const token = jwt.sign({ id: user.id, role: user.role }, 'secretKey', { expiresIn: '1h' });
        res.status(201).json({ message: "Пользователь зарегистрирован", token });
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).send({ error: "Ошибка регистрации, попробуйте позже." });
    }
});

app.post('/login', async (req, res) => {
    const { login, password } = req.body;
    const user = await User.findOne({ where: { login } });
    
    if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).send("Неверные учетные данные");
    }
    const token = jwt.sign({ id: user.id, role: user.role }, 'secretKey');
    res.json({ token });
});

app.get('/api/users/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).send('Пользователь не найден');
        }
        res.json({ 
            id: user.id,
            name: user.name,
            surname: user.surname,
            patronymic: user.patronymic,
            email: user.email,
            login: user.login,
            role: user.role
        });
    } catch (error) {
        console.error('Ошибка получения данных пользователя:', error);
        res.status(500).send('Ошибка получения данных пользователя');
    }
});

app.post('/cart/create', async (req, res) => {
    const { userId, bouquetName, flowers, totalPrice, imageUrl } = req.body;

    try {
        // Создаем новую корзину
        const newCart = await Cart.create({
            userId,
            bouquetName,
            flowers: JSON.stringify(flowers),
            totalPrice,
            imageUrl
        });

        res.status(201).json(newCart);
    } catch (error) {
        console.error('Ошибка при создании корзины:', error);
        res.status(500).send('Ошибка при создании корзины');
    }
});

// Добавление товара в корзину
app.post('/cart/add', async (req, res) => {
    const { userId, productId, imageUrl } = req.body;

    if (!userId || !productId) {
        return res.status(400).send('Недостаточно данных');
    }

    try {
        // Проверка, если товар уже в корзине
        const existingCartItem = await CartItem.findOne({
            where: { userId, productId },
        });

        if (existingCartItem) {
            // Если товар уже есть в корзине, увеличиваем количество
            existingCartItem.count += 1;
            await existingCartItem.save();
            res.status(200).json(existingCartItem);
        } else {
            // Если товара нет в корзине, добавляем новый
            const newCartItem = await CartItem.create({
                userId,
                productId,
                imageUrl: imageUrl || '',
            });
            res.status(201).json(newCartItem);
        }
    } catch (error) {
        console.error('Ошибка при добавлении товара в корзину:', error);
        res.status(500).send('Ошибка при добавлении товара в корзину');
    }
});

app.post('/api/cart/add', async (req, res) => {
    try {
        console.log("📥 Запрос на добавление букета:", req.body);

        const { userId, bouquetName, productId, flowers, totalPrice, imageUrl } = req.body;

        if (!userId) throw new Error("❌ userId отсутствует!");
        if (!productId) throw new Error("❌ productId отсутствует!");
        if (!flowers || flowers.length === 0) throw new Error("❌ Букет пуст!");
        if (!totalPrice) throw new Error("❌ totalPrice отсутствует!");

        // СОХРАНЯЕМ БУКЕТ В БД (Главный продукт + список цветов)
        const newCartItem = await CartItem.create({
            userId,
            bouquetName,
            productId, // 🔴 ДОБАВИЛИ productId В ОСНОВНОЙ CartItem!
            flowers: JSON.stringify(flowers), // Сохраняем цветы как JSON-строку
            totalPrice,
            imageUrl
        });

        console.log("✅ Букет успешно сохранен в БД:", newCartItem);
        res.status(201).json(newCartItem);
    } catch (error) {
        console.error("❌ Ошибка при добавлении букета:", error.message);
        res.status(500).send(`Ошибка сервера: ${error.message}`);
    }
});

// Получение всех товаров из корзины
app.get('/cart/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const cartItems = await CartItem.findAll({
            where: { userId },
            include: [
                {
                    model: Product,
                    as: 'CartProduct', // Используем обновленный алиас
                    attributes: ['name', 'price', 'imageUrl'], // Данные продукта, которые будут возвращены
                },
            ],
        });

        console.log('Товары в корзине для пользователя:', cartItems);
        res.status(200).json(cartItems);
    } catch (error) {
        console.error('Ошибка при получении товаров из корзины:', error);
        res.status(500).send('Ошибка при получении товаров из корзины');
    }
});

// Обновление количества товара в корзине
app.patch('/cart/update', async (req, res) => {
    const { userId, productId, newCount } = req.body;

    if (newCount === null || newCount === undefined) {
        return res.status(400).send('Количество товара не может быть пустым.');
    }

    try {
        // Найти товар в корзине
        const cartItem = await CartItem.findOne({
            where: { userId, productId },
            include: [{ model: Product, as: 'CartProduct' }]
        });

        if (!cartItem) {
            return res.status(404).send('Товар не найден в корзине.');
        }

        // Проверка, что новое количество не превышает доступное количество товара
        const availableStock = cartItem.CartProduct.stock;
        if (newCount > availableStock) {
            return res.status(400).send(`Недоступное количество. В наличии только ${availableStock} шт.`);
        }

        // Обновление количества товара в корзине
        cartItem.count = newCount;
        await cartItem.save();

        // Отправляем обновленный товар
        res.status(200).json(cartItem); // Возвращаем обновленный товар
    } catch (error) {
        console.error('Ошибка при обновлении товара в корзине:', error);
        res.status(500).send('Ошибка при обновлении количества товара.');
    }
});

// Очистка корзины пользователя
app.delete('/cart/clear/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await CartItem.destroy({
            where: { userId },
        });

        if (result > 0) {
            console.log(`Все товары из корзины пользователя userId=${userId} удалены`);
            res.status(200).send('Корзина очищена');
        } else {
            res.status(404).send('Корзина уже пуста');
        }
    } catch (error) {
        console.error('Ошибка при очистке корзины:', error);
        res.status(500).send('Ошибка при очистке корзины');
    }
});

app.delete('/cart/:userId/:productId', async (req, res) => {
    const { userId, productId } = req.params;

    try {
        const result = await CartItem.destroy({
            where: { userId, productId },
        });

        if (result > 0) {
            console.log(`Товар с productId=${productId} удалён из корзины пользователя userId=${userId}`);
            res.status(200).send('Товар удалён из корзины');
        } else {
            res.status(404).send('Товар не найден в корзине');
        }
    } catch (error) {
        console.error('Ошибка при удалении товара из корзины:', error);
        res.status(500).send('Ошибка при удалении товара из корзины');
    }
});

app.post('/api/orders', async (req, res) => {
    const { userId, productId, quantity, status } = req.body;
    console.log('Данные для заказа:', req.body);

    if (!userId || !productId || !quantity || !status) {
        return res.status(400).send('Некорректные данные заказа');
    }

    try {
        const order = await Order.create({
            userId,
            productId,
            quantity,
            status
        });

        console.log('Заказ успешно создан:', order);
        res.status(201).json(order);
    } catch (error) {
        console.error('Ошибка создания заказа:', error);
        res.status(500).send('Ошибка создания заказа');
    }
});

app.post('/api/orders', async (req, res) => {
    const { userId, productId, quantity, status } = req.body;
    console.log('Данные для заказа:', req.body);

    if (!userId || !productId || !quantity || !status) {
        return res.status(400).send('Некорректные данные заказа');
    }

    try {
        const order = await Order.create({
            userId,
            productId,
            quantity,
            status
        });

        console.log('Заказ успешно создан:', order);
        res.status(201).json(order);
    } catch (error) {
        console.error('Ошибка создания заказа:', error);
        res.status(500).send('Ошибка создания заказа');
    }
});

app.patch('/api/orders/:orderId', async (req, res) => {
    const { orderId } = req.params;
    const { status, reason } = req.body;

    try {
        const order = await Order.findByPk(orderId, {
            include: [{ model: Product, as: 'OrderProduct' }]
        });

        if (!order) {
            return res.status(404).send('Заказ не найден');
        }

        if (status === 'Подтвержденный') {
            const product = order.OrderProduct;

            if (!product) {
                return res.status(404).send('Товар для заказа не найден');
            }

            if (product.stock < order.quantity) {
                return res.status(400).send('Недостаточно товара на складе');
            }

            product.stock -= order.quantity;
            await product.save();
        }
        // Обновляем статус заказа
        order.status = status;

        if (status === 'Отмененный' && reason) {
            order.reason = reason;
        }

        await order.save();
        res.json(order);
    } catch (error) {
        console.error('Ошибка при обновлении заказа:', error);
        res.status(500).send('Ошибка при обновлении заказа');
    }
});

app.patch('/api/orders/:id', async (req, res) => {
    const orderId = req.params.id;
    const { status, reason } = req.body;

    try {
        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Заказ не найден' });
        }

        order.status = status;
        if (reason) {
            order.reason = reason;
        }

        await order.save();
        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при обновлении заказа' });
    }
});

app.get('/api/orders/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        const orders = await Order.findAll({
            where: { userId },
            include: [
                {
                    model: Product,
                    as: 'OrderProduct', // Используем alias, который был определен в модели Order
                    attributes: ['name', 'price', 'imageUrl'],
                },
            ],
        });

        const formattedOrders = orders.map(order => ({
            id: order.id,
            productName: order.OrderProduct ? order.OrderProduct.name : 'Товар не найден',
            quantity: order.quantity,
            status: order.status,
            reason: order.reason, // Включаем поле reason в ответ
            date: order.createdAt,
        }));

        res.json(formattedOrders);  // Отправляем данные о заказах обратно в клиент
    } catch (error) {
        console.error('Ошибка получения заказов:', error);
        res.status(500).send('Ошибка получения заказов');
    }
});

app.delete('/api/orders/:orderId', async (req, res) => {
    const orderId = req.params.orderId;
    try {
        await Order.destroy({ where: { id: orderId } });
        res.sendStatus(204);
    } catch (error) {
        console.error('Ошибка удаления заказа:', error);
        res.status(500).send('Ошибка удаления заказа');
    }
});

const checkAdmin = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).send('Требуется авторизация.');

    jwt.verify(token, 'secretKey', (err, decoded) => {
        if (err) return res.status(403).send('Недействительный токен.');
        if (decoded.role !== 'admin') return res.status(403).send('Доступ запрещен.');
        req.user = decoded;
        next();
    });
}

app.get('/api/admin/orders', checkAdmin, async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [
                {
                    model: User,
                    attributes: ['name', 'surname', 'patronymic'], // Загружаем данные пользователя
                },
            ],
        });

        const orderData = orders.map(order => ({
            id: order.id,
            date: order.createdAt,
            userFullName: order.User
                ? `${order.User.name} ${order.User.surname} ${order.User.patronymic || ''}`.trim()
                : 'Не указано', // Формируем ФИО пользователя
            status: order.status,
            quantity: order.quantity || 1, // Обработайте количество, если оно отсутствует
        }));

        res.json(orderData);
    } catch (error) {
        console.error('Ошибка получения заказов:', error);
        res.status(500).send('Ошибка получения заказов');
    }
});

app.patch('/api/orders/:orderId', async (req, res) => {
    const { orderId } = req.params;
    const { status, reason } = req.body;

    try {
        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).send('Заказ не найден');
        }

        order.status = status;
        if (status === 'Отмененный' && reason) {
            order.reason = reason; // Сохраняем причину отмены
        }

        await order.save();
        res.json(order);
    } catch (error) {
        console.error('Ошибка при обновлении заказа:', error);
        res.status(500).send('Ошибка при обновлении заказа');
    }
});

app.post('/api/categories', async (req, res) => {
    const { name } = req.body;
    try {
        const category = await Category.create({ name });
        res.status(201).json(category);
    } catch (error) {
        console.error('Ошибка создания категории:', error);
        res.status(500).send('Ошибка создания категории');
    }
});

app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.json(categories);
    } catch (error) {
        console.error('Ошибка получения категорий:', error);
        res.status(500).send('Ошибка получения категорий');
    }
});

app.delete('/api/categories/:categoryId', async (req, res) => {
    const { categoryId } = req.params;

    try {
        const category = await Category.findByPk(categoryId);
        if (!category) {
            return res.status(404).send('Категория не найдена');
        }

        await Product.destroy({ where: { categoryId } });
        await Category.destroy({ where: { id: categoryId } });
        res.sendStatus(204);
    } catch (error) {
        console.error('Ошибка удаления категории:', error);
        res.status(500).send('Ошибка удаления категории');
    }
});

app.post('/api/products', upload.single('image'), async (req, res) => {
    try {
        const { name, categoryId, price, description, stock } = req.body;

        if (!name || !categoryId || !price || !description) {
            return res.status(400).send('Все поля обязательны, кроме stock.');
        }

        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        // Если stock не передан, установим его в 0
        const parsedStock = stock !== undefined ? parseInt(stock, 10) : 0;
        if (isNaN(parsedStock)) {
            return res.status(400).send('Некорректное значение stock');
        }

        const newProduct = await Product.create({
            name,
            categoryId,
            price,
            description,
            stock: parsedStock,
            imageUrl
        });

        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Ошибка добавления товара:', error);
        res.status(500).send('Ошибка добавления товара');
    }
});


app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.findAll({
            attributes: ['id', 'name', 'price', 'imageUrl', 'description', 'categoryId', 'stock'], // Включаем stock
            include: [{ model: Category, as: 'category', attributes: ['name'] }],
        });

        res.json(
            products.map(product => ({
                ...product.dataValues,
                categoryName: product.category?.name || null,
            }))
        );
    } catch (error) {
        console.error('Ошибка получения товаров:', error);
        res.status(500).send('Ошибка получения товаров');
    }
});

// Обработчик для обновления количества товара
app.patch('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, categoryId, price, description, stock } = req.body;

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ error: 'Товар не найден' });
        }

        if (name) product.name = name;
        if (categoryId) product.categoryId = parseInt(categoryId, 10);
        if (price) product.price = parseFloat(price);
        if (description) product.description = description;
        if (stock !== undefined) {
            const parsedStock = parseInt(stock, 10);
            if (isNaN(parsedStock)) {
                return res.status(400).json({ error: 'Некорректное значение stock' });
            }
            product.stock = parsedStock;
        }

        await product.save();
        res.json(product);
    } catch (error) {
        console.error('Ошибка при обновлении товара:', error);
        res.status(500).json({ error: 'Ошибка при обновлении товара' });
    }
});

app.get('/api/products/:productId', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.productId, {
            include: [{ model: Category, attributes: ['name'] }],
        });
        if (!product) return res.status(404).send('Товар не найден');
        res.json({
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            description: product.description,
            stock: product.stock,  // Убедитесь, что stock отправляется в ответ
            category: product.Category || { name: 'Без категории' },
        });
    } catch (error) {
        console.error('Ошибка получения товара:', error);
        res.status(500).send('Ошибка получения товара');
    }
});

// Редактирование товара (с обновлением stock)
app.patch('/api/products/:productId', checkAdmin, upload.single('image'), async (req, res) => {
    const { productId } = req.params;
    const { name, categoryId, price, description, stock } = req.body;

    try {
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).send('Товар не найден');
        }

        if (name) product.name = name;
        if (categoryId) product.categoryId = parseInt(categoryId, 10);
        if (price) product.price = parseFloat(price);
        if (description) product.description = description;
        if (req.file) product.imageUrl = `/uploads/${req.file.filename}`;

        if (stock !== undefined) {
            const parsedStock = parseInt(stock, 10);
            if (isNaN(parsedStock)) {
                return res.status(400).send('Некорректное значение stock');
            }
            product.stock = parsedStock;
        }

        await product.save();
        console.log('Данные продукта обновлены:', product.dataValues);

        res.json(product);
    } catch (error) {
        console.error('Ошибка редактирования продукта:', error.message);
        res.status(500).send('Ошибка редактирования продукта');
    }
});

app.delete('/api/products/:productId', checkAdmin, async (req, res) => {
    const { productId } = req.params;

    try {
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).send('Товар не найден');
        }
        await product.destroy();
        res.status(204).send();
    } catch (error) {
        console.error('Ошибка удаления товара:', error);
        res.status(500).send('Ошибка удаления товара');
    }
});

sequelize.sync({ alter: true })
  .then(() => {
    app.listen(5000, () => {
      console.log('Сервер запущен на порту 5000');
    });
  })
  .catch(err => {
    console.error('Не удалось подключиться к базе данных:', err);
  });