const Promotion = require('../models/Promotion');
const User = require('../models/User');

const getAll = async (req, res) => {
  try {
    const promotions = await Promotion.find();
    res.json(promotions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getById = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) return res.status(404).json({ message: 'Not found' });
    res.json(promotion);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const create = async (req, res) => {
  try {
    const { label } = req.body;
    // Accepte academicYear ou retro-compatibilité avec year
    let academicYear = req.body.academicYear;
    if (!academicYear && req.body.year) {
      // si year était un nombre simple, on le convertit en string
      academicYear = String(req.body.year);
    }
    if (!academicYear) {
      return res.status(400).json({ message: 'academicYear is required (format YYYY-YYYY)' });
    }
    const p = await Promotion.create({ label, academicYear });
    res.status(201).json(p);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const remove = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);
    if (!promotion) return res.status(404).json({ message: 'Not found' });
    // Optionally, unset promotion on users
    await User.updateMany({ promotion: promotion._id }, { $unset: { promotion: 1 } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getStudents = async (req, res) => {
  try {
    const students = await User.find({ promotion: req.params.id, role: 'etudiant' });
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAll, getById, create, remove, getStudents };
