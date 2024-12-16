import express from 'express';
import { TwitterApi } from 'twitter-api-v2';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from "url";
const app = express();
const PORT = 9002;


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFilePath = path.join(__dirname, 'logs', 'logs.txt');
app.use(express.json());

app.use(express.static(path.join(__dirname, 'build')));

const logMessage = (message) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFilePath, logEntry);
};

app.post('/tweet', async (req, res) => {
  const { appKey, appSecret, accessToken, accessSecret, tweetText } = req.body;

  if (!appKey || !appSecret || !accessToken || !accessSecret || !tweetText) {
    const error = "Missing required fields";
    logMessage(error);
    return res.status(400).json({ error });
  }

  try {
    const client = new TwitterApi({
      appKey,
      appSecret,
      accessToken,
      accessSecret,
    });

    const tweet = await client.v2.tweet(tweetText);
    const successMessage = `Tweet posted with ID ${tweet.data.id}`;
    console.log(successMessage);
    logMessage(successMessage);

    res.status(200).json({ message: "Tweet posted successfully", tweetId: tweet.data.id });
  } catch (error) {
    const errorMessage = `Failed to post tweet: ${error}`;
    console.error(errorMessage);
    logMessage(errorMessage);
    res.status(500).json({ error: "Failed to post tweet" });
  }
});

app.listen(PORT, () => {
  const startMessage = `Server running on port ${PORT}`;
  console.log(startMessage);
  logMessage(startMessage);
});
