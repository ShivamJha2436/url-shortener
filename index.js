const express = require('express');
const mongoose = require('mongoose');
const shortid = require('shortid');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/url-shortener', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define the URL schema
const urlSchema = new mongoose.Schema({
  originalUrl: String,
  shortUrl: String,
});

const Url = mongoose.model('Url', urlSchema);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve HTML form for entering URLs
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Handle URL shortening
app.post('/shorten', async (req, res) => {
  const originalUrl = req.body.url;

  if (!originalUrl) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const existingUrl = await Url.findOne({ originalUrl });

  if (existingUrl) {
    return res.json({ shortUrl: existingUrl.shortUrl });
  }

  const shortUrl = shortid.generate();
  const newUrl = new Url({
    originalUrl,
    shortUrl,
  });

  await newUrl.save();

  res.json({ shortUrl });
});

// Redirect to the original URL
app.get('/:shortUrl', async (req, res) => {
  const shortUrl = req.params.shortUrl;
  const url = await Url.findOne({ shortUrl });

  if (!url) {
    return res.status(404).send('Not Found');
  }

  res.redirect(url.originalUrl);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
