// models/index.js
const User = require('./User.model');
const Product = require('./Product.model');
const Supplier = require('./Supplier.model');
const Order = require('./Order.model');
const Category = require('./Category.model');

module.exports = {
    User,
    Product,
    Supplier,
    Order,
    Category
};