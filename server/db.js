const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('mydatabase', 'postgres', '12345678910', {
    host: 'localhost',
    port: '5432',
    dialect: 'postgres'
});
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection to the database has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};
testConnection();
module.exports = sequelize;