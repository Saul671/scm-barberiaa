const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  address: String,
  phone: String,
  facebook: String,
  instagram: String,
  services: [{ name: String, price: Number }],
  promotions: [{ text: String, active: Boolean }],
  products: [{ name: String, price: Number }],
  media: [{ type: { type: String, enum: ['image', 'video'] }, url: String, desc: String }],
  bankCards: [{ bank: String, number: String, holder: String }]
});

module.exports = mongoose.model('Business', businessSchema);