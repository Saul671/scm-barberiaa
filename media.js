const express = require('express');
const multer = require('multer');
const path = require('path');
const Business = require('../models/Business');
const auth = require('../middleware/auth');
const router = express.Router();

// Configurar multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Subir imagen (barbero)
router.post('/upload', auth, upload.single('image'), async (req, res) => {
  if (req.user.role !== 'barbero') return res.status(403).json({ msg: 'Solo barbero' });
  try {
    const url = `/uploads/${req.file.filename}`;
    let business = await Business.findOne();
    if (!business) business = new Business();
    business.media.push({ type: 'image', url, desc: req.body.desc || '' });
    await business.save();
    res.json({ url, desc: req.body.desc });
  } catch (err) {
    res.status(500).send('Error al subir imagen');
  }
});

// Agregar video (URL)
router.post('/video', auth, async (req, res) => {
  if (req.user.role !== 'barbero') return res.status(403).json({ msg: 'Solo barbero' });
  try {
    const { url, desc } = req.body;
    let business = await Business.findOne();
    if (!business) business = new Business();
    business.media.push({ type: 'video', url, desc });
    await business.save();
    res.json({ msg: 'Video agregado' });
  } catch (err) {
    res.status(500).send('Error');
  }
});

// Obtener media (público)
router.get('/', async (req, res) => {
  try {
    const business = await Business.findOne();
    res.json(business?.media || []);
  } catch (err) {
    res.status(500).send('Error');
  }
});

// Eliminar media (barbero)
router.delete('/:index', auth, async (req, res) => {
  if (req.user.role !== 'barbero') return res.status(403).json({ msg: 'Solo barbero' });
  try {
    let business = await Business.findOne();
    if (!business) return res.status(404).json({ msg: 'No hay negocio' });
    const idx = parseInt(req.params.index);
    if (isNaN(idx) || idx < 0 || idx >= business.media.length)
      return res.status(400).json({ msg: 'Índice inválido' });
    business.media.splice(idx, 1);
    await business.save();
    res.json(business.media);
  } catch (err) {
    res.status(500).send('Error');
  }
});

module.exports = router;