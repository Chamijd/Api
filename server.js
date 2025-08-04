const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, "public"))); // Serve frontend

app.get("/api/facebook", async (req, res) => {
    const fbUrl = req.query.url;
    if (!fbUrl || !fbUrl.startsWith("http")) {
        return res.status(400).json({ status: false, message: "Invalid URL" });
    }

    try {
        const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
        const page = await browser.newPage();
        await page.goto(fbUrl, { waitUntil: "networkidle2", timeout: 0 });

        const videoUrl = await page.evaluate(() => {
            const video = document.querySelector("video");
            return video ? video.src : null;
        });

        await browser.close();

        if (!videoUrl) {
            return res.status(404).json({ status: false, message: "Video not found." });
        }

        res.json({
            status: true,
            result: {
                sd: videoUrl,
                hd: null
            }
        });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ status: false, message: "Internal error" });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Facebook Video Downloader API running at http://localhost:${PORT}`);
});
