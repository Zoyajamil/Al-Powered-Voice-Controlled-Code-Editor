import React, { useState, useRef } from "react";

const VoiceControl = ({ onCommand }) => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [speechLang, setSpeechLang] = useState("en-US");
  const recognitionRef = useRef(null);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("❌ Speech Recognition not supported in this browser.");
      return;
    }

    if (listening) return;

    const recognition = new SpeechRecognition();
    recognition.lang = speechLang;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setListening(true);
      setTranscript("");
      console.log("🎙 Listening started in", speechLang);
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) finalTranscript += result[0].transcript + " ";
      }
      if (finalTranscript) {
        setTranscript(finalTranscript.trim());
        onCommand(finalTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech error:", event.error);
      alert("🎙 Error: " + event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
      console.log("🎙 Recognition ended");
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setListening(false);
      console.log("🛑 Stopped listening");
    }
  };

  return (
    <div style={{ marginBottom: "10px" }}>
      <label>🎧 Speech Language: </label>
      <select
        value={speechLang}
        onChange={(e) => setSpeechLang(e.target.value)}
        disabled={listening}
        style={{
          marginBottom: "10px",
          padding: "8px",
          borderRadius: "5px",
          background: "#2d2d2d",
          color: "#fff",
          border: "1px solid #555",
        }}
      >
        <option value="en-US">English</option>
        <option value="kn-IN">Kannada</option>
        <option value="hi-IN">Hindi</option>
        <option value="mr-IN">Marathi</option>
        <option value="te-IN">Telugu</option>
      </select>

      <div style={{ display: "flex", gap: "10px" }}>
        {!listening ? (
          <button
            onClick={startListening}
            style={{
              background: "#28a745",
              color: "white",
              padding: "8px 15px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            🎤 Start Listening
          </button>
        ) : (
          <button
            onClick={stopListening}
            style={{
              background: "#dc3545",
              color: "white",
              padding: "8px 15px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            🛑 Stop
          </button>
        )}
      </div>

      {transcript && (
        <div
          style={{
            marginTop: "10px",
            padding: "8px",
            backgroundColor: "#333",
            borderRadius: "5px",
            color: "#fff",
          }}
        >
          🗣 {transcript}
        </div>
      )}
    </div>
  );
};

export default VoiceControl;
