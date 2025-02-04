const Product = require('./Product');
const Category = require('./Category');

Product.belongsTo(Category, { as: 'category', foreignKey: 'categoryId' });
Category.hasMany(Product, { as: 'products', foreignKey: 'categoryId' });

module.exports = { Product, Category };