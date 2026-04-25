const express = require('express');
const Business = require('../models/Business');
const auth = require('../middleware/auth');
const router = express.Router();

// Obtener datos públicos
router.get('/', async (req, res) => {
  try {
    let business = await Business.findOne();
    if (!business) {
      business = new Business();
      await business.save();
    }
    res.json(business);
  } catch (err) {
    res.status(500).send('Error del servidor');
  }
});

// Actualizar (barbero)
router.put('/', auth, async (req, res) => {
  if (req.user.role !== 'barbero') return res.status(403).json({ msg: 'Solo barbero' });
  try {
    const updates = req.body;
    let business = await Business.findOne();
    if (!business) business = new Business();
    Object.assign(business, updates);
    await business.save();
    res.json(business);
  } catch (err) {
    res.status(500).send('Error del servidor');
  }
});

module.exports = router;