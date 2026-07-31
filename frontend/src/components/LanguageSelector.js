// frontend/src/components/LanguageSelector.js
import React from "react";

const LanguageSelector = ({ selectedLanguage, onLanguageChange }) => {
  return (
    <div style={{ margin: "10px 0", textAlign: "center" }}>
      <label
        htmlFor="language"
        style={{
          marginRight: "10px",
          fontSize: "16px",
          fontWeight: "500",
        }}
      >
        🌐 Select Language:
      </label>
      <select
        id="language"
        value={selectedLanguage}
        onChange={(e) => onLanguageChange(e.target.value)}
        style={{
          padding: "8px 12px",
          borderRadius: "5px",
          border: "1px solid #ccc",
          fontSize: "16px",
          cursor: "pointer",
          backgroundColor: "#222",
          color: "white",
        }}
      >
        <option value="english">English</option>
        <option value="hindi">Hindi</option>
        <option value="kannada">Kannada</option>
        <option value="marathi">Marathi</option>
        <option value="telugu">Telugu</option>
      </select>
    </div>
  );
};

export default LanguageSelector;
