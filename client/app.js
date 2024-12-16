import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 9000;

// Get the directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the "build" folder
app.use(express.static(path.join(__dirname, 'build')));

// Routes for redirection
app.get('/instagram', (req, res) => {
  res.redirect('https://insta.suhail.app');
});

app.get('/linkedin', (req, res) => {
  res.redirect('https://linkedin.suhail.app');
});

app.get('/medium', (req, res) => {
  res.redirect('https://medium.suhail.app');
});

app.get('/x', (req, res) => {
  res.redirect('https://x.suhail.app');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
