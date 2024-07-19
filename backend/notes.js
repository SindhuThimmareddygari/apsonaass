const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('./db');
const router = express.Router();

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, 'your_jwt_secret', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Get notes for a user
router.get('/notes', authenticateToken, (req, res) => {
  db.all('SELECT * FROM notes WHERE user_id = ? AND archived = 0', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to retrieve notes' });
    res.json(rows);
  });
});

// Create a note
router.post('/notes', authenticateToken, (req, res) => {
  const { title, content, tags } = req.body;
  db.run('INSERT INTO notes (user_id, title, content, tags) VALUES (?, ?, ?, ?)', [req.user.id, title, content, tags], function (err) {
    if (err) return res.status(500).json({ error: 'Failed to create note' });
    res.status(201).json({ id: this.lastID });
  });
});

// Archive a note
router.put('/notes/:id/archive', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run('UPDATE notes SET archived = 1 WHERE id = ? AND user_id = ?', [id, req.user.id], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to archive note' });
    res.status(200).json({ message: 'Note archived' });
  });
});

// Delete a note
router.delete('/notes/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM notes WHERE id = ? AND user_id = ?', [id, req.user.id], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to delete note' });
    res.status(200).json({ message: 'Note deleted' });
  });
});

module.exports = router;
