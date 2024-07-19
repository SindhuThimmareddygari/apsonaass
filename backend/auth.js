const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const router = express.Router();

// Register new user
router.post('/register', (req, res) => {
  const { username, password } = req.body;
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ error: 'Failed to hash password' });

    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function (err) {
      if (err) return res.status(500).json({ error: 'Failed to register user' });
      res.status(201).json({ id: this.lastID });
    });
  });
});

// Login user
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) return res.status(500).json({ error: 'Failed to get user' });
    if (!user) return res.status(404).json({ error: 'User not found' });

    bcrypt.compare(password, user.password, (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to compare passwords' });
      if (!result) return res.status(401).json({ error: 'Invalid password' });

      const token = jwt.sign({ id: user.id, username: user.username }, 'your_jwt_secret');
      res.json({ token });
    });
  });
});

module.exports = router;
