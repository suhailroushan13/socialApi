import express from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from "url";
const app = express();
const PORT = 9003;


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFilePath = path.join(__dirname, 'logs', 'logs.txt');

app.use(express.json());

const logMessage = (message) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFilePath, logEntry);
};

app.post('/linkedin', async (req, res) => {
  const {caption , urn, token} = req.body;

  if (!caption || !urn || !token) {
    const error = "Missing required fields";
    logMessage(error);
    return res.status(400).json({ error });
  }

  try {
    const response = await axios.post(
      'https://api.linkedin.com/v2/shares',
      {
      
        distribution: {
          linkedInDistributionTarget: {},
        },
        owner: `urn:li:person:${urn}`,
        subject: String(caption),
        text: {
          text: String(caption),
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(response.data);
    
    const successMessage = "Uploaded on LinkedIn";
    console.log(successMessage);
    logMessage(successMessage);

    res.status(200).json({ message: successMessage, response: response.data });
  } catch (error) {
    const errorMessage = `Failed to upload to LinkedIn: ${error.message}`;
    console.error(errorMessage);
    logMessage(errorMessage);
    res.status(500).json({ error:error});
  }
});

app.listen(PORT, () => {
  const startMessage = `Server running on port ${PORT}`;
  console.log(startMessage);
  logMessage(startMessage);
});
