import React, { useState, useEffect } from "react";
import CodeRunner from "./components/CodeRunner";

function App() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [backendStatus, setBackendStatus] = useState("Checking...");

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch("https://ai-code-editor-tya1.onrender.com");
        const text = await res.text();
        if (text.includes("Backend is running")) setBackendStatus("🟢 Online");
        else setBackendStatus("🟠 Unstable");
      } catch {
        setBackendStatus("🔴 Offline");
      }
    };
    checkBackend();
  }, []);

  return (
    <div
      style={{
        backgroundColor: "#1e1e1e",
        color: "#f5f5f5",
        minHeight: "100vh",
        padding: "20px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <header style={{ textAlign: "center", marginBottom: "20px" }}>
        <h1
          style={{
            color: "#61dafb",
            fontSize: "2rem",
            marginBottom: "5px",
            animation: "pulse 2s infinite",
          }}
        >
          AI Voice Code Editor 🎙️
        </h1>
        <p style={{ color: "#aaa" }}>Speak your ideas — watch AI code them!</p>
        <div
          style={{
            marginTop: "10px",
            fontWeight: "bold",
            color:
              backendStatus === "🟢 Online"
                ? "#0f0"
                : backendStatus === "🔴 Offline"
                ? "#f33"
                : "#ffb400",
          }}
        >
          Backend: {backendStatus}
        </div>
      </header>

      <main
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "#252526",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 0 15px rgba(0,0,0,0.4)",
        }}
      >
        <CodeRunner
          code={code}
          setCode={setCode}
          language={language}
          setLanguage={setLanguage}
          output={output}
          setOutput={setOutput}
        />
      </main>

      <footer
        style={{
          textAlign: "center",
          color: "#888",
          marginTop: "20px",
          fontSize: "0.8rem",
        }}
      >
        Made with 💙 using React + OpenAI + Render
      </footer>

      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}

export default App;
