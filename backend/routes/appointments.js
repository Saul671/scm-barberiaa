const express = require('express');
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');
const router = express.Router();

// Obtener citas según rol
router.get('/', auth, async (req, res) => {
  try {
    let appointments;
    if (req.user.role === 'barbero') {
      appointments = await Appointment.find().populate('client', 'username name');
    } else {
      appointments = await Appointment.find({ client: req.user.id });
    }
    res.json(appointments);
  } catch (err) {
    res.status(500).send('Error del servidor');
  }
});

// Crear cita (cliente)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'cliente') return res.status(403).json({ msg: 'Solo clientes' });
  try {
    const newApp = new Appointment({
      client: req.user.id,
      date: req.body.date,
      status: 'pendiente'
    });
    await newApp.save();
    res.json(newApp);
  } catch (err) {
    res.status(500).send('Error del servidor');
  }
});

// Actualizar estado (barbero)
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'barbero') return res.status(403).json({ msg: 'Solo barbero' });
  try {
    const app = await Appointment.findById(req.params.id);
    if (!app) return res.status(404).json({ msg: 'Cita no encontrada' });
    app.status = req.body.status;
    await app.save();
    res.json(app);
  } catch (err) {
    res.status(500).send('Error del servidor');
  }
});

// Eliminar cita (cliente solo las suyas)
router.delete('/:id', auth, async (req, res) => {
  try {
    const app = await Appointment.findById(req.params.id);
    if (!app) return res.status(404).json({ msg: 'No encontrada' });
    if (req.user.role === 'cliente' && app.client.toString() !== req.user.id)
      return res.status(403).json({ msg: 'No autorizado' });
    await app.remove();
    res.json({ msg: 'Cita eliminada' });
  } catch (err) {
    res.status(500).send('Error del servidor');
  }
});

module.exports = router;