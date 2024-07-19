const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your_secret_key';  // replace with your own secret key

const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'];
  if (!token) {
    return res.status(403).send('No token provided.');
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(500).send('Failed to authenticate token.');
    }

    req.userId = decoded.id;
    next();
  });
};

module.exports = { verifyToken, SECRET_KEY };
