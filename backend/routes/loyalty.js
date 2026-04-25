const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Extender modelo de usuario con campo loyalty (se puede hacer en el modelo, pero mejor modificar User)
// Añadimos campo loyalty al esquema User: { marked: [Boolean], active: Boolean }
// Actualicemos el modelo User:
/*
loyalty: {
    marked: { type: [Boolean], default: [false,false,false,false,false,false] },
    active: { type: Boolean, default: true }
}
*/

// Obtener tarjeta del cliente autenticado
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('loyalty');
    res.json(user.loyalty || { marked: [false,false,false,false,false,false], active: true });
  } catch (err) {
    res.status(500).send('Error del servidor');
  }
});

// Barbero obtiene tarjetas de todos los clientes
router.get('/all', auth, async (req, res) => {
  if (req.user.role !== 'barbero') return res.status(403).json({ msg: 'Solo barbero' });
  try {
    const clients = await User.find({ role: 'cliente' }).select('username loyalty');
    res.json(clients);
  } catch (err) {
    res.status(500).send('Error del servidor');
  }
});

// Barbero actualiza sellos de un cliente
router.put('/:userId', auth, async (req, res) => {
  if (req.user.role !== 'barbero') return res.status(403).json({ msg: 'Solo barbero' });
  try {
    const user = await User.findById(req.params.userId);
    if (!user || user.role !== 'cliente') return res.status(404).json({ msg: 'Cliente no encontrado' });
    user.loyalty = req.body.loyalty; // { marked: [], active: bool }
    await user.save();
    res.json(user.loyalty);
  } catch (err) {
    res.status(500).send('Error del servidor');
  }
});

module.exports = router;