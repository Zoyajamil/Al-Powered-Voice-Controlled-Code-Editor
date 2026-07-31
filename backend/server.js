import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import OpenAI from "openai";

dotenv.config();
const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ✅ Health check route
app.get("/", (req, res) => res.send("✅ Backend is running"));

// 🧠 AI code generation
app.post("/ai-command", async (req, res) => {
  const { text, language } = req.body;
  if (!language || !text || text.trim() === "") {
    return res.json({ success: true, command: "", aiGenerated: false });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `
You are a strict code generator.
The user will speak in Kannada, Hindi, Marathi, Telugu, or English.
Convert that voice input into valid, executable ${language} code.

Rules:
- Output ONLY pure ${language} code.
- Do NOT include any markdown, quotes, code blocks, or explanations.
- Do NOT use triple backticks (\`\`\`) or single quotes (''').
- Output must be exactly the raw code that can run as-is.
- If the input is unclear, make a reasonable assumption and produce best-guess working code.
`,
        },
        { role: "user", content: text },
      ],
      temperature: 0,
    });

    const aiCommand = response.choices[0].message.content.trim();
    const aiGenerated = aiCommand.length > 0;
    res.json({ success: true, command: aiCommand, aiGenerated });
  } catch (err) {
    console.error("AI Error:", err.message);
    res.json({ success: false, command: "", aiGenerated: false });
  }
});

// ⚙️ Run code safely
app.post("/run", (req, res) => {
  let { language, code } = req.body;

  if (!language || !code)
    return res.json({ success: false, output: "❌ Missing language or code" });

  language = language.toLowerCase();
  if (language === "js" || language === "node") language = "javascript";
  if (language === "c++") language = "cpp";
  if (language === "py") language = "python";

  const tempDir = path.join(process.cwd(), "temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  let fileName, cmd, args;
  if (language === "python") {
    fileName = path.join(tempDir, "temp.py");
    cmd = "python3";
    args = [fileName];
  } else if (language === "cpp") {
    fileName = path.join(tempDir, "temp.cpp");
    cmd = "g++";
    args = [fileName, "-o", path.join(tempDir, "temp.out")];
  } else if (language === "javascript") {
    fileName = path.join(tempDir, "temp.js");
    cmd = "node";
    args = [fileName];
  } else {
    return res.json({ success: false, output: "⚠️ Unsupported language" });
  }

  fs.writeFileSync(fileName, code);
  let output = "",
    error = "";

  const cleanup = () => {
    try {
      if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
      if (language === "cpp") {
        const outFile = path.join(tempDir, "temp.out");
        if (fs.existsSync(outFile)) fs.unlinkSync(outFile);
      }
    } catch {}
  };

  const timeout = setTimeout(() => {
    error += "\n⏱ Timed out (5s limit)";
  }, 5000);

  const runProcess = () => {
    if (language === "cpp") {
      const compile = spawn("g++", [
        fileName,
        "-o",
        path.join(tempDir, "temp.out"),
      ]);
      compile.stderr.on("data", (d) => (error += d.toString()));
      compile.on("close", (code) => {
        if (code !== 0) {
          cleanup();
          clearTimeout(timeout);
          return res.json({ success: false, output: error });
        }
        const exe = spawn(path.join(tempDir, "temp.out"));
        exe.stdout.on("data", (d) => (output += d.toString()));
        exe.stderr.on("data", (d) => (error += d.toString()));
        exe.on("close", () => {
          cleanup();
          clearTimeout(timeout);
          res.json({
            success: error.length === 0,
            output: output || error || "✅ Executed successfully",
          });
        });
      });
    } else {
      const proc = spawn(cmd, args);
      proc.stdout.on("data", (d) => (output += d.toString()));
      proc.stderr.on("data", (d) => (error += d.toString()));
      proc.on("close", () => {
        cleanup();
        clearTimeout(timeout);
        res.json({
          success: error.length === 0,
          output: output || error || "✅ Executed successfully",
        });
      });
    }
  };

  runProcess();
});

// 🚀 Start server
app.listen(PORT, "0.0.0.0", () =>
  console.log(`✅ Server running at http://0.0.0.0:${PORT}`)
);
