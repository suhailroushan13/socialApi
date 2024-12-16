import express from 'express';
import { addPost, getMediumArticles } from 'medium-api-npm';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 9004;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFilePath = path.join(__dirname, 'logs', 'logs.txt');

app.use(express.json());

const logMessage = (message) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFilePath, logEntry);
};

app.post('/medium', async (req, res) => {
  const { token, html, title} = req.body;

  if (!token || !title|| !html) {
    const error = "Missing required fields";
    logMessage(error);
    return res.status(400).json({ error });
  }

  try {
    const userData = await getMediumArticles({ auth: token });

    const postData = {
      auth: token,
      title,
      html,
      canonicalUrl: `https://medium.com/@api_post`,
      tags: ['api', 'post'],
      publishStatus: 'public',
    };

    const postResponse = await addPost(postData);

    const successMessage = "Uploaded on Medium";
    console.log(successMessage);
    logMessage(successMessage);

    res.status(200).json({ message: successMessage, response: postResponse });
  } catch (error) {
    const errorMessage = `Failed to upload to Medium: ${error.message}`;
    console.error(errorMessage);
    logMessage(errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

app.listen(PORT, () => {
  const startMessage = `Server running on port ${PORT}`;
  console.log(startMessage);
  logMessage(startMessage);
});
