const express = require('express');
const cors = require('cors');
const cartRoutes = require('./routes/cart');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/cart', cartRoutes);

module.exports = app;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});