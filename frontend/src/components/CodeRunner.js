import React, { useRef } from "react";
import Editor from "@monaco-editor/react";
import VoiceControl from "./VoiceControl";

const API_URL = "https://ai-powered-voice-controlled-code-editor.onrender.com";

const CodeRunner = ({
  code,
  setCode,
  language,
  setLanguage,
  output,
  setOutput,
}) => {
  const isAIUpdated = useRef(false);

  // 🎙 Voice Command
  const handleVoiceCommand = async (voiceCommand) => {
    if (!voiceCommand || voiceCommand.length > 500) {
      setOutput("⚠️ Invalid or too long command.");
      return;
    }
    setOutput("🤖 Generating code via AI...");
    try {
      const res = await fetch(`${API_URL}/ai-command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: voiceCommand, language }),
      });

      const text = await res.text();
      if (text.startsWith("<!DOCTYPE") || text.startsWith("<html")) {
        throw new Error("Backend returned HTML instead of JSON (offline?)");
      }

      const data = JSON.parse(text);
      if (data.success && data.command) {
        setCode(data.command);
        isAIUpdated.current = true;
        setOutput("✅ AI generated code successfully!");
      } else {
        setOutput(`❌ AI generation failed: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      setOutput(`⚠️ Failed: ${err.message}`);
    }
  };

  // ▶ Run code
  const handleRun = async () => {
    setOutput("⏳ Running...");
    try {
      const res = await fetch(`${API_URL}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code }),
      });

      const text = await res.text();
      if (text.startsWith("<!DOCTYPE") || text.startsWith("<html")) {
        throw new Error("Backend returned HTML instead of JSON (offline?)");
      }

      const data = JSON.parse(text);
      if (data.success) setOutput(data.output);
      else setOutput(`❌ Error: ${data.output}`);
    } catch (err) {
      setOutput(`⚠️ Failed: ${err.message}`);
    }
  };

  return (
    <div>
      <VoiceControl onCommand={handleVoiceCommand} />

      <div style={{ marginBottom: "10px", display: "flex", gap: "10px" }}>
        <select
          value={language}
          onChange={(e) => {
            setLanguage(e.target.value);
            isAIUpdated.current = false;
          }}
          style={{
            padding: "8px",
            borderRadius: "5px",
            background: "#2d2d2d",
            color: "white",
            border: "1px solid #555",
          }}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
        </select>

        <button
          onClick={handleRun}
          style={{
            padding: "8px 15px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          ▶ Run Code
        </button>
      </div>

      <Editor
        height="400px"
        language={language === "cpp" ? "cpp" : language}
        theme="vs-dark"
        value={code}
        onChange={(value) => setCode(value || "")}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: "on",
        }}
      />

      <div
        style={{
          marginTop: "15px",
          background: "#111",
          color: "#0f0",
          padding: "10px",
          borderRadius: "5px",
          minHeight: "120px",
          fontFamily: "monospace",
          whiteSpace: "pre-wrap",
        }}
      >
        {output || "💻 Terminal: Waiting for execution..."}
      </div>
    </div>
  );
};

export default CodeRunner;
