import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pdfParse from "pdf-parse-fork";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5004;

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf" || file.mimetype === "text/plain") {
            cb(null, true);
        } else {
            cb(new Error("Only PDF and TXT files are allowed"));
        }
    }
});

app.get("/", (req, res) => {
    res.json({ message: "Server is running" });
});

app.post("/simplify", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const filePath = req.file.path;
        console.log("Processing file:", req.file.originalname);

        let text = "";
        try {
            if (req.file.mimetype === "application/pdf") {
                const dataBuffer = fs.readFileSync(filePath);
                const pdfData = await pdfParse(dataBuffer);
                text = pdfData.text;
            } else {
                text = fs.readFileSync(filePath, "utf8");
            }

            fs.unlinkSync(filePath);
            res.json({
                simplifiedText: `Extracted text (${text.length} characters):\n\n${text.substring(0, 1000)}...`
            });
        } catch (err) {
            console.error("File processing error:", err);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            return res.status(500).json({ error: "Failed to process file", details: err.message });
        }
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message });
});

const server = app.listen(port, "0.0.0.0", () => {
    console.log(`Backend running on http://localhost:${port}`);
}).on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        console.error(`Port ${port} is already in use`);
    } else {
        console.error("Server error:", err);
    }
});
