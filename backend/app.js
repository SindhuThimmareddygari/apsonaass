const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./auth');
const notesRoutes = require('./notes');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/api', notesRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
