import express from "express";
import multer from "multer";
import fs from "fs/promises";
import fsSync from "fs";
import axios from "axios";
import { fileURLToPath } from "url";
import path from "path";
import { IgApiClient } from "instagram-private-api";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 9001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, 'build')));

// Logger setup
const logFilePath = path.join(__dirname, "logs", "logs.txt");
const logMessage = async (message) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  await fs.appendFile(logFilePath, logEntry);
};

// Multer setup for file upload
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, "./images");
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB size limit
});

app.post("/insta", async (req, res) => {
  try {
    const { username, password, caption, imageUrl } = req.body;
    if (!username || !password || !caption || !imageUrl) {
      await logMessage("Error: Missing required fields");
      return res.status(400).json({ error: "Missing required fields" });
    }

    const fileName = `${Date.now()}-downloaded-image.jpg`;
    const filePath = path.join(__dirname, "images", fileName);

    // Download image
    const response = await axios({
      url: imageUrl,
      responseType: "stream",
    });
    const writer = fsSync.createWriteStream(filePath);
    response.data.pipe(writer);
    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    const ig = new IgApiClient();
    ig.state.generateDevice(username);
    await ig.account.login(username, password);

    const fileBuffer = await fs.readFile(filePath);

    await ig.publish.photo({
      file: fileBuffer,
      caption: String(caption),
    });

    await logMessage(
      `Success: Uploaded to Instagram by ${username} with caption "${caption}"`
    );

    res.status(200).json({ message: "Uploaded to Instagram successfully" });
  } catch (error) {
    console.error("Error uploading to Instagram: ", error);
    await logMessage(`Error: ${error.message}`);
    res.status(500).json({ error: "Failed to upload to Instagram" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
