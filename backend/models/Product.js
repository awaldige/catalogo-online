const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  imageUrl: { type: String, default: '' },
  stock: { type: Number, default: 0, min: 0 },
  category: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);

